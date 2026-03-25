from pathlib import Path
import json
import os
from datetime import datetime

class Config:
    def __init__(self, path):
        self.path = path
        self.data = self.load()

    def load(self):
        with open(self.path) as f:
            return json.load(f)

    def save(self):
        with open(self.path, 'w') as f:
            json.dump(self.data, f, indent=4)

def create_notebook_metadata_and_folders(
    notebook_folder: Path,
    metadata_path: Path,
    user_id: str,
    notebook_id: str
):
    notebook_folder.mkdir(parents=True, exist_ok=True)

    if metadata_path.exists():
        return

    initial_data = {
        "Notebook": {
            "Name": notebook_id,
            "createBy": user_id,
            "createOn": datetime.now().strftime("%d/%m/%Y, %H:%M:%S")
        },
        "cell_order": [],
        "Snippets": [],
        "Secrets": {}
    }

    temp_path = metadata_path.with_suffix(".json.tmp")
    try:
        with open(temp_path, "w", encoding="utf-8") as f:
            json.dump(initial_data, f, indent=2, ensure_ascii=False)
        os.replace(temp_path, metadata_path)
    except Exception as e:
        if temp_path.exists():
            os.unlink(temp_path)
        raise RuntimeError(f"Failed to create metadata: {e}")