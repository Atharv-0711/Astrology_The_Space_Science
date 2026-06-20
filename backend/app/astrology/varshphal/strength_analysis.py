from app.astrology.constants import DEFAULT_PLANETS
from app.astrology.schemas import Chart, PlanetPosition
from app.astrology.varshphal.schemas import (
    AnnualSummary,
    Muntha,
    StrengthAnalysis,
    TajikaAspect,
    TajikaYoga,
)
from app.astrology.zodiac import normalize_longitude

BENEFIC_PLANETS = {"Jupiter", "Venus", "Mercury", "Moon"}
MALEFIC_PLANETS = {"Saturn", "Mars", "Rahu", "Ketu", "Sun"}

COMBUSTION_ORBS: dict[str, float] = {
    "Moon": 12.0,
    "Mars": 17.0,
    "Mercury": 14.0,
    "Jupiter": 11.0,
    "Venus": 10.0,
    "Saturn": 15.0,
}

HOUSE_AREAS: dict[str, tuple[int, ...]] = {
    "career_score": (10, 6, 11),
    "wealth_score": (2, 11, 9),
    "marriage_score": (7, 2, 11),
    "health_score": (1, 6, 8),
    "education_score": (4, 5, 9),
    "travel_score": (3, 9, 12),
    "spiritual_score": (5, 9, 12),
}


def combust_status(planet_name: str, planet: PlanetPosition, sun: PlanetPosition) -> bool:
    orb = COMBUSTION_ORBS.get(planet_name)
    if orb is None:
        return False
    distance = abs(normalize_longitude(planet.longitude - sun.longitude))
    distance = min(distance, 360.0 - distance)
    return distance <= orb


def aspect_counts(aspects: list[TajikaAspect]) -> dict[str, int]:
    counts = {planet: 0 for planet in DEFAULT_PLANETS}
    for aspect in aspects:
        counts[aspect.source] = counts.get(aspect.source, 0) + 1
        counts[aspect.target] = counts.get(aspect.target, 0) + 1
    return counts


def muntha_strength(chart: Chart, muntha: Muntha, aspects: list[TajikaAspect]) -> float:
    munthesh = chart.planets.get(muntha.munthesh)
    if munthesh is None:
        return 50.0
    score = _planet_score(muntha.munthesh, munthesh, chart, aspects)
    if muntha.muntha_house in {1, 5, 9, 10, 11}:
        score += 10.0
    if muntha.muntha_house in {6, 8, 12}:
        score -= 10.0
    return _clamp(score)


def build_strength_analysis(chart: Chart, aspects: list[TajikaAspect]) -> StrengthAnalysis:
    planet_scores = {
        planet_name: _planet_score(planet_name, planet, chart, aspects)
        for planet_name, planet in chart.planets.items()
        if planet_name in DEFAULT_PLANETS
    }
    house_scores = {
        house_number: _house_score(chart, house_number, planet_scores)
        for house_number in range(1, 13)
    }
    strongest_planet = max(planet_scores, key=planet_scores.get)
    weakest_planet = min(planet_scores, key=planet_scores.get)
    strongest_house = max(house_scores, key=house_scores.get)
    weakest_house = min(house_scores, key=house_scores.get)
    benefic_score = _influence_score(planet_scores, BENEFIC_PLANETS)
    malefic_score = _influence_score(planet_scores, MALEFIC_PLANETS)
    return StrengthAnalysis(
        strongest_planet=strongest_planet,
        weakest_planet=weakest_planet,
        strongest_house=strongest_house,
        weakest_house=weakest_house,
        benefic_influence_score=benefic_score,
        malefic_influence_score=malefic_score,
    )


def build_annual_summary(
    chart: Chart,
    aspects: list[TajikaAspect],
    yogas: list[TajikaYoga],
) -> AnnualSummary:
    planet_scores = {
        planet_name: _planet_score(planet_name, planet, chart, aspects)
        for planet_name, planet in chart.planets.items()
        if planet_name in DEFAULT_PLANETS
    }
    house_scores = {
        house_number: _house_score(chart, house_number, planet_scores)
        for house_number in range(1, 13)
    }
    yoga_bonus = min(15.0, sum(yoga.strength for yoga in yogas if yoga.name == "Ithasala") / 40.0)
    radda_penalty = min(15.0, sum(yoga.strength for yoga in yogas if yoga.name == "Radda") / 40.0)
    return AnnualSummary(
        **{
            area: _clamp(
                sum(house_scores[house] for house in houses) / len(houses)
                + yoga_bonus
                - radda_penalty
            )
            for area, houses in HOUSE_AREAS.items()
        }
    )


def _planet_score(
    planet_name: str,
    planet: PlanetPosition,
    chart: Chart,
    aspects: list[TajikaAspect],
) -> float:
    score = 50.0
    if planet.dignity.exalted:
        score += 25.0
    if planet.dignity.own_sign or planet.dignity.moolatrikona:
        score += 15.0
    if planet.dignity.debilitated:
        score -= 25.0
    if planet.retrograde:
        score -= 8.0
    if planet.house in {1, 4, 5, 7, 9, 10, 11}:
        score += 8.0
    if planet.house in {6, 8, 12}:
        score -= 8.0
    if combust_status(planet_name, planet, chart.planets["Sun"]):
        score -= 12.0
    score += min(12.0, aspect_counts(aspects).get(planet_name, 0) * 3.0)
    return _clamp(score)


def _house_score(chart: Chart, house_number: int, planet_scores: dict[str, float]) -> float:
    house = chart.houses[house_number]
    score = 45.0
    score += len(house.occupants) * 5.0
    for occupant in house.occupants:
        score += (planet_scores.get(occupant, 50.0) - 50.0) / 4.0
    lord_score = planet_scores.get(house.lord)
    if lord_score is not None:
        score += (lord_score - 50.0) / 3.0
    if house_number in {1, 5, 9, 10, 11}:
        score += 5.0
    if house_number in {6, 8, 12}:
        score -= 5.0
    return _clamp(score)


def _influence_score(planet_scores: dict[str, float], planets: set[str]) -> float:
    values = [score for planet, score in planet_scores.items() if planet in planets]
    if not values:
        return 0.0
    return _clamp(sum(values) / len(values))


def _clamp(value: float) -> float:
    return round(max(0.0, min(100.0, value)), 2)
