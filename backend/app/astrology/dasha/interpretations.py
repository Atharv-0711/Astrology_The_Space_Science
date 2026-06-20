from functools import lru_cache
from pathlib import Path

from app.astrology.interpretations.loader import load_interpretation_file


class DashaInterpretationLoader:
    def __init__(self, base_path: Path | None = None) -> None:
        self.base_path = base_path or Path(__file__).resolve().parents[1] / "interpretations" / "data" / "dasha"

    def load_mahadasha(self, planet: str) -> dict[str, str] | None:
        return _load_json(self.base_path / "mahadasha" / f"{planet.lower()}.json")

    def load_antardasha(self, mahadasha: str, antardasha: str) -> dict[str, str] | None:
        filename = f"{mahadasha.lower()}-{antardasha.lower()}.json"
        return _load_json(self.base_path / "antardasha" / filename)


@lru_cache(maxsize=512)
def _load_json(path: Path) -> dict[str, str] | None:
    if not path.exists():
        return None
    data = load_interpretation_file(path)
    return {str(key): str(value) for key, value in data.items()}
