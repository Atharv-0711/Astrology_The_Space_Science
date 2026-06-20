from app.astrology.charts.north_indian import build_north_indian_chart_payload
from app.astrology.schemas import AstrologySettings, BirthData, Chart, NorthIndianChartPayload
from app.astrology.varshphal.engine import (
    calculate_annual_horoscope_information_block,
    calculate_varshphal,
)
from app.astrology.varshphal.schemas import (
    AnnualHoroscopeInformationBlock,
    MuddaDashaTimeline,
    Muntha,
    SahamReport,
    TajikaReport,
    VarshPravesh,
    VarshphalReport,
)
from app.astrology.varshphal.sahams import supported_saham_count
from app.astrology.varshphal.solar_return import calculate_varsh_pravesh
from app.astrology.varshphal.tajika_yogas import build_tajika_report


class VarshphalService:
    def __init__(self, ephemeris_path: str | None = None) -> None:
        self._ephemeris_path = ephemeris_path

    def report(
        self,
        birth_data: BirthData,
        year: int,
        settings: AstrologySettings,
        calculation_date=None,
    ) -> VarshphalReport:
        return calculate_varshphal(
            birth_data=birth_data,
            year=year,
            settings=settings,
            calculation_date=calculation_date,
            ephemeris_path=self._ephemeris_path,
        )

    def pravesh(
        self,
        birth_data: BirthData,
        year: int,
        settings: AstrologySettings,
    ) -> VarshPravesh:
        return calculate_varsh_pravesh(
            birth_data=birth_data,
            year=year,
            settings=settings,
            ephemeris_path=self._ephemeris_path,
        )

    def chart(
        self,
        birth_data: BirthData,
        year: int,
        settings: AstrologySettings,
        calculation_date=None,
    ) -> Chart:
        return self.report(birth_data, year, settings, calculation_date).chart

    def chart_svg(
        self,
        birth_data: BirthData,
        year: int,
        settings: AstrologySettings,
        calculation_date=None,
    ) -> NorthIndianChartPayload:
        return build_north_indian_chart_payload(
            self.chart(birth_data, year, settings, calculation_date)
        )

    def muntha(
        self,
        birth_data: BirthData,
        year: int,
        settings: AstrologySettings,
        calculation_date=None,
    ) -> Muntha:
        return self.report(birth_data, year, settings, calculation_date).muntha

    def mudda_dasha(
        self,
        birth_data: BirthData,
        year: int,
        settings: AstrologySettings,
        calculation_date=None,
    ) -> MuddaDashaTimeline:
        return self.report(birth_data, year, settings, calculation_date).mudda_dasha

    def tajika(
        self,
        birth_data: BirthData,
        year: int,
        settings: AstrologySettings,
        calculation_date=None,
    ) -> TajikaReport:
        report = self.report(birth_data, year, settings, calculation_date)
        return build_tajika_report(report.tajika_aspects, report.tajika_yogas)

    def sahams(
        self,
        birth_data: BirthData,
        year: int,
        settings: AstrologySettings,
        calculation_date=None,
    ) -> SahamReport:
        report = self.report(birth_data, year, settings, calculation_date)
        return SahamReport(supported_count=supported_saham_count(), sahams=report.sahams)

    def annual_horoscope(
        self,
        birth_data: BirthData,
        year: int,
        settings: AstrologySettings,
        calculation_date=None,
    ) -> AnnualHoroscopeInformationBlock:
        return calculate_annual_horoscope_information_block(
            birth_data=birth_data,
            year=year,
            settings=settings,
            calculation_date=calculation_date,
            ephemeris_path=self._ephemeris_path,
        )
