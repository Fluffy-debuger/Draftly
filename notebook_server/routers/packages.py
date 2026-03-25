import json

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from fastapi.responses import JSONResponse

from dependencies import get_docker_client
from services.docker_service import container_map

router = APIRouter()

class PackageAction(BaseModel):
    notebook_id: str
    package: str | None = None


@router.post("/installPackage")
async def install_package(
    payload: PackageAction,
    docker_client = Depends(get_docker_client)
):
    if not payload.notebook_id:
        raise HTTPException(400, "notebook_id is required")

    info = container_map.get(payload.notebook_id)
    if not info or "container" not in info:
        raise HTTPException(404, "Notebook container not found or not running")

    container = info["container"]

    if not payload.package:
        raise HTTPException(400, "package name is required")

    try:
        result = container.exec_run(
            f"/app/venv/bin/pip install {payload.package} --no-cache-dir",
            tty=False,
            stream=True
        )

        output_lines = []
        for chunk in result.output:
            if chunk:
                output_lines.append(chunk.decode("utf-8", errors="replace").strip())

        return {
            "status": "ok" if result.exit_code == 0 else "error",
            "output": "\n".join(output_lines)
        }

    except Exception as exc:
        raise HTTPException(500, f"Package installation failed: {exc}")


@router.post("/listAllPackages")
async def list_packages(
    payload: PackageAction,
    docker_client = Depends(get_docker_client)
):
    if not payload.notebook_id:
        raise HTTPException(400, "notebook_id is required")

    info = container_map.get(payload.notebook_id)
    if not info or "container" not in info:
        raise HTTPException(404, "Notebook container not found or not running")

    container = info["container"]

    try:
        result = container.exec_run("pip list --format=json", tty=False)
        raw = result.output.decode("utf-8")

        try:
            packages = json.loads(raw)
            return {"res": packages}
        except json.JSONDecodeError:
            lines = raw.splitlines()[2:]  
            parsed = []
            for line in lines:
                parts = line.split()
                if len(parts) >= 2:
                    parsed.append({"name": parts[0], "version": parts[1]})
            return {"res": parsed}

    except Exception as exc:
        raise HTTPException(500, f"Cannot list packages: {exc}")