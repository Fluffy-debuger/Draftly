from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from fastapi.responses import JSONResponse
from pathlib import Path

from config import settings
from utils.paths import validate_name, safe_join_path
from services.notebook_service import Config

router = APIRouter()

class SecretAdd(BaseModel):
    ContainerID: str
    userID: str
    key: str
    value: str


@router.post("/addSecretes")
async def add_secret(payload: SecretAdd):
    if not all(validate_name(x) for x in [payload.userID, payload.ContainerID]):
        raise HTTPException(400, "Invalid userID or ContainerID")

    meta_path = safe_join_path(
        settings.UPLOAD_ROOT,
        payload.userID,
        payload.ContainerID,
        f"{payload.ContainerID}.json"
    )

    if not meta_path.is_file():
        raise HTTPException(404, "Notebook metadata not found")

    try:
        cfg = Config(str(meta_path))
        cfg.data.setdefault("Secrets", {})
        cfg.data["Secrets"][payload.key] = payload.value
        cfg.save()
        return {"status": "secret added"}
    except Exception as exc:
        raise HTTPException(500, f"Failed to save secret: {exc}")


class SecretList(BaseModel):
    userID: str
    notebookID: str


@router.post("/fetchallsecretes")
async def list_secrets(payload: SecretList):
    if not all(validate_name(x) for x in [payload.userID, payload.notebookID]):
        raise HTTPException(400, "Invalid userID or notebookID")

    meta_path = safe_join_path(
        settings.UPLOAD_ROOT,
        payload.userID,
        payload.notebookID,
        f"{payload.notebookID}.json"
    )

    if not meta_path.is_file():
        raise HTTPException(404, "Notebook metadata not found")

    try:
        cfg = Config(str(meta_path))
        secrets = cfg.data.get("Secrets", {})
        result = [{"key": k, "value": v} for k, v in secrets.items()]
        return {"data": result}
    except Exception as exc:
        raise HTTPException(500, f"Cannot read secrets: {exc}")