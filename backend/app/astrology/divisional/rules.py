from app.astrology.divisional.base import DivisionalChartDefinition
from app.astrology.varga.rules import VARGA_CONFIG

DIVISIONAL_CHARTS: tuple[DivisionalChartDefinition, ...] = tuple(
    DivisionalChartDefinition(config.code, config.division, config.name)
    for config in VARGA_CONFIG.values()
)
