from dataclasses import dataclass


@dataclass(frozen=True)
class DivisionalChartDefinition:
    code: str
    division: int
    name: str
