from app.astrology.varga.base import VargaConfig, VargaRule

MOVABLE_SIGNS = {1, 4, 7, 10}
FIXED_SIGNS = {2, 5, 8, 11}
DUAL_SIGNS = {3, 6, 9, 12}


def advance_sign(sign_number: int, offset: int) -> int:
    return ((sign_number + offset - 1) % 12) + 1


def resolve_varga_sign(sign_number: int, degree: float, config: VargaConfig) -> tuple[int, int]:
    segment = segment_for_degree(degree, config.division)

    if config.rule == VargaRule.identity:
        return sign_number, segment + 1
    if config.rule == VargaRule.cyclic:
        return advance_sign(sign_number, segment), segment + 1
    if config.rule == VargaRule.cyclic_step:
        return advance_sign(sign_number, segment * config.step), segment + 1
    if config.rule == VargaRule.hora:
        return _hora_sign(sign_number, segment), segment + 1
    if config.rule == VargaRule.drekkana:
        return advance_sign(sign_number, segment * 4), segment + 1
    if config.rule == VargaRule.odd_even:
        start_offset = config.odd_start_offset if sign_number % 2 == 1 else config.even_start_offset
        return advance_sign(advance_sign(sign_number, start_offset), segment), segment + 1
    if config.rule == VargaRule.relative_modality:
        return advance_sign(_relative_modality_start(sign_number, config), segment), segment + 1
    if config.rule == VargaRule.absolute_modality:
        return advance_sign(_absolute_modality_start(sign_number, config), segment), segment + 1
    if config.rule == VargaRule.absolute_odd_even:
        return advance_sign(_absolute_odd_even_start(sign_number, config), segment), segment + 1
    if config.rule == VargaRule.panchamsa:
        return _panchamsa_sign(sign_number, segment), segment + 1
    if config.rule == VargaRule.trimshamsa:
        return _trimshamsa_sign(sign_number, degree), segment + 1

    raise ValueError(f"Unsupported varga rule: {config.rule}")


def segment_for_degree(degree: float, division: int) -> int:
    segment_size = 30.0 / division
    return min(int(degree // segment_size), division - 1)


def _hora_sign(sign_number: int, segment: int) -> int:
    if sign_number % 2 == 1:
        return 5 if segment == 0 else 4
    return 4 if segment == 0 else 5


def _relative_modality_start(sign_number: int, config: VargaConfig) -> int:
    if sign_number in MOVABLE_SIGNS:
        return advance_sign(sign_number, config.movable_offset)
    if sign_number in FIXED_SIGNS:
        return advance_sign(sign_number, config.fixed_offset)
    return advance_sign(sign_number, config.dual_offset)


def _absolute_modality_start(sign_number: int, config: VargaConfig) -> int:
    if sign_number in MOVABLE_SIGNS and config.movable_start_sign is not None:
        return config.movable_start_sign
    if sign_number in FIXED_SIGNS and config.fixed_start_sign is not None:
        return config.fixed_start_sign
    if sign_number in DUAL_SIGNS and config.dual_start_sign is not None:
        return config.dual_start_sign
    raise ValueError(f"Missing absolute modality start sign for {config.code}")


def _absolute_odd_even_start(sign_number: int, config: VargaConfig) -> int:
    if sign_number % 2 == 1 and config.odd_start_sign is not None:
        return config.odd_start_sign
    if sign_number % 2 == 0 and config.even_start_sign is not None:
        return config.even_start_sign
    raise ValueError(f"Missing odd/even start sign for {config.code}")


def _panchamsa_sign(sign_number: int, segment: int) -> int:
    odd_sequence = (1, 11, 9, 3, 7)
    even_sequence = (2, 6, 12, 10, 8)
    sequence = odd_sequence if sign_number % 2 == 1 else even_sequence
    return sequence[segment]


def _trimshamsa_sign(sign_number: int, degree: float) -> int:
    boundaries = trimshamsa_boundaries(sign_number)

    for upper_bound, target_sign in boundaries:
        if degree < upper_bound:
            return target_sign
    return boundaries[-1][1]


def trimshamsa_boundaries(sign_number: int) -> tuple[tuple[float, int], ...]:
    if sign_number % 2 == 1:
        return ((5.0, 1), (10.0, 11), (18.0, 9), (25.0, 3), (30.0, 7))
    return ((5.0, 2), (12.0, 6), (20.0, 12), (25.0, 10), (30.0, 8))


def trimshamsa_segment_degree(sign_number: int, degree: float) -> float:
    lower_bound = 0.0
    for upper_bound, _target_sign in trimshamsa_boundaries(sign_number):
        if degree < upper_bound:
            return ((degree - lower_bound) / (upper_bound - lower_bound)) * 30.0
        lower_bound = upper_bound
    return 29.999999999
