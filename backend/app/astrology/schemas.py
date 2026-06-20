from datetime import date, datetime, time
from enum import StrEnum

from pydantic import BaseModel, Field, field_validator


class ZodiacType(StrEnum):
    sidereal = "sidereal"


class Ayanamsha(StrEnum):
    lahiri = "lahiri"


class HouseSystem(StrEnum):
    whole_sign = "whole_sign"


class NodeType(StrEnum):
    true = "true"


class BirthData(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    gender: str = Field(default="-", max_length=40)
    birth_date: date
    birth_time: time
    place_of_birth: str = Field(default="-", max_length=160)
    country: str = Field(default="-", max_length=120)
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    timezone: float = Field(ge=-14, le=14, description="UTC offset in decimal hours.")


class AstrologySettings(BaseModel):
    zodiac: ZodiacType = ZodiacType.sidereal
    ayanamsha: Ayanamsha = Ayanamsha.lahiri
    house_system: HouseSystem = HouseSystem.whole_sign
    node_type: NodeType = NodeType.true
    include_outer_planets: bool = False
    enable_vedic_aspects: bool = True
    enable_western_aspects: bool = False
    western_aspect_orb: float = Field(default=6.0, ge=0.0, le=15.0)


class ChartRequest(BaseModel):
    birth_data: BirthData
    settings: AstrologySettings = Field(default_factory=AstrologySettings)


class DashaRequest(ChartRequest):
    calculation_date: date | None = None


class TransitRequest(ChartRequest):
    calculation_date: date = Field(default_factory=date.today)


class ZodiacPosition(BaseModel):
    longitude: float
    sign_number: int
    sign_name: str
    degree: float
    sign_lord: str
    nakshatra_number: int
    nakshatra: str
    nakshatra_lord: str
    pada: int


class DignityStatus(BaseModel):
    exalted: bool = False
    debilitated: bool = False
    own_sign: bool = False
    moolatrikona: bool = False


class PlanetPosition(BaseModel):
    name: str
    abbreviation: str
    longitude: float
    latitude: float
    speed: float
    retrograde: bool
    zodiac: ZodiacPosition
    house: int | None = None
    dignity: DignityStatus = Field(default_factory=DignityStatus)


class Ascendant(BaseModel):
    longitude: float
    zodiac: ZodiacPosition
    lord: str


class House(BaseModel):
    number: int
    sign_number: int
    sign_name: str
    lord: str
    occupants: list[str] = Field(default_factory=list)
    strength: float | None = None


class Aspect(BaseModel):
    source: str
    target: str
    aspect_type: str
    aspect_system: str
    angle: float | None = None
    orb: float | None = None
    source_house: int | None = None
    target_house: int | None = None
    strength: float | None = None
    exact: bool = False
    reason: str | None = None


class Chart(BaseModel):
    chart_type: str = "D1"
    birth_data: BirthData
    settings: AstrologySettings
    julian_day: float
    ascendant: Ascendant
    planets: dict[str, PlanetPosition]
    houses: dict[int, House]
    aspects: list[Aspect] = Field(default_factory=list)

    @field_validator("houses")
    @classmethod
    def validate_twelve_houses(cls, houses: dict[int, House]) -> dict[int, House]:
        expected = set(range(1, 13))
        if set(houses) != expected:
            raise ValueError("chart must contain houses 1 through 12")
        return houses


class TransitEntry(BaseModel):
    planet: str
    natal_sign: str
    transit_sign: str
    transit_degree: float
    natal_house: int
    motion: str
    relationship: str
    longitude_delta: float


class TransitResponse(BaseModel):
    calculation_date: date
    focus: list[str]
    entries: list[TransitEntry]


class TraditionalComponentScore(BaseModel):
    score: float = Field(ge=0.0, le=100.0)
    evidence: list[str] = Field(default_factory=list)


class TraditionalShadbalaScore(BaseModel):
    sthana_bala: TraditionalComponentScore
    dig_bala: TraditionalComponentScore
    kala_bala: TraditionalComponentScore
    chesta_bala: TraditionalComponentScore
    naisargika_bala: TraditionalComponentScore
    drik_bala: TraditionalComponentScore
    total: float = Field(ge=0.0, le=100.0)


class TraditionalPlanetStrength(BaseModel):
    planet: str
    dignity_score: TraditionalComponentScore
    shadbala_score: TraditionalShadbalaScore
    ashtakavarga_score: TraditionalComponentScore
    varga_support_score: TraditionalComponentScore
    aspect_quality_score: TraditionalComponentScore
    combustion_status: str
    combustion_penalty: float
    planetary_war_status: str
    planetary_war_penalty: float
    sign_relationship: str
    final_traditional_strength: float = Field(ge=0.0, le=100.0)
    evidence: list[str] = Field(default_factory=list)


class TraditionalStrengthResponse(BaseModel):
    system: str = "traditional_jyotish_strength"
    scoring_note: str
    planets: list[TraditionalPlanetStrength]


class ChartPoint(BaseModel):
    x: float
    y: float


class ChartLine(BaseModel):
    start: ChartPoint
    end: ChartPoint


class ChartLabel(BaseModel):
    kind: str
    text: str
    house: int
    x: float
    y: float
    planet: str | None = None
    tooltip: str | None = None


class NorthIndianChartPayload(BaseModel):
    chart_type: str
    view_box: str = "0 0 100 100"
    lines: list[ChartLine]
    labels: list[ChartLabel]


class DashaPeriod(BaseModel):
    level: str
    lord: str
    start_at: datetime
    end_at: datetime
    children: list["DashaPeriod"] = Field(default_factory=list)


class DashaTimeline(BaseModel):
    birth_dasha_lord: str
    mahadashas: list[DashaPeriod]
    current: DashaPeriod | None = None
    upcoming: DashaPeriod | None = None
