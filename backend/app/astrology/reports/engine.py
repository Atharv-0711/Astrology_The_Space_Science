from app.astrology.interpretations.composer import collect_interpretation_factors
from app.astrology.reports.sections import REPORT_SECTIONS
from app.astrology.schemas import Chart


def report_context(chart: Chart) -> dict[str, object]:
    return {
        "sections": REPORT_SECTIONS,
        "factors": collect_interpretation_factors(chart),
    }
