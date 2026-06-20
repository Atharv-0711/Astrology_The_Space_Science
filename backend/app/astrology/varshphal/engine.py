from datetime import timedelta
from dataclasses import dataclass

from app.astrology.charts.north_indian import build_north_indian_chart_payload
from app.astrology.engine import calculate_chart
from app.astrology.schemas import AstrologySettings, BirthData, Chart, NorthIndianChartPayload
from app.astrology.varshphal.annual_block import build_annual_horoscope_information_block
from app.astrology.varshphal.interpretation import generate_predictions
from app.astrology.varshphal.mudda_dasha import calculate_mudda_dasha
from app.astrology.varshphal.muntha import calculate_muntha
from app.astrology.varshphal.sahams import calculate_sahams
from app.astrology.varshphal.schemas import (
    AnnualHoroscopeInformationBlock,
    MuddaDashaTimeline,
    Muntha,
    Saham,
    TajikaAspect,
    TajikaYoga,
    VarshPravesh,
    VarshphalChartResponse,
    VarshphalReport,
)
from app.astrology.varshphal.solar_return import calculate_varsh_pravesh
from app.astrology.varshphal.tajika_aspects import calculate_tajika_aspects
from app.astrology.varshphal.tajika_yogas import detect_tajika_yogas


@dataclass(frozen=True)
class VarshphalCore:
    chart_settings: AstrologySettings
    natal_chart: Chart
    varsha_chart: Chart
    pravesh: VarshPravesh
    muntha: Muntha
    tajika_aspects: list[TajikaAspect]
    tajika_yogas: list[TajikaYoga]
    sahams: list[Saham]
    mudda_dasha: MuddaDashaTimeline


def calculate_varshphal(
    birth_data: BirthData,
    year: int,
    settings: AstrologySettings | None = None,
    calculation_date=None,
    ephemeris_path: str | None = None,
) -> VarshphalReport:
    core = _calculate_varshphal_core(birth_data, year, settings, calculation_date, ephemeris_path)
    predictions = generate_predictions(core.muntha, core.tajika_yogas, core.sahams, core.mudda_dasha)

    return VarshphalReport(
        year=year,
        varsh_pravesh=core.pravesh,
        chart=core.varsha_chart,
        muntha=core.muntha,
        tajika_aspects=core.tajika_aspects,
        tajika_yogas=core.tajika_yogas,
        sahams=core.sahams,
        mudda_dasha=core.mudda_dasha,
        predictions=predictions,
    )


def calculate_varshphal_chart(
    birth_data: BirthData,
    year: int,
    settings: AstrologySettings | None = None,
    ephemeris_path: str | None = None,
    include_svg: bool = False,
) -> VarshphalChartResponse:
    report = calculate_varshphal(birth_data, year, settings, ephemeris_path=ephemeris_path)
    svg: NorthIndianChartPayload | None = None
    if include_svg:
        svg = build_north_indian_chart_payload(report.chart)
    return VarshphalChartResponse(varsh_pravesh=report.varsh_pravesh, chart=report.chart, svg=svg)


def calculate_annual_horoscope_information_block(
    birth_data: BirthData,
    year: int,
    settings: AstrologySettings | None = None,
    calculation_date=None,
    ephemeris_path: str | None = None,
) -> AnnualHoroscopeInformationBlock:
    core = _calculate_varshphal_core(birth_data, year, settings, calculation_date, ephemeris_path)
    return build_annual_horoscope_information_block(
        birth_data=birth_data,
        year=year,
        settings=core.chart_settings,
        natal_chart=core.natal_chart,
        varsha_chart=core.varsha_chart,
        pravesh=core.pravesh,
        muntha=core.muntha,
        tajika_aspects=core.tajika_aspects,
        tajika_yogas=core.tajika_yogas,
        sahams=core.sahams,
        mudda_dasha=core.mudda_dasha,
        ephemeris_path=ephemeris_path,
    )


def _calculate_varshphal_core(
    birth_data: BirthData,
    year: int,
    settings: AstrologySettings | None,
    calculation_date,
    ephemeris_path: str | None,
) -> VarshphalCore:
    chart_settings = settings or AstrologySettings()
    natal_chart = calculate_chart(birth_data, chart_settings, ephemeris_path)
    pravesh = calculate_varsh_pravesh(birth_data, year, chart_settings, ephemeris_path)
    varsha_birth_data = _birth_data_for_pravesh(birth_data, pravesh)
    varsha_chart = calculate_chart(varsha_birth_data, chart_settings, ephemeris_path).model_copy(
        update={"chart_type": "Varshphal"}
    )
    next_pravesh = _next_pravesh_or_default(birth_data, year, chart_settings, ephemeris_path, pravesh)
    muntha = calculate_muntha(natal_chart, varsha_chart, year)
    tajika_aspects = calculate_tajika_aspects(varsha_chart)
    tajika_yogas = detect_tajika_yogas(varsha_chart, tajika_aspects)
    sahams = calculate_sahams(varsha_chart)
    mudda_dasha = calculate_mudda_dasha(
        natal_chart=natal_chart,
        year_start=pravesh.local_datetime,
        year_end=next_pravesh.local_datetime,
        target_year=year,
        calculation_date=calculation_date,
    )
    return VarshphalCore(
        chart_settings=chart_settings,
        natal_chart=natal_chart,
        varsha_chart=varsha_chart,
        pravesh=pravesh,
        muntha=muntha,
        tajika_aspects=tajika_aspects,
        tajika_yogas=tajika_yogas,
        sahams=sahams,
        mudda_dasha=mudda_dasha,
    )


def _birth_data_for_pravesh(birth_data: BirthData, pravesh: VarshPravesh) -> BirthData:
    local = pravesh.local_datetime
    return BirthData(
        name=f"{birth_data.name} Varshphal {local.year}",
        gender=birth_data.gender,
        birth_date=local.date(),
        birth_time=local.time(),
        place_of_birth=birth_data.place_of_birth,
        country=birth_data.country,
        latitude=birth_data.latitude,
        longitude=birth_data.longitude,
        timezone=birth_data.timezone,
    )


def _next_pravesh_or_default(
    birth_data: BirthData,
    year: int,
    settings: AstrologySettings,
    ephemeris_path: str | None,
    current_pravesh: VarshPravesh,
) -> VarshPravesh:
    if year >= 9999:
        return current_pravesh.model_copy(
            update={"local_datetime": current_pravesh.local_datetime + timedelta(days=365.2425)}
        )
    return calculate_varsh_pravesh(birth_data, year + 1, settings, ephemeris_path)
