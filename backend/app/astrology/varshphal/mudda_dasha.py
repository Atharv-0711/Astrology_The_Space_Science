from datetime import date, datetime, timedelta

from app.astrology.constants import VIMSHOTTARI_SEQUENCE, VIMSHOTTARI_YEARS
from app.astrology.schemas import Chart
from app.astrology.varshphal.schemas import MuddaDashaPeriod, MuddaDashaTimeline

VIMSHOTTARI_TOTAL_YEARS = 120.0


def calculate_mudda_dasha(
    natal_chart: Chart,
    year_start: datetime,
    year_end: datetime,
    target_year: int,
    calculation_date: date | None = None,
) -> MuddaDashaTimeline:
    start_lord = mudda_start_lord(natal_chart, target_year)
    sequence = _sequence_from(start_lord)
    total_days = (year_end - year_start).total_seconds() / 86400.0
    periods: list[MuddaDashaPeriod] = []
    cursor = year_start

    for index, planet in enumerate(sequence):
        duration_days = total_days * VIMSHOTTARI_YEARS[planet] / VIMSHOTTARI_TOTAL_YEARS
        end_at = year_end if index == len(sequence) - 1 else cursor + timedelta(days=duration_days)
        periods.append(
            MuddaDashaPeriod(
                level="mahadasha",
                planet=planet,
                start_date=cursor,
                end_date=end_at,
                duration_days=(end_at - cursor).total_seconds() / 86400.0,
                children=_build_antardashas(planet, cursor, end_at),
            )
        )
        cursor = end_at

    reference = _reference_datetime(calculation_date, year_start)
    return MuddaDashaTimeline(
        start_lord=start_lord,
        year_start=year_start,
        year_end=year_end,
        current=_current_period(periods, reference),
        periods=periods,
    )


def mudda_start_lord(natal_chart: Chart, target_year: int) -> str:
    completed_years = max(0, target_year - natal_chart.birth_data.birth_date.year)
    natal_lord = natal_chart.planets["Moon"].zodiac.nakshatra_lord
    start_index = (VIMSHOTTARI_SEQUENCE.index(natal_lord) + completed_years) % len(VIMSHOTTARI_SEQUENCE)
    return VIMSHOTTARI_SEQUENCE[start_index]


def _build_antardashas(parent: str, start_at: datetime, end_at: datetime) -> list[MuddaDashaPeriod]:
    total_days = (end_at - start_at).total_seconds() / 86400.0
    cursor = start_at
    children: list[MuddaDashaPeriod] = []
    sequence = _sequence_from(parent)
    for index, planet in enumerate(sequence):
        duration_days = total_days * VIMSHOTTARI_YEARS[planet] / VIMSHOTTARI_TOTAL_YEARS
        child_end = end_at if index == len(sequence) - 1 else cursor + timedelta(days=duration_days)
        children.append(
            MuddaDashaPeriod(
                level="antardasha",
                planet=planet,
                start_date=cursor,
                end_date=child_end,
                duration_days=(child_end - cursor).total_seconds() / 86400.0,
            )
        )
        cursor = child_end
    return children


def _sequence_from(start_lord: str) -> tuple[str, ...]:
    start_index = VIMSHOTTARI_SEQUENCE.index(start_lord)
    return VIMSHOTTARI_SEQUENCE[start_index:] + VIMSHOTTARI_SEQUENCE[:start_index]


def _current_period(periods: list[MuddaDashaPeriod], reference: datetime) -> MuddaDashaPeriod | None:
    for period in periods:
        if period.start_date <= reference < period.end_date:
            for child in period.children:
                if child.start_date <= reference < child.end_date:
                    return child
            return period
    return None


def _reference_datetime(calculation_date: date | None, fallback: datetime) -> datetime:
    if calculation_date is None:
        return fallback
    return datetime.combine(calculation_date, fallback.timetz()).replace(tzinfo=fallback.tzinfo)
