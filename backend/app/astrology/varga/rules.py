from app.astrology.varga.base import VargaConfig, VargaRule

VARGA_CONFIG: dict[int, VargaConfig] = {
    1: VargaConfig("D1", 1, "Rasi", VargaRule.identity),
    2: VargaConfig("D2", 2, "Hora", VargaRule.hora),
    3: VargaConfig("D3", 3, "Drekkana", VargaRule.drekkana),
    4: VargaConfig("D4", 4, "Chaturthamsa", VargaRule.cyclic_step, step=3),
    5: VargaConfig("D5", 5, "Panchamsa", VargaRule.panchamsa),
    6: VargaConfig("D6", 6, "Shashtamsa", VargaRule.cyclic),
    7: VargaConfig("D7", 7, "Saptamsa", VargaRule.odd_even, even_start_offset=6),
    8: VargaConfig(
        "D8",
        8,
        "Ashtamsa",
        VargaRule.relative_modality,
        movable_offset=0,
        fixed_offset=8,
        dual_offset=4,
    ),
    9: VargaConfig(
        "D9",
        9,
        "Navamsa",
        VargaRule.relative_modality,
        movable_offset=0,
        fixed_offset=8,
        dual_offset=4,
    ),
    10: VargaConfig("D10", 10, "Dashamsa", VargaRule.odd_even, even_start_offset=8),
    11: VargaConfig("D11", 11, "Rudramsa", VargaRule.cyclic),
    12: VargaConfig("D12", 12, "Dwadasamsa", VargaRule.cyclic),
    16: VargaConfig(
        "D16",
        16,
        "Shodasamsa",
        VargaRule.absolute_modality,
        movable_start_sign=1,
        fixed_start_sign=5,
        dual_start_sign=9,
    ),
    20: VargaConfig(
        "D20",
        20,
        "Vimsamsa",
        VargaRule.absolute_modality,
        movable_start_sign=1,
        fixed_start_sign=9,
        dual_start_sign=5,
    ),
    24: VargaConfig(
        "D24",
        24,
        "Siddhamsa",
        VargaRule.absolute_modality,
        movable_start_sign=5,
        fixed_start_sign=4,
        dual_start_sign=3,
    ),
    27: VargaConfig(
        "D27",
        27,
        "Bhamsa",
        VargaRule.absolute_modality,
        movable_start_sign=1,
        fixed_start_sign=4,
        dual_start_sign=9,
    ),
    30: VargaConfig("D30", 30, "Trimshamsa", VargaRule.trimshamsa),
    40: VargaConfig(
        "D40",
        40,
        "Khavedamsa",
        VargaRule.absolute_odd_even,
        odd_start_sign=1,
        even_start_sign=7,
    ),
    45: VargaConfig(
        "D45",
        45,
        "Akshavedamsa",
        VargaRule.absolute_modality,
        movable_start_sign=1,
        fixed_start_sign=5,
        dual_start_sign=9,
    ),
    60: VargaConfig("D60", 60, "Shastiamsa", VargaRule.cyclic),
}

SUPPORTED_CHARTS: dict[str, int] = {config.code: division for division, config in VARGA_CONFIG.items()}


def get_varga_config(division: int) -> VargaConfig:
    try:
        return VARGA_CONFIG[division]
    except KeyError as exc:
        raise ValueError(f"Unsupported varga division: D{division}") from exc


def get_varga_config_by_code(chart_code: str) -> VargaConfig:
    normalized = chart_code.upper()
    if not normalized.startswith("D"):
        raise ValueError(f"Unsupported varga chart: {chart_code}")

    try:
        division = int(normalized[1:])
    except ValueError as exc:
        raise ValueError(f"Unsupported varga chart: {chart_code}") from exc

    config = get_varga_config(division)
    if config.code != normalized:
        raise ValueError(f"Unsupported varga chart: {chart_code}")
    return config


def supported_vargas() -> tuple[VargaConfig, ...]:
    return tuple(VARGA_CONFIG[division] for division in sorted(VARGA_CONFIG))
