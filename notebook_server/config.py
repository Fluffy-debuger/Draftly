from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path
BASE_DIR = Path(__file__).resolve().parent
class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    DEBUG: bool = True                 
    UPLOAD_ROOT: str = str(Path("notebooks/uploads").absolute())
    PLOTS_DIR: str = str(Path("plots").absolute())
    CORS_ORIGINS: list[str] = ["http://localhost:5173", "http://127.0.0.1:5173"]
    EXECUTION_SERVER_URL: str = "http://localhost:8080"

settings = Settings()