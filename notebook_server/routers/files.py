from fastapi import APIRouter, File, Form, HTTPException, UploadFile, Request
from fastapi.responses import JSONResponse
from pathlib import Path
import os
import shutil
from config import settings
from utils.paths import validate_name, safe_join_path

router = APIRouter()

@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    notebookID: str = Form(...),
    containerName: str = Form(...),
    userID: str = Form(...)
):
    if not validate_name(userID) or not validate_name(notebookID):
        raise HTTPException(400, "Invalid userID or notebookID")
    assets_dir = safe_join_path(
        settings.UPLOAD_ROOT,
        userID,
        notebookID,
        "assets"
    )

    try:
        assets_dir.mkdir(parents=True, exist_ok=True)
    except Exception as exc:
        raise HTTPException(500, f"Cannot create assets directory: {exc}")

    target_path = assets_dir / file.filename

    try:
        with target_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as exc:
        raise HTTPException(500, f"Failed to save file: {exc}")

    return {"filename": file.filename, "path": str(target_path.relative_to(settings.UPLOAD_ROOT))}


@router.post("/listFiles")
async def list_files(payload: dict):
    notebookID = payload.get("notebookID")
    userID    = payload.get("userID")

    if not notebookID or not userID:
        raise HTTPException(400, "notebookID and userID are required")

    if not validate_name(userID) or not validate_name(notebookID):
        raise HTTPException(400, "Invalid userID or notebookID")

    root = safe_join_path(settings.UPLOAD_ROOT, userID, notebookID, "assets")

    if not root.exists() or not root.is_dir():
        return JSONResponse(
            status_code=404,
            content={"error": "Notebook assets folder not found"}
        )

    try:
        files = [
            {"filename": entry.name, "path": f"./uploads/assets/{entry.name}"}
            for entry in os.scandir(root)
            if entry.is_file()
        ]
        return {"res": files}
    except Exception as exc:
        raise HTTPException(500, f"Cannot list files: {exc}")