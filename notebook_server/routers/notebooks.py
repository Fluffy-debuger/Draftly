# routers/notebooks.py  (updated with /listAllnotes, /kernelinfo, /delete, /notebooks, /close)

import docker
from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from pathlib import Path
import uuid
import json
import os
import shutil
import requests
from datetime import datetime
import humanize
import time

from config import settings
from dependencies import get_docker_client
from services.notebook_service import create_notebook_metadata_and_folders, Config
from services.docker_service import start_notebook_container, container_map
from utils.paths import validate_name, safe_join_path

router = APIRouter()

class CreateNotebookRequest(BaseModel):
    userID: str
    notebookId: str | None = None

@router.post("/create")
async def create_notebook(
    req: CreateNotebookRequest,
    docker_client = Depends(get_docker_client)
):
    user_id = req.userID
    notebook_id = req.notebookId or str(uuid.uuid4())[:8]

    if not validate_name(user_id) or not validate_name(notebook_id):
        raise HTTPException(400, "userID and notebookId must be alphanumeric or underscore")

    notebook_folder = safe_join_path(settings.UPLOAD_ROOT, user_id, notebook_id)
    metadata_path = notebook_folder / f"{notebook_id}.json"
    create_notebook_metadata_and_folders(notebook_folder, metadata_path, user_id, notebook_id)
    (notebook_folder / "assets").mkdir(exist_ok=True)
    (notebook_folder / "cells").mkdir(exist_ok=True)
    start_notebook_container(docker_client, notebook_id, user_id, notebook_folder)

    return {
        "notebook_id": notebook_id,
        "status": "created"
    }


def relative_time(ts: float) -> str:
    return humanize.naturaltime(time.time() - ts)


def scan_path(path: str):
    result = []
    for entry in os.scandir(path):
        stat = entry.stat()
        item = {
            "name": entry.name,
            "type": "folder" if entry.is_dir() else "file",
            "createdTime": relative_time(stat.st_ctime),     
            "lastEditedTime": relative_time(stat.st_mtime)   
        }

        if entry.is_dir():
            item["innerContent"] = scan_path(entry.path)

        result.append(item)

    return result


class UserRequest(BaseModel):
    userID: str


@router.post("/listAllnotes")
async def list_all_notes(
    payload: UserRequest
):
    user_id = payload.userID

    if not validate_name(user_id):
        raise HTTPException(400, "Invalid userID")

    user_folder = safe_join_path(settings.UPLOAD_ROOT, user_id)

    try:
        notes = scan_path(str(user_folder))
    except FileNotFoundError:
        notes = []
    except Exception as exc:
        raise HTTPException(500, f"Cannot scan notebooks: {exc}")

    return {"allNotes": notes}


class NotebookRequest(BaseModel):
    notebookID: str


@router.post("/kernelinfo")
async def fetch_kernel_info(
    payload: NotebookRequest
):
    notebook_id = payload.notebookID

    if not validate_name(notebook_id):
        raise HTTPException(400, "Invalid notebookID")

    if notebook_id not in container_map:
        return {"error": "Notebook not found"}

    try:
        res = requests.post(f"{settings.EXECUTION_SERVER_URL}/containerinfo")
        res.raise_for_status()
        return res.json()
    except requests.RequestException as exc:
        return {"error": f"Execution failed: {str(exc)}"}


class DeleteNotebookRequest(BaseModel):
    userID: str
    notebookID: str


@router.post("/delete")
async def delete_notebook(
    payload: DeleteNotebookRequest,
    docker_client = Depends(get_docker_client)
):
    user_id = payload.userID
    notebook_id = payload.notebookID

    if not validate_name(user_id) or not validate_name(notebook_id):
        raise HTTPException(400, "Invalid userID or notebookID")

    directory_path = safe_join_path(settings.UPLOAD_ROOT, user_id, notebook_id)

    if directory_path.exists():
        try:
            shutil.rmtree(directory_path)
            container = docker_client.containers.get(notebook_id)
            if container.status == "running":
                container.stop()
        except docker.errors.NotFound:
            pass
        except Exception as exc:
            raise HTTPException(500, f"Failed to delete notebook: {exc}")
    else:
        return {"status": f"{notebook_id} does not exist"}

    return {"status": f"{notebook_id} deleted !"}


class CloseContainerRequest(BaseModel):
    notebook_id: str


@router.post("/close")
async def close_container(
    payload: CloseContainerRequest,
    docker_client = Depends(get_docker_client)
):
    notebook_id = payload.notebook_id

    if not validate_name(notebook_id):
        raise HTTPException(400, "Invalid notebook_id")

    try:
        container = docker_client.containers.get(notebook_id)
        container.stop()
        container.remove()

        if notebook_id in container_map:
            del container_map[notebook_id]

        return {"status": "deleted"}
    except docker.errors.NotFound:
        return {"error": "not found"}
    except Exception as exc:
        raise HTTPException(500, f"Failed to close container: {exc}")


class FetchCellsRequest(BaseModel):
    UserID: str
    NotebookID: str


@router.post("/notebooks")
async def fetch_cells(
    payload: FetchCellsRequest
):
    user_id = payload.UserID
    notebook_id = payload.NotebookID

    if not validate_name(user_id) or not validate_name(notebook_id):
        raise HTTPException(400, "Invalid UserID or NotebookID")

    meta_path = safe_join_path(settings.UPLOAD_ROOT, user_id, notebook_id, f"{notebook_id}.json")

    if not meta_path.exists():
        raise HTTPException(404, "Notebook not found")

    try:
        cfg = Config(str(meta_path))
        cells = cfg.data.get("Cells", [])
        return {"cells": cells}
    except Exception as exc:
        raise HTTPException(500, f"Failed to fetch cells: {exc}")