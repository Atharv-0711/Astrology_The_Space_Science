from datetime import date

import pytest

from app.astrology.constants import NAKSHATRA_SPAN, VIMSHOTTARI_SEQUENCE, VIMSHOTTARI_YEARS
from app.astrology.dasha.vimshottari import calculate_vimshottari_dasha, vimshottari_lord_sequence
from app.astrology.schemas import Chart
from app.astrology.zodiac import zodiac_position


def test_vimshottari_timeline_generates_nested_periods(sample_chart: Chart) -> None:
    timeline = calculate_vimshottari_dasha(sample_chart, calculation_date=date(1990, 1, 2))

    assert timeline.birth_balance.planet == sample_chart.planets["Moon"].zodiac.nakshatra_lord
    assert timeline.moon.nakshatra == sample_chart.planets["Moon"].zodiac.nakshatra
    assert len(timeline.mahadashas) >= 9
    assert len(timeline.mahadashas[0].children) == 9
    assert len(timeline.mahadashas[0].children[0].children) == 9
    assert len(timeline.mahadashas[0].children[0].children[0].children) == 9
    assert len(timeline.mahadashas[0].children[0].children[0].children[0].children) == 9
    assert timeline.current.current_mahadasha is not None
    assert timeline.current.path.mahadasha is not None
    assert timeline.current.path.mahadasha.status == "running"
    assert timeline.next.next is not None


def test_vimshottari_periods_are_chronological(sample_chart: Chart) -> None:
    timeline = calculate_vimshottari_dasha(sample_chart, calculation_date=date(1995, 1, 1))

    for previous, current in zip(timeline.mahadashas, timeline.mahadashas[1:]):
        assert previous.end_date == current.start_date
        assert previous.start_date < previous.end_date

    assert sum(period.duration_days for period in timeline.mahadashas) == pytest.approx(120 * 365.2425)


def test_nakshatra_determination_uses_27_equal_segments() -> None:
    position = zodiac_position(13.4)

    assert position.nakshatra == "Bharani"
    assert position.nakshatra_lord == "Venus"
    assert position.pada == 1


def test_birth_balance_uses_remaining_nakshatra_fraction(sample_chart: Chart) -> None:
    timeline = calculate_vimshottari_dasha(sample_chart, calculation_date=sample_chart.birth_data.birth_date)
    moon = sample_chart.planets["Moon"]
    elapsed_fraction = (moon.longitude % NAKSHATRA_SPAN) / NAKSHATRA_SPAN
    expected_remaining = VIMSHOTTARI_YEARS[moon.zodiac.nakshatra_lord] * (1.0 - elapsed_fraction)

    assert timeline.birth_balance.remaining_years == expected_remaining
    assert timeline.mahadashas[0].planet == moon.zodiac.nakshatra_lord
    assert timeline.mahadashas[0].start_date == timeline.birth_balance.birth_date
    assert timeline.mahadashas[0].end_date == timeline.birth_balance.mahadasha_end_date


def test_mahadasha_sequence_starts_from_moon_nakshatra_lord(sample_chart: Chart) -> None:
    timeline = calculate_vimshottari_dasha(sample_chart, calculation_date=date(1995, 1, 1), include_depth=1)
    expected = vimshottari_lord_sequence(sample_chart.planets["Moon"].zodiac.nakshatra_lord)

    assert [period.planet for period in timeline.mahadashas[:9]] == list(expected)


def test_antardasha_sequence_starts_from_parent_mahadasha(sample_chart: Chart) -> None:
    timeline = calculate_vimshottari_dasha(sample_chart, calculation_date=date(1995, 1, 1), include_depth=2)
    first_mahadasha = timeline.mahadashas[0]

    assert [period.planet for period in first_mahadasha.children] == list(
        vimshottari_lord_sequence(first_mahadasha.planet)
    )
    assert [period.planet for period in first_mahadasha.children] != list(VIMSHOTTARI_SEQUENCE)
