import pytest

pytest.importorskip("swisseph")

from app.astrology.schemas import Chart
from app.astrology.varshphal.sahams import calculate_sahams, supported_saham_count


def test_saham_engine_returns_required_registry_entries(sample_chart: Chart) -> None:
    sahams = calculate_sahams(sample_chart)

    assert supported_saham_count() >= 7
    assert {saham.name for saham in sahams} == {
        "Punya Saham",
        "Rajya Saham",
        "Karma Saham",
        "Vivaha Saham",
        "Putra Saham",
        "Vidya Saham",
        "Mrityu Saham",
    }
    assert all(0 <= saham.longitude < 360 for saham in sahams)
    assert all(saham.house in range(1, 13) for saham in sahams)
    assert all(saham.lord for saham in sahams)
    assert all(saham.formula.startswith("Ascendant +") for saham in sahams)
