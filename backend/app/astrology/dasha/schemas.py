from datetime import date as Date
from datetime import datetime
from datetime import time as Time
from typing import Literal, Self

from pydantic import BaseModel, Field, model_validator

from app.astrology.schemas import AstrologySettings, BirthData

DashaLevel = Literal["mahadasha", "antardasha", "pratyantar", "sookshma", "prana"]
DashaStatus = Literal["past", "running", "future"]
DashaSystem = Literal[
    "vimshottari",
    "yogini",
    "ashtottari",
    "kalachakra",
    "chara",
    "narayana",
    "shoola",
]


class DashaCalculationRequest(BaseModel):
    birth_data: BirthData | None = None
    settings: AstrologySettings = Field(default_factory=AstrologySettings)
    calculation_date: Date | None = None
    include_depth: int = Field(default=5, ge=1, le=5)

    name: str | None = Field(default=None, min_length=1, max_length=120)
    date: Date | None = None
    time: Time | None = None
    lat: float | None = Field(default=None, ge=-90, le=90)
    lon: float | None = Field(default=None, ge=-180, le=180)
    timezone: float = Field(default=0.0, ge=-14, le=14)

    @model_validator(mode="after")
    def build_birth_data_from_flat_payload(self) -> Self:
        if self.birth_data is not None:
            return self
        if self.date is None or self.time is None or self.lat is None or self.lon is None:
            raise ValueError("provide birth_data or flat date, time, lat, and lon fields")
        self.birth_data = BirthData(
            name=self.name or "Native",
            birth_date=self.date,
            birth_time=self.time,
            latitude=self.lat,
            longitude=self.lon,
            timezone=self.timezone,
        )
        return self


class MoonNakshatraInfo(BaseModel):
    longitude: float
    nakshatra_number: int
    nakshatra: str
    nakshatra_lord: str
    pada: int
    elapsed_degrees: float
    remaining_degrees: float
    elapsed_fraction: float
    remaining_fraction: float


class BirthBalance(BaseModel):
    planet: str
    total_years: int
    elapsed_years: float
    remaining_years: float
    elapsed_days: float
    remaining_days: float
    mahadasha_start_date: datetime
    birth_date: datetime
    mahadasha_end_date: datetime


class DashaPeriod(BaseModel):
    level: DashaLevel
    planet: str
    start_date: datetime
    end_date: datetime
    duration_days: float
    status: DashaStatus = "future"
    parent_mahadasha: str | None = None
    parent_antardasha: str | None = None
    parent_pratyantar: str | None = None
    parent_sookshma: str | None = None
    children: list["DashaPeriod"] = Field(default_factory=list)
    interpretation: dict[str, str] | None = None


class Mahadasha(DashaPeriod):
    level: Literal["mahadasha"] = "mahadasha"
    parent_mahadasha: None = None


class Antardasha(DashaPeriod):
    level: Literal["antardasha"] = "antardasha"
    parent_mahadasha: str


class Pratyantar(DashaPeriod):
    level: Literal["pratyantar"] = "pratyantar"
    parent_mahadasha: str
    parent_antardasha: str


class Sookshma(DashaPeriod):
    level: Literal["sookshma"] = "sookshma"
    parent_mahadasha: str
    parent_antardasha: str
    parent_pratyantar: str


class Prana(DashaPeriod):
    level: Literal["prana"] = "prana"
    parent_mahadasha: str
    parent_antardasha: str
    parent_pratyantar: str
    parent_sookshma: str


class DashaPath(BaseModel):
    mahadasha: Mahadasha | None = None
    antardasha: Antardasha | None = None
    pratyantar: Pratyantar | None = None
    sookshma: Sookshma | None = None
    prana: Prana | None = None


class CurrentDashaResponse(BaseModel):
    current_mahadasha: str | None = None
    current_antardasha: str | None = None
    current_pratyantar: str | None = None
    current_sookshma: str | None = None
    current_prana: str | None = None
    start_date: datetime | None = None
    end_date: datetime | None = None
    path: DashaPath
    interpretations: list[dict[str, str]] = Field(default_factory=list)


class NextDashaResponse(BaseModel):
    next: DashaPeriod | None = None
    upcoming: list[DashaPeriod] = Field(default_factory=list)


class DashaTimeline(BaseModel):
    system: Literal["vimshottari"] = "vimshottari"
    zodiac: Literal["sidereal"] = "sidereal"
    ayanamsha: Literal["lahiri"] = "lahiri"
    nakshatra_system: Literal["27_nakshatras"] = "27_nakshatras"
    total_years: int = 120
    moon: MoonNakshatraInfo
    birth_balance: BirthBalance
    mahadashas: list[Mahadasha]
    current: CurrentDashaResponse
    next: NextDashaResponse
    past: list[DashaPeriod] = Field(default_factory=list)
    future: list[DashaPeriod] = Field(default_factory=list)


__all__ = [
    "Antardasha",
    "BirthBalance",
    "CurrentDashaResponse",
    "DashaCalculationRequest",
    "DashaPath",
    "DashaPeriod",
    "DashaStatus",
    "DashaTimeline",
    "Mahadasha",
    "MoonNakshatraInfo",
    "NextDashaResponse",
    "Prana",
    "Pratyantar",
    "Sookshma",
]
