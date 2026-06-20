from datetime import date, time

import pytest

pytest.importorskip("swisseph")

from app.astrology.schemas import BirthData
from app.astrology.varshphal.engine import (
    calculate_annual_horoscope_information_block,
    calculate_varshphal,
)
from app.astrology.varshphal.solar_return import calculate_varsh_pravesh


def rishikesh_birth_data() -> BirthData:
    return BirthData(
        name="Example Native",
        gender="Male",
        birth_date=date(2003, 11, 4),
        birth_time=time(19, 10),
        place_of_birth="Rishikesh",
        country="India",
        latitude=30.0869,
        longitude=78.2676,
        timezone=5.5,
    )


def test_solar_return_matches_natal_sidereal_sun() -> None:
    pravesh = calculate_varsh_pravesh(rishikesh_birth_data(), 2030)

    assert pravesh.local_datetime.year == 2030
    assert abs(pravesh.return_sun_longitude - pravesh.natal_sun_longitude) < 1e-5


def test_varshphal_report_contains_core_sections() -> None:
    report = calculate_varshphal(rishikesh_birth_data(), 2030)

    assert report.chart.chart_type == "Varshphal"
    assert len(report.chart.houses) == 12
    assert report.muntha.muntha_house in range(1, 13)
    assert report.muntha.munthesh
    assert len(report.sahams) >= 7
    assert report.mudda_dasha.periods
    assert report.predictions


def test_mudda_dasha_covers_varshphal_year() -> None:
    report = calculate_varshphal(rishikesh_birth_data(), 2030)
    periods = report.mudda_dasha.periods

    assert periods[0].start_date == report.varsh_pravesh.local_datetime
    assert periods[-1].end_date == report.mudda_dasha.year_end
    assert all(period.children for period in periods)


def test_tajika_yoga_engine_is_extensible_and_returns_requested_names() -> None:
    report = calculate_varshphal(rishikesh_birth_data(), 2030)
    detected_names = {yoga.name for yoga in report.tajika_yogas}

    assert detected_names <= {
        "Ithasala",
        "Isharafa",
        "Nakta",
        "Yamaya",
        "Kamboola",
        "Manahoo",
        "Radda",
        "Duhphali Kuttha",
    }


def test_annual_horoscope_information_block_contains_requested_sections() -> None:
    block = calculate_annual_horoscope_information_block(rishikesh_birth_data(), 2030)

    assert block.birth_info.name == "Example Native"
    assert block.birth_info.gender == "Male"
    assert block.birth_info.place_of_birth == "Rishikesh"
    assert block.astronomical_data.julian_day > 0
    assert block.astronomical_data.ayanamsha_value > 0
    assert block.natal_reference.lagna
    assert block.natal_reference.yoga
    assert block.varsha_pravesh.varshphal_year == 2030
    assert block.varsha_pravesh.varsha_yoga
    assert block.muntha.muntha_house in range(1, 13)
    assert 0 <= block.muntha.muntha_strength <= 100
    assert block.tajika.tajika_aspects
    assert block.sahams.punya_saham
    assert set(block.planetary_positions) == {
        "Sun",
        "Moon",
        "Mars",
        "Mercury",
        "Jupiter",
        "Venus",
        "Saturn",
        "Rahu",
        "Ketu",
    }
    assert 0 <= block.strength_analysis.benefic_influence_score <= 100
    assert 0 <= block.annual_summary.career_score <= 100
