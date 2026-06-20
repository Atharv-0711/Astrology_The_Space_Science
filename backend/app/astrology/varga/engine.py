from app.astrology.constants import SIGN_BY_NUMBER
from app.astrology.varga.base import VargaCalculationResult, VargaConfig, VargaRule
from app.astrology.varga.mappings import (
    resolve_varga_sign,
    segment_for_degree,
    trimshamsa_segment_degree,
)
from app.astrology.varga.rules import get_varga_config
from app.astrology.zodiac import degree_in_sign, sign_number_for_longitude


def calculate_varga(longitude: float, division: int) -> VargaCalculationResult:
    config = get_varga_config(division)
    varga_longitude, sign_number, segment = calculate_varga_longitude(longitude, config)
    sign = SIGN_BY_NUMBER[sign_number]

    return VargaCalculationResult(
        division=config.division,
        chart_code=config.code,
        chart_name=config.name,
        longitude=varga_longitude,
        rashi=sign.name,
        sign_number=sign.number,
        degree=degree_in_sign(varga_longitude),
        segment=segment,
    )


def divisional_longitude(longitude: float, division: int) -> float:
    config = get_varga_config(division)
    varga_longitude, _sign_number, _segment = calculate_varga_longitude(longitude, config)
    return varga_longitude


def calculate_varga_longitude(longitude: float, config: VargaConfig) -> tuple[float, int, int]:
    sign_number = sign_number_for_longitude(longitude)
    degree = degree_in_sign(longitude)
    target_sign, segment = resolve_varga_sign(sign_number, degree, config)
    segment_degree = _segment_degree(sign_number, degree, config)
    varga_longitude = ((target_sign - 1) * 30.0) + segment_degree
    return varga_longitude % 360.0, target_sign, segment


def _segment_degree(sign_number: int, degree: float, config: VargaConfig) -> float:
    if config.rule == VargaRule.identity:
        return degree
    if config.rule == VargaRule.trimshamsa:
        return trimshamsa_segment_degree(sign_number, degree)

    segment_size = 30.0 / config.division
    segment = segment_for_degree(degree, config.division)
    lower_bound = segment * segment_size
    return ((degree - lower_bound) / segment_size) * 30.0
