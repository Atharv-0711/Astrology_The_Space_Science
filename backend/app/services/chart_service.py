from app.astrology.engine import calculate_chart
from app.astrology.schemas import AstrologySettings, BirthData, Chart


class ChartService:
    def __init__(self, ephemeris_path: str | None = None) -> None:
        self._ephemeris_path = ephemeris_path

    def calculate_birth_chart(
        self,
        birth_data: BirthData,
        settings: AstrologySettings | None = None,
    ) -> Chart:
        return calculate_chart(birth_data, settings, self._ephemeris_path)
