import datetime
import os
import base64
import uuid
import logging
import asyncio
import signal
import sys
from contextlib import asynccontextmanager
from typing import List, Dict, Any
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from jupyter_client import KernelManager
from jupyter_client.manager import start_new_kernel
from queue import Empty


logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Notebook Kernel Execution Server",
    description="Jupyter kernel backend for code execution",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

kernel_manager: KernelManager = None
kernel_client = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global kernel_manager, kernel_client

    logger.info("Starting Jupyter kernel...")
    try:
        kernel_manager, kernel_client = start_new_kernel(
            kernel_name="python3",
            extra_arguments=["--matplotlib=inline"]
        )
        logger.info("Kernel started successfully")
        kernel_client.execute("%matplotlib inline", silent=True)

    except Exception as e:
        logger.critical("Failed to start kernel", exc_info=True)
        raise RuntimeError("Kernel startup failed") from e

    yield
    # Shutdown
    logger.info("Shutting down kernel...")
    try:
        if kernel_client:
            kernel_client.stop_channels()
        if kernel_manager:
            kernel_manager.shutdown_kernel(now=True)
        logger.info("Kernel shutdown complete")
    except Exception as e:
        logger.warning("Error during kernel shutdown", exc_info=True)


app.router.lifespan_context = lifespan

async def execute_and_collect(code: str, timeout: float = 120.0) -> List[Dict[str, Any]]:
    if not kernel_client:
        raise RuntimeError("Kernel not initialized")

    msg_id = kernel_client.execute(code, silent=False, store_history=True)

    outputs: List[Dict[str, Any]] = []
    execution_done = False

    try:
        while not execution_done:
            try:
                msg = kernel_client.get_iopub_msg(timeout=1.0)

                if msg["parent_header"].get("msg_id") != msg_id:
                    continue

                msg_type = msg["header"]["msg_type"]
                content = msg["content"]

                if msg_type == "stream":
                    outputs.append({
                        "type": "stream",
                        "name": content.get("name", "stdout"),
                        "text": content.get("text", "")
                    })

                elif msg_type == "execute_result":
                    data = content.get("data", {})
                    outputs.append({
                        "type": "execute_result",
                        "data": data,
                        "metadata": content.get("metadata", {})
                    })
                    if "image/png" in data:
                        outputs.append({
                            "type": "image",
                            "base64": data["image/png"]
                        })

                elif msg_type == "display_data":
                    data = content.get("data", {})
                    if "image/png" in data:
                        outputs.append({
                            "type": "image",
                            "base64": data["image/png"]
                        })

                elif msg_type == "error":
                    outputs.append({
                        "type": "error",
                        "ename": content.get("ename"),
                        "evalue": content.get("evalue"),
                        "traceback": content.get("traceback", [])
                    })
                elif msg_type == "status":
                    if content["execution_state"] == "idle":
                        execution_done = True

            except Empty:
                continue

            except Exception as e:
                logger.error("Error reading iopub message", exc_info=True)
                outputs.append({
                    "type": "error",
                    "ename": "KernelCommunicationError",
                    "evalue": str(e),
                    "traceback": []
                })
                break

    except asyncio.TimeoutError:
        logger.warning("Execution timeout")
        outputs.append({
            "type": "error",
            "ename": "TimeoutError",
            "evalue": f"Execution timed out after {timeout} seconds",
            "traceback": []
        })
        kernel_client.kernel_client.interrupt_kernel()

    return outputs

@app.post("/execute")
async def execute_code(request: Request):
    try:
        data = await request.json()
        code = data.get("code", "")
        nId = data.get("nId")          
        userID = data.get("userID")

        if not code.strip():
            return {"output": [{"type": "stream", "text": "No code provided"}]}

        logger.info(f"Executing code for notebook {nId} by user {userID} (length: {len(code)})")

        outputs = await execute_and_collect(code, timeout=120.0)

        return {"output": outputs}

    except Exception as e:
        logger.exception("Execution endpoint failed")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
async def health_check():
    if kernel_manager and kernel_manager.is_alive():
        return {
            "status": "healthy",
            "kernel": "alive",
            "kernel_name": kernel_manager.kernel_name,
            "uptime": str(datetime.datetime.now() - kernel_manager.start_time)
        }
    else:
        raise HTTPException(status_code=503, detail="Kernel not running")


@app.get("/kernelstatus")
async def kernel_status():
    if not kernel_manager:
        return {"status": "not_started"}

    return {
        "alive": kernel_manager.is_alive(),
        "kernel_name": kernel_manager.kernel_name,
        "execution_state": kernel_client.kernel_client.get_shell_msg(timeout=1.0)["content"].get("execution_state", "unknown") if kernel_client else "unknown",
        "memory_usage_mb": psutil.Process(kernel_manager.kernel.pid).memory_info().rss / 1024**2 if kernel_manager.kernel.pid else 0
    }


@app.post("/containerinfo")
async def container_info():
    process = psutil.Process()
    return {
        "container_id": os.uname().nodename,
        "pid": os.getpid(),
        "started_at": datetime.datetime.fromtimestamp(process.create_time()).isoformat(),
        "cpu_percent": psutil.cpu_percent(interval=0.1),
        "memory_usage": {
            "rss_mb": process.memory_info().rss / 1024**2,
            "vms_mb": process.memory_info().vms / 1024**2
        },
        "threads": len(process.threads())
    }


def handle_shutdown(sig=None, frame=None):
    logger.info(f"Received shutdown signal {sig}, stopping kernel...")
    if kernel_manager:
        try:
            kernel_manager.shutdown_kernel(now=True)
        except:
            pass
    sys.exit(0)


signal.signal(signal.SIGINT, handle_shutdown)
signal.signal(signal.SIGTERM, handle_shutdown)