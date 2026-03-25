from pathlib import Path

def validate_name(name: str) -> bool:
    return all(c.isalnum() or c == '_' for c in name)

def safe_join_path(base: str, *parts: str) -> Path:
    path = Path(base)
    for part in parts:
        if ".." in part or "/" in part or "\\" in part:
            raise ValueError("Invalid path component")
        path = path / part
    return path