from app.astrology.reports.engine import report_context
from app.astrology.schemas import Chart


class ReportService:
    def build_context(self, chart: Chart) -> dict[str, object]:
        return report_context(chart)
