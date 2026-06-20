from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, Field

from app.astrology.schemas import AstrologySettings, BirthData, Chart, NorthIndianChartPayload


class VarshphalRequest(BaseModel):
    birth_data: BirthData
    year: int = Field(ge=1, le=9999)
    settings: AstrologySettings = Field(default_factory=AstrologySettings)
    calculation_date: date | None = None


class VarshPravesh(BaseModel):
    natal_sun_longitude: float
    return_sun_longitude: float
    julian_day: float
    utc_datetime: datetime
    local_datetime: datetime
    timezone: float


class Muntha(BaseModel):
    muntha_house: int
    muntha_sign: str
    muntha_sign_number: int
    munthesh: str
    completed_years: int


class TajikaAspect(BaseModel):
    source: str
    target: str
    aspect_type: Literal["Conjunction", "Sextile", "Square", "Trine", "Opposition"]
    exact_angle: float
    actual_angle: float
    orb: float
    applying: bool
    strength: float


class TajikaYoga(BaseModel):
    name: str
    planets: list[str]
    description: str
    strength: float = Field(ge=0.0, le=100.0)
    tags: list[str] = Field(default_factory=list)


class TajikaYogaStatus(BaseModel):
    name: str
    active: bool
    strength: float = Field(ge=0.0, le=100.0)
    yogas: list[TajikaYoga] = Field(default_factory=list)


class TajikaReport(BaseModel):
    tajika_aspects: list[TajikaAspect]
    yoga_statuses: list[TajikaYogaStatus]


class Saham(BaseModel):
    name: str
    longitude: float
    sign: str
    sign_number: int
    degree: float
    house: int
    lord: str
    formula: str


class SahamReport(BaseModel):
    supported_count: int
    sahams: list[Saham]


class MuddaDashaPeriod(BaseModel):
    level: Literal["mahadasha", "antardasha"]
    planet: str
    start_date: datetime
    end_date: datetime
    duration_days: float
    children: list["MuddaDashaPeriod"] = Field(default_factory=list)


class MuddaDashaTimeline(BaseModel):
    system: Literal["mudda"] = "mudda"
    start_lord: str
    year_start: datetime
    year_end: datetime
    current: MuddaDashaPeriod | None = None
    periods: list[MuddaDashaPeriod]


class VarshphalPrediction(BaseModel):
    area: str
    summary: str
    factors: list[str]


class BirthInformation(BaseModel):
    name: str
    gender: str
    date_of_birth: date
    time_of_birth: str
    day_of_birth: str
    place_of_birth: str
    country: str
    latitude: float
    longitude: float
    time_zone: float


class AstronomicalData(BaseModel):
    local_mean_time: str
    local_time_correction: str
    war_time_correction: str
    julian_day: float
    sunrise: str | None = None
    sunset: str | None = None
    ayanamsha_value: float
    ayanamsha_name: str


class ChartReferenceData(BaseModel):
    lagna: str
    lagna_lord: str
    moon_sign: str
    moon_sign_lord: str
    nakshatra: str
    nakshatra_lord: str
    yoga: str
    karana: str


class VarshaPraveshData(BaseModel):
    varshphal_year: int
    exact_varsha_pravesh_date: date
    exact_varsha_pravesh_time: str
    varsha_lagna: str
    varsha_lagna_lord: str
    varsha_moon_sign: str
    varsha_moon_sign_lord: str
    varsha_nakshatra: str
    varsha_nakshatra_lord: str
    varsha_yoga: str
    varsha_karana: str


class MunthaSection(BaseModel):
    muntha_sign: str
    muntha_house: int
    munthesh: str
    muntha_strength: float = Field(ge=0.0, le=100.0)


class TajikaSection(BaseModel):
    tajika_aspects: list[TajikaAspect]
    ithasala_yogas: list[TajikaYoga] = Field(default_factory=list)
    isharafa_yogas: list[TajikaYoga] = Field(default_factory=list)
    kamboola_yogas: list[TajikaYoga] = Field(default_factory=list)
    nakta_yogas: list[TajikaYoga] = Field(default_factory=list)
    yamaya_yogas: list[TajikaYoga] = Field(default_factory=list)
    manahoo_yogas: list[TajikaYoga] = Field(default_factory=list)
    radda_yogas: list[TajikaYoga] = Field(default_factory=list)


class DashaSection(BaseModel):
    current_mudda_dasha: str | None = None
    current_antardasha: str | None = None
    start_date: datetime | None = None
    end_date: datetime | None = None


class SahamSection(BaseModel):
    punya_saham: Saham | None = None
    rajya_saham: Saham | None = None
    karma_saham: Saham | None = None
    vivaha_saham: Saham | None = None
    putra_saham: Saham | None = None
    vidya_saham: Saham | None = None
    mrityu_saham: Saham | None = None


class PlanetaryPositionRow(BaseModel):
    longitude: float
    sign: str
    degree: float
    nakshatra: str
    pada: int
    house: int | None = None
    retrograde_status: bool
    combust_status: bool
    aspect_count: int


class StrengthAnalysis(BaseModel):
    strongest_planet: str
    weakest_planet: str
    strongest_house: int
    weakest_house: int
    benefic_influence_score: float = Field(ge=0.0, le=100.0)
    malefic_influence_score: float = Field(ge=0.0, le=100.0)


class AnnualSummary(BaseModel):
    career_score: float = Field(ge=0.0, le=100.0)
    wealth_score: float = Field(ge=0.0, le=100.0)
    marriage_score: float = Field(ge=0.0, le=100.0)
    health_score: float = Field(ge=0.0, le=100.0)
    education_score: float = Field(ge=0.0, le=100.0)
    travel_score: float = Field(ge=0.0, le=100.0)
    spiritual_score: float = Field(ge=0.0, le=100.0)


class AnnualHoroscopeInformationBlock(BaseModel):
    birth_info: BirthInformation
    astronomical_data: AstronomicalData
    natal_reference: ChartReferenceData
    varsha_pravesh: VarshaPraveshData
    muntha: MunthaSection
    tajika: TajikaSection
    mudda_dasha: DashaSection
    sahams: SahamSection
    planetary_positions: dict[str, PlanetaryPositionRow]
    strength_analysis: StrengthAnalysis
    annual_summary: AnnualSummary


class VarshphalReport(BaseModel):
    year: int
    varsh_pravesh: VarshPravesh
    chart: Chart
    muntha: Muntha
    tajika_aspects: list[TajikaAspect]
    tajika_yogas: list[TajikaYoga]
    sahams: list[Saham]
    mudda_dasha: MuddaDashaTimeline
    predictions: list[VarshphalPrediction]


class VarshphalChartResponse(BaseModel):
    varsh_pravesh: VarshPravesh
    chart: Chart
    svg: NorthIndianChartPayload | None = None
