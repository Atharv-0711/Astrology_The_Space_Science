from datetime import date, time

import pytest

pytest.importorskip("swisseph")

from app.astrology.schemas import AstrologySettings, BirthData
from app.services.dasha_service import DashaService


@pytest.fixture
def service_birth_data() -> BirthData:
    return BirthData(
        name="Test Native",
        birth_date=date(1990, 1, 1),
        birth_time=time(12, 0),
        latitude=28.6139,
        longitude=77.2090,
        timezone=5.5,
    )


def test_dasha_service_calculates_five_level_vimshottari(service_birth_data: BirthData) -> None:
    service = DashaService()
    chart = service.calculate_birth_chart(service_birth_data, AstrologySettings())
    timeline = service.calculate_timeline(chart, calculation_date=date(1995, 1, 1), include_depth=5)

    assert timeline.birth_balance.planet == chart.planets["Moon"].zodiac.nakshatra_lord
    assert timeline.mahadashas[0].children[0].children[0].children[0].children
    assert timeline.current.current_mahadasha is not None
    assert timeline.current.path.mahadasha is not None
    assert timeline.current.path.mahadasha.status == "running"
    assert service.next(chart, calculation_date=date(1995, 1, 1), include_depth=5).next is not None
