from datetime import date

from app.astrology.dasha.registry import DASHA_REGISTRY
from app.astrology.dasha.schemas import CurrentDashaResponse, DashaTimeline, NextDashaResponse
from app.astrology.dasha.vimshottari import vimshottari_lord_sequence
from app.astrology.engine import calculate_chart
from app.astrology.schemas import AstrologySettings, BirthData, Chart


class DashaService:
    def __init__(self, ephemeris_path: str | None = None) -> None:
        self._ephemeris_path = ephemeris_path

    def lord_sequence(self, start_lord: str) -> tuple[str, ...]:
        return vimshottari_lord_sequence(start_lord)

    def calculate_birth_chart(
        self,
        birth_data: BirthData,
        settings: AstrologySettings,
    ) -> Chart:
        return calculate_chart(
            birth_data=birth_data,
            settings=settings,
            ephemeris_path=self._ephemeris_path,
        )

    def calculate_timeline(
        self,
        chart: Chart,
        calculation_date: date | None = None,
        include_depth: int = 5,
        system: str = "vimshottari",
    ) -> DashaTimeline:
        return DASHA_REGISTRY[system].calculate(chart, calculation_date, include_depth)

    def current(
        self,
        chart: Chart,
        calculation_date: date | None = None,
        include_depth: int = 5,
    ) -> CurrentDashaResponse:
        return self.calculate_timeline(chart, calculation_date, include_depth).current

    def next(
        self,
        chart: Chart,
        calculation_date: date | None = None,
        include_depth: int = 5,
    ) -> NextDashaResponse:
        return self.calculate_timeline(chart, calculation_date, include_depth).next
