from datetime import UTC, datetime, timedelta

import swisseph as swe

from app.astrology.planets import configure_ephemeris
from app.astrology.schemas import AstrologySettings, BirthData
from app.astrology.time import julian_day_from_birth_data, utc_datetime
from app.astrology.varshphal.schemas import VarshPravesh
from app.astrology.zodiac import normalize_longitude

SUN_RETURN_TOLERANCE_DEGREES = 1e-8
SEARCH_STEP_DAYS = 0.125
SEARCH_WINDOW_DAYS = 8


def calculate_varsh_pravesh(
    birth_data: BirthData,
    year: int,
    settings: AstrologySettings | None = None,
    ephemeris_path: str | None = None,
) -> VarshPravesh:
    """Find the exact sidereal solar return for a target Gregorian year.

    Varsh Pravesh is the instant transiting Sun reaches the natal sidereal Sun
    longitude. Swiss Ephemeris is used in Lahiri sidereal mode and the root is
    refined by bisection after bracketing the annual crossing.
    """

    chart_settings = settings or AstrologySettings()
    natal_jd = julian_day_from_birth_data(birth_data)
    natal_sun = _sidereal_sun_longitude(natal_jd, chart_settings, ephemeris_path)
    approximate_utc = _birthday_utc_for_year(birth_data, year)
    lower, upper = _bracket_return(approximate_utc, natal_sun, chart_settings, ephemeris_path)
    return_utc, return_jd = _refine_return(lower, upper, natal_sun, chart_settings, ephemeris_path)
    return_local = (return_utc + timedelta(hours=birth_data.timezone)).replace(tzinfo=None)
    return_sun = _sidereal_sun_longitude(return_jd, chart_settings, ephemeris_path)

    return VarshPravesh(
        natal_sun_longitude=natal_sun,
        return_sun_longitude=return_sun,
        julian_day=return_jd,
        utc_datetime=return_utc,
        local_datetime=return_local,
        timezone=birth_data.timezone,
    )


def _sidereal_sun_longitude(
    julian_day: float,
    settings: AstrologySettings,
    ephemeris_path: str | None,
) -> float:
    configure_ephemeris(ephemeris_path)
    flags = swe.FLG_SIDEREAL | swe.FLG_SPEED
    position, _retflag = swe.calc_ut(julian_day, swe.SUN, flags)
    return normalize_longitude(float(position[0]))


def _birthday_utc_for_year(birth_data: BirthData, year: int) -> datetime:
    birth_utc = utc_datetime(birth_data)
    day = birth_utc.day
    month = birth_utc.month
    if month == 2 and day == 29 and not _is_leap_year(year):
        day = 28
    return birth_utc.replace(year=year, month=month, day=day)


def _bracket_return(
    approximate_utc: datetime,
    natal_sun: float,
    settings: AstrologySettings,
    ephemeris_path: str | None,
) -> tuple[datetime, datetime]:
    start = approximate_utc - timedelta(days=SEARCH_WINDOW_DAYS)
    previous_time = start
    previous_delta = _sun_delta_at(previous_time, natal_sun, settings, ephemeris_path)
    samples = int((SEARCH_WINDOW_DAYS * 2) / SEARCH_STEP_DAYS)

    for index in range(1, samples + 1):
        current_time = start + timedelta(days=index * SEARCH_STEP_DAYS)
        current_delta = _sun_delta_at(current_time, natal_sun, settings, ephemeris_path)
        if abs(current_delta) <= SUN_RETURN_TOLERANCE_DEGREES:
            return previous_time, current_time
        if previous_delta <= 0.0 <= current_delta or previous_delta >= 0.0 >= current_delta:
            return previous_time, current_time
        previous_time = current_time
        previous_delta = current_delta

    raise ValueError("Could not bracket solar return in the annual search window")


def _refine_return(
    lower: datetime,
    upper: datetime,
    natal_sun: float,
    settings: AstrologySettings,
    ephemeris_path: str | None,
) -> tuple[datetime, float]:
    lower_delta = _sun_delta_at(lower, natal_sun, settings, ephemeris_path)
    upper_delta = _sun_delta_at(upper, natal_sun, settings, ephemeris_path)

    for _ in range(80):
        midpoint = lower + (upper - lower) / 2
        midpoint_delta = _sun_delta_at(midpoint, natal_sun, settings, ephemeris_path)
        if abs(midpoint_delta) <= SUN_RETURN_TOLERANCE_DEGREES:
            return midpoint, _julian_day_from_utc(midpoint)
        if lower_delta <= 0.0 <= midpoint_delta or lower_delta >= 0.0 >= midpoint_delta:
            upper = midpoint
            upper_delta = midpoint_delta
        else:
            lower = midpoint
            lower_delta = midpoint_delta
        if abs((upper - lower).total_seconds()) < 0.01:
            break

    refined = lower + (upper - lower) / 2
    _ = upper_delta
    return refined, _julian_day_from_utc(refined)


def _sun_delta_at(
    moment_utc: datetime,
    natal_sun: float,
    settings: AstrologySettings,
    ephemeris_path: str | None,
) -> float:
    longitude = _sidereal_sun_longitude(_julian_day_from_utc(moment_utc), settings, ephemeris_path)
    return _signed_delta(longitude, natal_sun)


def _signed_delta(current: float, target: float) -> float:
    return (current - target + 180.0) % 360.0 - 180.0


def _julian_day_from_utc(moment: datetime) -> float:
    utc_moment = moment.astimezone(UTC) if moment.tzinfo else moment.replace(tzinfo=UTC)
    universal_time = (
        utc_moment.hour
        + utc_moment.minute / 60.0
        + utc_moment.second / 3600.0
        + utc_moment.microsecond / 3_600_000_000.0
    )
    return float(swe.julday(utc_moment.year, utc_moment.month, utc_moment.day, universal_time))


def _is_leap_year(year: int) -> bool:
    return year % 4 == 0 and (year % 100 != 0 or year % 400 == 0)
