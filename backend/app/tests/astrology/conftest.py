from datetime import date, time

import pytest

from app.astrology.engine import calculate_chart
from app.astrology.schemas import BirthData, Chart


@pytest.fixture
def sample_birth_data() -> BirthData:
    return BirthData(
        name="Test Native",
        birth_date=date(1990, 1, 1),
        birth_time=time(12, 0),
        latitude=28.6139,
        longitude=77.2090,
        timezone=5.5,
    )


@pytest.fixture
def sample_chart(sample_birth_data: BirthData) -> Chart:
    pytest.importorskip("swisseph")
    return calculate_chart(sample_birth_data)
