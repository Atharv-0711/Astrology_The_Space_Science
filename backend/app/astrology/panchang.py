from dataclasses import dataclass
from datetime import datetime, timedelta

import swisseph as swe

from app.astrology.schemas import AstrologySettings, BirthData
from app.astrology.time import julian_day_from_birth_data, local_datetime
from app.astrology.zodiac import normalize_longitude

YOGA_NAMES: tuple[str, ...] = (
    "Vishkambha",
    "Priti",
    "Ayushman",
    "Saubhagya",
    "Shobhana",
    "Atiganda",
    "Sukarma",
    "Dhriti",
    "Shoola",
    "Ganda",
    "Vriddhi",
    "Dhruva",
    "Vyaghata",
    "Harshana",
    "Vajra",
    "Siddhi",
    "Vyatipata",
    "Variyana",
    "Parigha",
    "Shiva",
    "Siddha",
    "Sadhya",
    "Shubha",
    "Shukla",
    "Brahma",
    "Indra",
    "Vaidhriti",
)

MOVABLE_KARANAS: tuple[str, ...] = (
    "Bava",
    "Balava",
    "Kaulava",
    "Taitila",
    "Garaja",
    "Vanija",
    "Vishti",
)

FIXED_KARANAS: dict[int, str] = {
    0: "Kimstughna",
    57: "Shakuni",
    58: "Chatushpada",
    59: "Naga",
}


@dataclass(frozen=True)
class PanchangData:
    yoga: str
    karana: str
    ayanamsha_value: float
    ayanamsha_name: str


@dataclass(frozen=True)
class AstronomicalDataValues:
    local_mean_time: str
    local_time_correction: str
    war_time_correction: str
    julian_day: float
    sunrise: str | None
    sunset: str | None
    ayanamsha_value: float
    ayanamsha_name: str


def calculate_panchang(
    birth_data: BirthData,
    settings: AstrologySettings,
    ephemeris_path: str | None = None,
) -> PanchangData:
    if ephemeris_path:
        swe.set_ephe_path(ephemeris_path)
    swe.set_sid_mode(swe.SIDM_LAHIRI)
    julian_day = julian_day_from_birth_data(birth_data)
    sun_longitude = _planet_longitude(julian_day, swe.SUN)
    moon_longitude = _planet_longitude(julian_day, swe.MOON)
    return PanchangData(
        yoga=_yoga_name(sun_longitude, moon_longitude),
        karana=_karana_name(sun_longitude, moon_longitude),
        ayanamsha_value=float(swe.get_ayanamsa_ut(julian_day)),
        ayanamsha_name=_ayanamsha_name(settings),
    )


def calculate_astronomical_data(
    birth_data: BirthData,
    settings: AstrologySettings,
    ephemeris_path: str | None = None,
) -> AstronomicalDataValues:
    panchang = calculate_panchang(birth_data, settings, ephemeris_path)
    correction = _local_time_correction(birth_data)
    return AstronomicalDataValues(
        local_mean_time=_format_time(local_datetime(birth_data) + correction),
        local_time_correction=_format_duration(correction),
        war_time_correction="00:00:00",
        julian_day=julian_day_from_birth_data(birth_data),
        sunrise=_sun_event_time(birth_data, swe.CALC_RISE, ephemeris_path),
        sunset=_sun_event_time(birth_data, swe.CALC_SET, ephemeris_path),
        ayanamsha_value=panchang.ayanamsha_value,
        ayanamsha_name=panchang.ayanamsha_name,
    )


def _planet_longitude(julian_day: float, planet: int) -> float:
    position, _retflag = swe.calc_ut(julian_day, planet, swe.FLG_SIDEREAL | swe.FLG_SPEED)
    return normalize_longitude(float(position[0]))


def _yoga_name(sun_longitude: float, moon_longitude: float) -> str:
    yoga_span = 360.0 / 27.0
    index = int(normalize_longitude(sun_longitude + moon_longitude) // yoga_span)
    return YOGA_NAMES[min(index, len(YOGA_NAMES) - 1)]


def _karana_name(sun_longitude: float, moon_longitude: float) -> str:
    half_tithi_index = int(normalize_longitude(moon_longitude - sun_longitude) // 6.0)
    if half_tithi_index in FIXED_KARANAS:
        return FIXED_KARANAS[half_tithi_index]
    return MOVABLE_KARANAS[(half_tithi_index - 1) % len(MOVABLE_KARANAS)]


def _local_time_correction(birth_data: BirthData) -> timedelta:
    local_mean_offset_hours = birth_data.longitude / 15.0
    return timedelta(hours=local_mean_offset_hours - birth_data.timezone)


def _sun_event_time(
    birth_data: BirthData,
    event: int,
    ephemeris_path: str | None,
) -> str | None:
    if ephemeris_path:
        swe.set_ephe_path(ephemeris_path)
    try:
        result, transit = swe.rise_trans(
            julian_day_from_birth_data(birth_data),
            swe.SUN,
            event,
            (birth_data.longitude, birth_data.latitude, 0.0),
        )
    except (TypeError, ValueError, swe.Error):
        return None
    if result < 0:
        return None
    julian_day = float(transit[0] if isinstance(transit, (tuple, list)) else transit)
    year, month, day, hour = swe.revjul(julian_day)
    utc_value = datetime(year, month, day) + timedelta(hours=hour)
    local_value = utc_value + timedelta(hours=birth_data.timezone)
    return _format_time(local_value)


def _ayanamsha_name(settings: AstrologySettings) -> str:
    return f"{settings.ayanamsha.value.title()} ayanamsha"


def _format_time(value: datetime) -> str:
    return value.strftime("%H:%M:%S")


def _format_duration(value: timedelta) -> str:
    total_seconds = int(round(value.total_seconds()))
    sign = "-" if total_seconds < 0 else ""
    total_seconds = abs(total_seconds)
    hours, remainder = divmod(total_seconds, 3600)
    minutes, seconds = divmod(remainder, 60)
    return f"{sign}{hours:02d}:{minutes:02d}:{seconds:02d}"
