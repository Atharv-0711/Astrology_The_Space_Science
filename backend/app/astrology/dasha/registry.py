from typing import Protocol

from app.astrology.dasha.schemas import DashaTimeline
from app.astrology.dasha.vimshottari import calculate_vimshottari_dasha
from app.astrology.schemas import Chart


class DashaEngine(Protocol):
    def calculate(self, chart: Chart, calculation_date=None, include_depth: int = 5) -> DashaTimeline:
        ...


class VimshottariEngine:
    def calculate(self, chart: Chart, calculation_date=None, include_depth: int = 5) -> DashaTimeline:
        return calculate_vimshottari_dasha(
            chart=chart,
            calculation_date=calculation_date,
            include_depth=include_depth,
        )


class UnsupportedDashaEngine:
    def __init__(self, name: str) -> None:
        self.name = name

    def calculate(self, chart: Chart, calculation_date=None, include_depth: int = 5) -> DashaTimeline:
        raise NotImplementedError(f"{self.name.title()} Dasha is registered for future support.")


DASHA_REGISTRY: dict[str, DashaEngine] = {
    "vimshottari": VimshottariEngine(),
    "yogini": UnsupportedDashaEngine("yogini"),
    "ashtottari": UnsupportedDashaEngine("ashtottari"),
    "kalachakra": UnsupportedDashaEngine("kalachakra"),
    "chara": UnsupportedDashaEngine("chara"),
    "narayana": UnsupportedDashaEngine("narayana"),
    "shoola": UnsupportedDashaEngine("shoola"),
}
