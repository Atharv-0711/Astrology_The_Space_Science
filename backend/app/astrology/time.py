from datetime import UTC, datetime, timedelta

import swisseph as swe

from app.astrology.schemas import BirthData


def local_datetime(birth_data: BirthData) -> datetime:
    return datetime.combine(birth_data.birth_date, birth_data.birth_time)


def utc_datetime(birth_data: BirthData) -> datetime:
    utc_value = local_datetime(birth_data) - timedelta(hours=birth_data.timezone)
    return utc_value.replace(tzinfo=UTC)


def julian_day_from_birth_data(birth_data: BirthData) -> float:
    utc_value = utc_datetime(birth_data)
    universal_time = (
        utc_value.hour
        + utc_value.minute / 60.0
        + utc_value.second / 3600.0
        + utc_value.microsecond / 3_600_000_000.0
    )
    return float(swe.julday(utc_value.year, utc_value.month, utc_value.day, universal_time))
