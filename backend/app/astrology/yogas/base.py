from abc import ABC, abstractmethod
from dataclasses import dataclass

from app.astrology.schemas import Chart


@dataclass(frozen=True)
class YogaResult:
    name: str
    active: bool
    strength: float
    category: str
    evidence: tuple[str, ...]
    modifiers: tuple[str, ...]
    description: str


class YogaRule(ABC):
    name: str

    @abstractmethod
    def evaluate(self, chart: Chart) -> YogaResult:
        raise NotImplementedError
