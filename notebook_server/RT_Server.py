import os
import json
import uuid
import logging
import tempfile
from fastapi import FastAPI, Request, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)
notebook_rooms = {}

async def connect_to_room(websocket: WebSocket, notebook_id: str):
    await websocket.accept()
    if notebook_id not in notebook_rooms:
        notebook_rooms[notebook_id] = []
    notebook_rooms[notebook_id].append(websocket)

def disconnect_from_room(websocket: WebSocket, notebook_id: str):
    if notebook_id in notebook_rooms:
        notebook_rooms[notebook_id].remove(websocket)
        if not notebook_rooms[notebook_id]:
            del notebook_rooms[notebook_id]

async def broadcast_to_notebook(notebook_id: str, message: dict):
    if notebook_id in notebook_rooms:
        for connection in notebook_rooms[notebook_id]:
            try:
                await connection.send_json(message)
            except Exception:
                continue

def get_ordered_cells(base_path, notebook_id):
    meta_path = os.path.join(base_path, f"{notebook_id}.json")
    if not os.path.exists(meta_path):
        return []
    
    with open(meta_path, "r") as f:
        meta = json.load(f)
        order = meta.get("cell_order", [])

    cells = []
    for cID in order:
        c_path = os.path.join(base_path, "cells", f"{cID}.json")
        if os.path.exists(c_path):
            with open(c_path, "r") as f:
                cells.append(json.load(f))
    return cells

@app.websocket("/ws/notebook/{notebook_id}")
async def notebook_socket(websocket: WebSocket, notebook_id: str):
    await connect_to_room(websocket, notebook_id)
    try:
        while True:
            await websocket.receive_text() 
    except WebSocketDisconnect:
        disconnect_from_room(websocket, notebook_id)

@app.post("/notebooks")
async def fetch_notebook(req: Request):
    data = await req.json()
    uID, nID = data.get("UserID"), data.get("NotebookID")
    base = os.path.abspath(f"notebooks/uploads/{uID}/{nID}")
    
    cells = get_ordered_cells(base, nID)
    return JSONResponse({"cells": cells})

@app.post("/addCell")
async def add_cell(req: Request):
    data = await req.json()
    uID, nID, cType = data.get("userID"), data.get("notebookID"), data.get("cellType")
    
    base_path = os.path.abspath(f"notebooks/uploads/{uID}/{nID}")
    cells_dir = os.path.join(base_path, "cells")
    meta_path = os.path.join(base_path, f"{nID}.json")
    
    os.makedirs(cells_dir, exist_ok=True)
    
    cell_id = str(uuid.uuid4())
    cell_data = {
        "cellID": cell_id,
        "cell": cType,
        "CellData": {"Data": "", "result": ""}
    }
    with open(os.path.join(cells_dir, f"{cell_id}.json"), "w") as f:
        json.dump(cell_data, f, indent=2)

    if os.path.exists(meta_path):
        with open(meta_path, "r") as f:
            meta = json.load(f)
        
        meta.setdefault("cell_order", []).append(cell_id)
        with tempfile.NamedTemporaryFile('w', dir=base_path, delete=False) as tf:
            json.dump(meta, tf, indent=2)
            temp_name = tf.name
        os.replace(temp_name, meta_path)

    ordered_cells = get_ordered_cells(base_path, nID)
    await broadcast_to_notebook(nID, {"type": "CELLS_UPDATED", "cells": ordered_cells})
    
    return JSONResponse({"cell": cell_data})

@app.post("/saveCellData")
async def save_cell_data(req: Request):
    data = await req.json()
    uID, nID, cID = data.get("userID"), data.get("notebookID"), data.get("cellID")
    
    cell_path = os.path.abspath(f"notebooks/uploads/{uID}/{nID}/cells/{cID}.json")

    if not os.path.exists(cell_path):
        raise HTTPException(404, "Cell not found")

    with open(cell_path, "r") as f:
        cell = json.load(f)
    
    cell["CellData"] = {"Data": data.get("code"), "result": data.get("output")}
    print(data.get("code"))
    print(data.get("output"))

    with open(cell_path, "w") as f:
        json.dump(cell, f, indent=2)
    
    return {"status": "success"}

@app.post("/deleteCodeCell")
async def delete_cell(req: Request):
    data = await req.json()
    uID, nID, cID = data.get("userID"), data.get("notebookID"), data.get("cellID")
    
    base_path = os.path.abspath(f"notebooks/uploads/{uID}/{nID}")
    meta_path = os.path.join(base_path, f"{nID}.json")
    cell_file = os.path.join(base_path, "cells", f"{cID}.json")
    if os.path.exists(meta_path):
        with open(meta_path, "r") as f:
            meta = json.load(f)
        
        if cID in meta.get("cell_order", []):
            meta["cell_order"].remove(cID)
            with tempfile.NamedTemporaryFile('w', dir=base_path, delete=False) as tf:
                json.dump(meta, tf, indent=2)
                temp_name = tf.name
            os.replace(temp_name, meta_path)
    if os.path.exists(cell_file):
        os.remove(cell_file)
    ordered_cells = get_ordered_cells(base_path, nID)
    await broadcast_to_notebook(nID, {"type": "CELLS_UPDATED", "cells": ordered_cells})

    return {"status": f"{cID} deleted successfully"}