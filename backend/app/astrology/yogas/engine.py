from app.astrology.schemas import Chart
from app.astrology.yogas.base import YogaResult, YogaRule


class YogaEngine:
    def __init__(self, rules: tuple[YogaRule, ...] = ()) -> None:
        self._rules = rules

    def evaluate(self, chart: Chart) -> list[YogaResult]:
        return [rule.evaluate(chart) for rule in self._rules]
