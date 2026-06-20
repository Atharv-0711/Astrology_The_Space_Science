from itertools import combinations

from app.astrology.constants import VEDIC_ASPECT_OFFSETS, WESTERN_ASPECT_ANGLES
from app.astrology.schemas import Aspect, AstrologySettings, PlanetPosition

NODE_PAIR = {"Rahu", "Ketu"}


def house_from_aspect_offset(source_house: int, offset: int) -> int:
    return ((source_house + offset - 2) % 12) + 1


def angular_separation(first: float, second: float) -> float:
    separation = abs(first - second) % 360.0
    return min(separation, 360.0 - separation)


def calculate_vedic_aspects(planets: dict[str, PlanetPosition]) -> list[Aspect]:
    aspects: list[Aspect] = []
    for source_name, source in planets.items():
        if source.house is None:
            continue
        aspect_offsets = VEDIC_ASPECT_OFFSETS.get(source_name, (7,))
        aspected_houses = {
            house_from_aspect_offset(source.house, offset) for offset in aspect_offsets
        }

        for target_name, target in planets.items():
            if source_name == target_name or target.house is None:
                continue
            if _is_node_pair(source_name, target_name):
                continue
            if target.house in aspected_houses:
                offset = _aspect_offset_between_houses(source.house, target.house)
                aspects.append(
                    Aspect(
                        source=source_name,
                        target=target_name,
                        aspect_type=f"{_ordinal(offset)} Aspect",
                        aspect_system="Vedic",
                        source_house=source.house,
                        target_house=target.house,
                        strength=100,
                        exact=True,
                        reason=(
                            f"{source_name} is in house {source.house}; by Vedic drishti it casts "
                            f"its {_ordinal(offset)} aspect on house {target.house}, where {target_name} is placed."
                        ),
                    )
                )

    return aspects


def calculate_western_aspects(
    planets: dict[str, PlanetPosition],
    orb: float,
) -> list[Aspect]:
    aspects: list[Aspect] = []
    for source_name, target_name in combinations(planets, 2):
        if _is_node_pair(source_name, target_name):
            continue
        source = planets[source_name]
        target = planets[target_name]
        separation = angular_separation(source.longitude, target.longitude)

        for aspect_name, exact_angle in WESTERN_ASPECT_ANGLES.items():
            aspect_orb = abs(separation - exact_angle)
            if aspect_orb <= orb:
                aspects.append(
                    Aspect(
                        source=source_name,
                        target=target_name,
                        aspect_type=aspect_name,
                        aspect_system="Western",
                        angle=separation,
                        orb=aspect_orb,
                        source_house=source.house,
                        target_house=target.house,
                        strength=round(_western_strength(aspect_orb, orb), 2),
                        exact=aspect_orb == 0,
                        reason=(
                            f"{source_name} and {target_name} are {round(separation, 2)}° apart, "
                            f"within {round(aspect_orb, 2)}° of the exact {int(exact_angle)}° {aspect_name}."
                        ),
                    )
                )

    return aspects


def calculate_aspects(
    planets: dict[str, PlanetPosition],
    settings: AstrologySettings,
) -> list[Aspect]:
    aspects: list[Aspect] = []
    if settings.enable_vedic_aspects:
        aspects.extend(calculate_vedic_aspects(planets))
    if settings.enable_western_aspects:
        aspects.extend(calculate_western_aspects(planets, settings.western_aspect_orb))
    return aspects


def _aspect_offset_between_houses(source_house: int, target_house: int) -> int:
    return ((target_house - source_house) % 12) + 1


def _ordinal(value: int) -> str:
    if 10 <= value % 100 <= 20:
        suffix = "th"
    else:
        suffix = {1: "st", 2: "nd", 3: "rd"}.get(value % 10, "th")
    return f"{value}{suffix}"


def _is_node_pair(source_name: str, target_name: str) -> bool:
    return {source_name, target_name} == NODE_PAIR


def _western_strength(aspect_orb: float, allowed_orb: float) -> float:
    if allowed_orb == 0:
        return 100.0
    return max(0.0, 100.0 * (1.0 - aspect_orb / allowed_orb))
