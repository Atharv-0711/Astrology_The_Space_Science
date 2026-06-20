from dataclasses import dataclass
from enum import StrEnum
from typing import Mapping

from pydantic import BaseModel, Field


class VargaRule(StrEnum):
    identity = "identity"
    cyclic = "cyclic"
    cyclic_step = "cyclic_step"
    hora = "hora"
    drekkana = "drekkana"
    odd_even = "odd_even"
    relative_modality = "relative_modality"
    absolute_modality = "absolute_modality"
    absolute_odd_even = "absolute_odd_even"
    panchamsa = "panchamsa"
    trimshamsa = "trimshamsa"


@dataclass(frozen=True)
class VargaConfig:
    code: str
    division: int
    name: str
    rule: VargaRule
    step: int = 1
    odd_start_offset: int = 0
    even_start_offset: int = 0
    movable_offset: int = 0
    fixed_offset: int = 0
    dual_offset: int = 0
    movable_start_sign: int | None = None
    fixed_start_sign: int | None = None
    dual_start_sign: int | None = None
    odd_start_sign: int | None = None
    even_start_sign: int | None = None


class VargaCalculationResult(BaseModel):
    division: int = Field(ge=1, le=60)
    chart_code: str
    chart_name: str
    longitude: float
    rashi: str
    sign_number: int = Field(ge=1, le=12)
    degree: float = Field(ge=0.0, lt=30.0)
    segment: int = Field(ge=1)


VargaConfigMap = Mapping[int, VargaConfig]
