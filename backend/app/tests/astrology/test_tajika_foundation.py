import pytest

pytest.importorskip("swisseph")

from app.astrology.schemas import Chart
from app.astrology.varshphal.tajika_aspects import calculate_tajika_aspects
from app.astrology.varshphal.tajika_yogas import (
    TAJIKA_YOGA_NAMES,
    build_tajika_report,
    detect_tajika_yogas,
)


def test_tajika_report_includes_active_and_inactive_categories(sample_chart: Chart) -> None:
    aspects = calculate_tajika_aspects(sample_chart)
    yogas = detect_tajika_yogas(sample_chart, aspects)
    report = build_tajika_report(aspects, yogas)

    assert [status.name for status in report.yoga_statuses] == list(TAJIKA_YOGA_NAMES)
    assert any(status.active for status in report.yoga_statuses)
    assert all(0 <= status.strength <= 100 for status in report.yoga_statuses)
    assert all(status.active == bool(status.yogas) for status in report.yoga_statuses)
