from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from datetime import datetime
from routers import notebooks, execution, files, packages, secrets

from config import settings

app = FastAPI(
    title="Notebook Execution Backend",
    description="Multi-user notebook server with Docker-based execution",
    version="0.1.0",
    docs_url="/docs" if settings.DEBUG else None,          
    redoc_url=None,                                       
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#static dirs
app.mount("/plots", StaticFiles(directory="plots", html=False), name="plots")
app.mount("/assets", StaticFiles(directory="notebooks/uploads", html=False), name="assets")

app.include_router(notebooks.router,   prefix="/api", tags=["notebooks"])
app.include_router(execution.router,   prefix="/api", tags=["execution"])
app.include_router(files.router,       prefix="/api", tags=["files"])
app.include_router(packages.router,    prefix="/api", tags=["packages"])
app.include_router(secrets.router,     prefix="/api", tags=["secrets"])


@app.get("/health")
@app.get("/")
async def health_check():
    return {
        "status": "healthy",
        "version": app.version,
        "timestamp": datetime.utcnow().isoformat(),
        "swagger": f"http://localhost:8000{app.docs_url}" if app.docs_url else "disabled",
    }