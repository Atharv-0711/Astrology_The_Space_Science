from datetime import date, time

import pytest

pytest.importorskip("swisseph")

from app.astrology.schemas import AstrologySettings, BirthData
from app.services.varshphal_service import VarshphalService


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


def test_varshphal_service_exposes_core_predictive_sections(service_birth_data: BirthData) -> None:
    service = VarshphalService()
    report = service.report(service_birth_data, 2030, AstrologySettings())

    assert report.chart.chart_type == "Varshphal"
    assert report.muntha.munthesh
    assert report.mudda_dasha.periods
    assert report.sahams

    tajika = service.tajika(service_birth_data, 2030, AstrologySettings())
    assert len(tajika.yoga_statuses) == 8
    assert {status.name for status in tajika.yoga_statuses} >= {"Ithasala", "Duhphali Kuttha"}
    assert all(0 <= status.strength <= 100 for status in tajika.yoga_statuses)

    sahams = service.sahams(service_birth_data, 2030, AstrologySettings())
    assert sahams.supported_count >= 7
    assert len(sahams.sahams) == 7

    annual = service.annual_horoscope(service_birth_data, 2030, AstrologySettings())
    assert annual.varsha_pravesh.varshphal_year == 2030
    assert annual.muntha.muntha_house in range(1, 13)
