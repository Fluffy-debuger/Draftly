from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
import requests

from config import settings
from dependencies import get_docker_client
from services.notebook_service import Config
from utils.paths import safe_join_path

router = APIRouter()

class ExecuteCodeRequest(BaseModel):
    nId: str
    code: str = ""
    userID: str


@router.post("/execute")
async def execute_code(payload: ExecuteCodeRequest):
    """
    Forward code exe req to the fixed execution server (MS container)
    """
    meta_path = safe_join_path(
        settings.UPLOAD_ROOT,
        payload.userID,
        payload.nId,
        f"{payload.nId}.json"
    )
    try:
        cfg=Config(meta_path)
        usersecreats=cfg.data['Secrets']
        #print(f"{usersecreats}")
        code=f"secrets= {str(usersecreats)}"+'\n'+payload.code
        print(code)
        response = requests.post(
            f"{settings.EXECUTION_SERVER_URL}/execute",
            json={
                "nId": payload.nId,
                "code": code,
                "userID": payload.userID
            },
            timeout=30
        )
        response.raise_for_status()
        return response.json()

    except requests.RequestException as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Execution server error: {str(exc)}"
        )
    except ValueError:
        raise HTTPException(
            status_code=500,
            detail="Invalid response from execution server"
        )