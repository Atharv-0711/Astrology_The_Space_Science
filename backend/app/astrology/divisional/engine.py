from app.astrology.divisional.base import DivisionalChartDefinition
from app.astrology.divisional.rules import DIVISIONAL_CHARTS
from app.astrology.schemas import Chart
from app.astrology.varga.calculator import calculate_named_varga_chart
from app.astrology.varga.engine import divisional_longitude as calculate_divisional_longitude
from app.astrology.varga.rules import get_varga_config_by_code


def supported_divisional_charts() -> tuple[DivisionalChartDefinition, ...]:
    return DIVISIONAL_CHARTS


def calculate_d1_chart(chart: Chart) -> Chart:
    return chart.model_copy(update={"chart_type": "D1"})


def calculate_d9_chart(chart: Chart) -> Chart:
    return calculate_divisional_chart(chart, chart_type="D9")


def calculate_d10_chart(chart: Chart) -> Chart:
    return calculate_divisional_chart(chart, chart_type="D10")


def calculate_divisional_chart(chart: Chart, chart_type: str) -> Chart:
    return calculate_named_varga_chart(chart, chart_type)


def divisional_longitude(longitude: float, chart_type: str) -> float:
    config = get_varga_config_by_code(chart_type)
    return calculate_divisional_longitude(longitude, config.division)
