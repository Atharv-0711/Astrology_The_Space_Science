import json
from pathlib import Path
from typing import Any


def load_interpretation_file(path: Path) -> dict[str, Any]:
    with path.open("r", encoding="utf-8") as file:
        data = json.load(file)
    if not isinstance(data, dict):
        raise ValueError(f"Interpretation file must contain a JSON object: {path}")
    return data
