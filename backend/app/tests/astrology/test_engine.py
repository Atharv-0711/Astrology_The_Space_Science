from datetime import date, time

import pytest

pytest.importorskip("swisseph")

from app.astrology.engine import calculate_chart
from app.astrology.schemas import BirthData


def test_calculate_chart_returns_complete_d1_payload() -> None:
    chart = calculate_chart(
        BirthData(
            name="Test Native",
            birth_date=date(1990, 1, 1),
            birth_time=time(12, 0),
            latitude=28.6139,
            longitude=77.2090,
            timezone=5.5,
        )
    )

    assert chart.chart_type == "D1"
    assert len(chart.planets) == 9
    assert len(chart.houses) == 12
    assert chart.ascendant.zodiac.sign_number in range(1, 13)
    assert all(planet.house in range(1, 13) for planet in chart.planets.values())
