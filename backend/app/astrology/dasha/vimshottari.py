from datetime import UTC, date, datetime, time, timedelta
from typing import TypeVar

from app.astrology.constants import NAKSHATRA_SPAN, VIMSHOTTARI_SEQUENCE, VIMSHOTTARI_YEARS
from app.astrology.dasha.schemas import (
    Antardasha,
    BirthBalance,
    CurrentDashaResponse,
    DashaPath,
    DashaPeriod,
    DashaTimeline,
    Mahadasha,
    MoonNakshatraInfo,
    NextDashaResponse,
    Prana,
    Pratyantar,
    Sookshma,
)
from app.astrology.dasha.interpretations import DashaInterpretationLoader
from app.astrology.schemas import Chart
from app.astrology.time import utc_datetime

VIMSHOTTARI_TOTAL_YEARS = 120.0
SOLAR_YEAR_DAYS = 365.2425
LEVEL_ORDER = ("mahadasha", "antardasha", "pratyantar", "sookshma", "prana")

PeriodT = TypeVar("PeriodT", bound=DashaPeriod)


def vimshottari_lord_sequence(start_lord: str) -> tuple[str, ...]:
    start_index = VIMSHOTTARI_SEQUENCE.index(start_lord)
    return VIMSHOTTARI_SEQUENCE[start_index:] + VIMSHOTTARI_SEQUENCE[:start_index]


def vimshottari_years(lord: str) -> int:
    return VIMSHOTTARI_YEARS[lord]


def calculate_vimshottari_dasha(
    chart: Chart,
    calculation_date: date | None = None,
    include_depth: int = 5,
) -> DashaTimeline:
    moon = chart.planets["Moon"]
    birth_at = utc_datetime(chart.birth_data)
    birth_lord = moon.zodiac.nakshatra_lord
    elapsed_degrees = moon.longitude % NAKSHATRA_SPAN
    remaining_degrees = NAKSHATRA_SPAN - elapsed_degrees
    elapsed_fraction = elapsed_degrees / NAKSHATRA_SPAN
    remaining_fraction = 1.0 - elapsed_fraction
    birth_lord_years = vimshottari_years(birth_lord)
    elapsed_years = birth_lord_years * elapsed_fraction
    remaining_years = birth_lord_years * remaining_fraction
    elapsed_days = _years_to_days(elapsed_years)
    remaining_days = _years_to_days(remaining_years)
    dasha_start_at = birth_at - timedelta(days=elapsed_days)
    dasha_end_at = birth_at + timedelta(days=remaining_days)

    mahadashas = _build_mahadashas(
        start_lord=birth_lord,
        birth_at=birth_at,
        birth_lord_end_at=dasha_end_at,
        include_depth=max(1, min(include_depth, len(LEVEL_ORDER))),
    )
    reference_at = _reference_datetime(calculation_date)
    interpretation_loader = DashaInterpretationLoader()
    _attach_interpretations(mahadashas, interpretation_loader)
    _mark_period_statuses(mahadashas, reference_at)
    path = _current_path(mahadashas, reference_at)
    current = _current_response(path, interpretation_loader)
    leaf_periods = _flatten_periods(mahadashas, target_level=LEVEL_ORDER[include_depth - 1])
    next_response = _next_response(leaf_periods, reference_at)

    return DashaTimeline(
        moon=MoonNakshatraInfo(
            longitude=moon.longitude,
            nakshatra_number=moon.zodiac.nakshatra_number,
            nakshatra=moon.zodiac.nakshatra,
            nakshatra_lord=birth_lord,
            pada=moon.zodiac.pada,
            elapsed_degrees=elapsed_degrees,
            remaining_degrees=remaining_degrees,
            elapsed_fraction=elapsed_fraction,
            remaining_fraction=remaining_fraction,
        ),
        birth_balance=BirthBalance(
            planet=birth_lord,
            total_years=birth_lord_years,
            elapsed_years=elapsed_years,
            remaining_years=remaining_years,
            elapsed_days=elapsed_days,
            remaining_days=remaining_days,
            mahadasha_start_date=dasha_start_at,
            birth_date=birth_at,
            mahadasha_end_date=dasha_end_at,
        ),
        mahadashas=mahadashas,
        current=current,
        next=next_response,
        past=[period for period in leaf_periods if period.end_date <= reference_at][-27:],
        future=[period for period in leaf_periods if period.start_date > reference_at][:27],
    )


def _build_mahadashas(
    start_lord: str,
    birth_at: datetime,
    birth_lord_end_at: datetime,
    include_depth: int,
) -> list[Mahadasha]:
    mahadashas: list[Mahadasha] = []
    cursor = birth_at
    cycle_end_at = birth_at + timedelta(days=_years_to_days(VIMSHOTTARI_TOTAL_YEARS))
    sequence = vimshottari_lord_sequence(start_lord)

    for index in range(len(sequence) + 1):
        lord = sequence[index % len(sequence)]
        natural_end_at = (
            birth_lord_end_at
            if index == 0
            else cursor + timedelta(days=_years_to_days(vimshottari_years(lord)))
        )
        end_at = min(natural_end_at, cycle_end_at)
        children = _build_children(
            parent_level_index=0,
            parent_lord=lord,
            start_at=cursor,
            end_at=end_at,
            include_depth=include_depth,
            lineage={"mahadasha": lord},
        )
        mahadashas.append(
            Mahadasha(
                planet=lord,
                start_date=cursor,
                end_date=end_at,
                duration_days=_duration_days(cursor, end_at),
                children=children,
            )
        )
        cursor = end_at
        if cursor >= cycle_end_at:
            break
    return mahadashas


def _build_children(
    parent_level_index: int,
    parent_lord: str,
    start_at: datetime,
    end_at: datetime,
    include_depth: int,
    lineage: dict[str, str],
) -> list[DashaPeriod]:
    child_level_index = parent_level_index + 1
    if child_level_index >= include_depth:
        return []

    child_level = LEVEL_ORDER[child_level_index]
    children: list[DashaPeriod] = []
    cursor = start_at
    total_days = _duration_days(start_at, end_at)

    for lord in vimshottari_lord_sequence(parent_lord):
        duration_days = total_days * vimshottari_years(lord) / VIMSHOTTARI_TOTAL_YEARS
        child_end_at = cursor + timedelta(days=duration_days)
        child_lineage = lineage | {child_level: lord}
        grandchildren = _build_children(
            parent_level_index=child_level_index,
            parent_lord=lord,
            start_at=cursor,
            end_at=child_end_at,
            include_depth=include_depth,
            lineage=child_lineage,
        )
        children.append(
            _period_for_level(
                level=child_level,
                planet=lord,
                start_at=cursor,
                end_at=child_end_at,
                lineage=child_lineage,
                children=grandchildren,
            )
        )
        cursor = child_end_at

    children[-1].end_date = end_at
    children[-1].duration_days = _duration_days(children[-1].start_date, end_at)
    return children


def _period_for_level(
    level: str,
    planet: str,
    start_at: datetime,
    end_at: datetime,
    lineage: dict[str, str],
    children: list[DashaPeriod],
) -> DashaPeriod:
    kwargs = {
        "planet": planet,
        "start_date": start_at,
        "end_date": end_at,
        "duration_days": _duration_days(start_at, end_at),
        "children": children,
    }
    if level == "antardasha":
        return Antardasha(parent_mahadasha=lineage["mahadasha"], **kwargs)
    if level == "pratyantar":
        return Pratyantar(
            parent_mahadasha=lineage["mahadasha"],
            parent_antardasha=lineage["antardasha"],
            **kwargs,
        )
    if level == "sookshma":
        return Sookshma(
            parent_mahadasha=lineage["mahadasha"],
            parent_antardasha=lineage["antardasha"],
            parent_pratyantar=lineage["pratyantar"],
            **kwargs,
        )
    if level == "prana":
        return Prana(
            parent_mahadasha=lineage["mahadasha"],
            parent_antardasha=lineage["antardasha"],
            parent_pratyantar=lineage["pratyantar"],
            parent_sookshma=lineage["sookshma"],
            **kwargs,
        )
    raise ValueError(f"Unsupported dasha level: {level}")


def _flatten_periods(periods: list[DashaPeriod], target_level: str | None = None) -> list[DashaPeriod]:
    flattened: list[DashaPeriod] = []
    for period in periods:
        if target_level is None or period.level == target_level:
            flattened.append(period)
        flattened.extend(_flatten_periods(period.children, target_level))
    return flattened


def _current_period(periods: list[PeriodT], reference_at: datetime) -> PeriodT | None:
    for period in periods:
        if period.start_date <= reference_at < period.end_date:
            return period
    return None


def _current_path(mahadashas: list[Mahadasha], reference_at: datetime) -> DashaPath:
    mahadasha = _current_period(mahadashas, reference_at)
    antardasha = _current_period(mahadasha.children, reference_at) if mahadasha else None
    pratyantar = _current_period(antardasha.children, reference_at) if antardasha else None
    sookshma = _current_period(pratyantar.children, reference_at) if pratyantar else None
    prana = _current_period(sookshma.children, reference_at) if sookshma else None
    return DashaPath(
        mahadasha=mahadasha,
        antardasha=antardasha if isinstance(antardasha, Antardasha) else None,
        pratyantar=pratyantar if isinstance(pratyantar, Pratyantar) else None,
        sookshma=sookshma if isinstance(sookshma, Sookshma) else None,
        prana=prana if isinstance(prana, Prana) else None,
    )


def _current_response(
    path: DashaPath,
    interpretation_loader: DashaInterpretationLoader,
) -> CurrentDashaResponse:
    leaf = path.prana or path.sookshma or path.pratyantar or path.antardasha or path.mahadasha
    interpretations = []
    if path.mahadasha:
        interpretations.append(interpretation_loader.load_mahadasha(path.mahadasha.planet))
    if path.mahadasha and path.antardasha:
        interpretations.append(
            interpretation_loader.load_antardasha(path.mahadasha.planet, path.antardasha.planet)
        )
    return CurrentDashaResponse(
        current_mahadasha=path.mahadasha.planet if path.mahadasha else None,
        current_antardasha=path.antardasha.planet if path.antardasha else None,
        current_pratyantar=path.pratyantar.planet if path.pratyantar else None,
        current_sookshma=path.sookshma.planet if path.sookshma else None,
        current_prana=path.prana.planet if path.prana else None,
        start_date=leaf.start_date if leaf else None,
        end_date=leaf.end_date if leaf else None,
        path=path,
        interpretations=[item for item in interpretations if item],
    )


def _next_response(periods: list[DashaPeriod], reference_at: datetime) -> NextDashaResponse:
    upcoming = sorted(
        [period for period in periods if period.start_date > reference_at],
        key=lambda period: period.start_date,
    )
    return NextDashaResponse(next=upcoming[0] if upcoming else None, upcoming=upcoming[:9])


def _attach_interpretations(
    periods: list[DashaPeriod],
    interpretation_loader: DashaInterpretationLoader,
) -> None:
    for period in periods:
        if period.level == "mahadasha":
            period.interpretation = interpretation_loader.load_mahadasha(period.planet)
        elif period.level == "antardasha" and period.parent_mahadasha:
            period.interpretation = interpretation_loader.load_antardasha(
                period.parent_mahadasha,
                period.planet,
            )
        _attach_interpretations(period.children, interpretation_loader)


def _mark_period_statuses(periods: list[DashaPeriod], reference_at: datetime) -> None:
    for period in periods:
        if period.end_date <= reference_at:
            period.status = "past"
        elif period.start_date <= reference_at < period.end_date:
            period.status = "running"
        else:
            period.status = "future"
        _mark_period_statuses(period.children, reference_at)


def _reference_datetime(calculation_date: date | None) -> datetime:
    if calculation_date is None:
        return datetime.now(UTC)
    return datetime.combine(calculation_date, time.min, tzinfo=UTC)


def _years_to_days(years: float) -> float:
    return years * SOLAR_YEAR_DAYS


def _duration_days(start_at: datetime, end_at: datetime) -> float:
    return (end_at - start_at).total_seconds() / 86_400.0
