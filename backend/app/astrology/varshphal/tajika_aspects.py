from itertools import combinations

from app.astrology.schemas import Chart, PlanetPosition
from app.astrology.varshphal.schemas import TajikaAspect

TAJIKA_ASPECTS: dict[str, float] = {
    "Conjunction": 0.0,
    "Sextile": 60.0,
    "Square": 90.0,
    "Trine": 120.0,
    "Opposition": 180.0,
}

DEFAULT_ORBS: dict[str, float] = {
    "Conjunction": 8.0,
    "Sextile": 5.0,
    "Square": 6.0,
    "Trine": 6.0,
    "Opposition": 8.0,
}


def calculate_tajika_aspects(chart: Chart) -> list[TajikaAspect]:
    aspects: list[TajikaAspect] = []
    planets = list(chart.planets.values())

    for source, target in combinations(planets, 2):
        separation = _angular_separation(source.longitude, target.longitude)
        for aspect_type, exact_angle in TAJIKA_ASPECTS.items():
            orb = abs(separation - exact_angle)
            allowed_orb = DEFAULT_ORBS[aspect_type]
            if orb <= allowed_orb:
                aspects.append(
                    TajikaAspect(
                        source=source.name,
                        target=target.name,
                        aspect_type=aspect_type,  # type: ignore[arg-type]
                        exact_angle=exact_angle,
                        actual_angle=separation,
                        orb=orb,
                        applying=_is_applying(source, target, exact_angle),
                        strength=round(max(0.0, 100.0 * (1.0 - orb / allowed_orb)), 2),
                    )
                )
                break

    return sorted(aspects, key=lambda aspect: (-aspect.strength, aspect.orb))


def _angular_separation(first: float, second: float) -> float:
    distance = abs((first - second) % 360.0)
    return min(distance, 360.0 - distance)


def _is_applying(source: PlanetPosition, target: PlanetPosition, exact_angle: float) -> bool:
    faster, slower = (source, target) if abs(source.speed) >= abs(target.speed) else (target, source)
    current = _angular_separation(faster.longitude, slower.longitude)
    projected = _angular_separation(faster.longitude + faster.speed, slower.longitude + slower.speed)
    return abs(projected - exact_angle) < abs(current - exact_angle)
