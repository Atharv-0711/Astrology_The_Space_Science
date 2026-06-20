"""Traditional Jyotish strength scoring.

This module intentionally keeps the traditional strength system separate from the
frontend Planet Power Index. Scores are normalized to 0-100 for dashboard display.
The constants below are conservative Parashara-style defaults and are kept here
so future formula refinements do not change the API contract.
"""

from statistics import mean

from app.astrology.constants import DEFAULT_PLANETS, SIGN_BY_NUMBER
from app.astrology.schemas import (
    Aspect,
    Chart,
    PlanetPosition,
    TraditionalComponentScore,
    TraditionalPlanetStrength,
    TraditionalShadbalaScore,
    TraditionalStrengthResponse,
)

CLASSICAL_PLANETS = ("Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn")
WAR_PLANETS = ("Mars", "Mercury", "Jupiter", "Venus", "Saturn")
NODES = {"Rahu", "Ketu"}
BENEFICS = {"Jupiter", "Venus", "Mercury", "Moon"}
MALEFICS = {"Sun", "Mars", "Saturn", "Rahu", "Ketu"}

NATURAL_FRIENDS: dict[str, set[str]] = {
    "Sun": {"Moon", "Mars", "Jupiter"},
    "Moon": {"Sun", "Mercury"},
    "Mars": {"Sun", "Moon", "Jupiter"},
    "Mercury": {"Sun", "Venus"},
    "Jupiter": {"Sun", "Moon", "Mars"},
    "Venus": {"Mercury", "Saturn"},
    "Saturn": {"Mercury", "Venus"},
    "Rahu": {"Venus", "Saturn", "Mercury"},
    "Ketu": {"Mars", "Jupiter", "Venus"},
}
NATURAL_ENEMIES: dict[str, set[str]] = {
    "Sun": {"Venus", "Saturn"},
    "Moon": set(),
    "Mars": {"Mercury"},
    "Mercury": {"Moon"},
    "Jupiter": {"Mercury", "Venus"},
    "Venus": {"Sun", "Moon"},
    "Saturn": {"Sun", "Moon", "Mars"},
    "Rahu": {"Sun", "Moon", "Mars"},
    "Ketu": {"Sun", "Moon"},
}

COMBUSTION_ORBS = {
    "Moon": 12.0,
    "Mars": 17.0,
    "Mercury": 14.0,
    "Jupiter": 11.0,
    "Venus": 10.0,
    "Saturn": 15.0,
}

DIG_BALA_HOUSES = {
    "Sun": 10,
    "Mars": 10,
    "Moon": 4,
    "Venus": 4,
    "Jupiter": 1,
    "Mercury": 1,
    "Saturn": 7,
}

NAISARGIKA_BALA = {
    "Sun": 100.0,
    "Moon": 85.0,
    "Venus": 72.0,
    "Jupiter": 57.0,
    "Mercury": 43.0,
    "Mars": 28.0,
    "Saturn": 15.0,
    "Rahu": 35.0,
    "Ketu": 35.0,
}

# Simplified bindu support houses used for first-pass Ashtakavarga scoring.
ASHTAKAVARGA_SUPPORT_OFFSETS = {
    "Sun": {1, 2, 4, 7, 8, 9, 10, 11},
    "Moon": {1, 3, 6, 7, 10, 11},
    "Mars": {1, 2, 4, 7, 8, 10, 11},
    "Mercury": {1, 2, 4, 6, 8, 10, 11},
    "Jupiter": {1, 2, 4, 5, 7, 9, 10, 11},
    "Venus": {1, 2, 3, 4, 5, 8, 9, 11},
    "Saturn": {3, 5, 6, 10, 11},
    "Ascendant": {1, 3, 4, 5, 9, 10, 11},
}


def calculate_traditional_strength(charts: dict[str, Chart]) -> TraditionalStrengthResponse:
    d1 = charts["D1"]
    war_statuses = _planetary_war_statuses(d1)
    rows = [
        _planet_strength(planet_name, charts, war_statuses)
        for planet_name in DEFAULT_PLANETS
        if planet_name in d1.planets
    ]
    rows.sort(key=lambda row: row.final_traditional_strength, reverse=True)
    return TraditionalStrengthResponse(
        scoring_note=(
            "Normalized 0-100 traditional Jyotish strength using conservative "
            "Parashara-style defaults for friendship, combustion, planetary war, "
            "Shadbala components, Ashtakavarga support, and D1/D9/D10/D60 varga support."
        ),
        planets=rows,
    )


def _planet_strength(
    planet_name: str,
    charts: dict[str, Chart],
    war_statuses: dict[str, tuple[str, float]],
) -> TraditionalPlanetStrength:
    d1 = charts["D1"]
    planet = d1.planets[planet_name]
    dignity = _dignity_score(planet, d1)
    shadbala = _shadbala_score(planet_name, charts)
    ashtakavarga = _ashtakavarga_score(planet_name, d1)
    varga = _varga_support_score(planet_name, charts)
    aspect_quality = _aspect_quality_score(planet_name, d1.aspects)
    combustion_status, combustion_penalty = _combustion_status(planet_name, d1)
    war_status, war_penalty = war_statuses.get(planet_name, ("Not in planetary war", 0.0))

    final = _clamp(
        dignity.score * 0.18
        + shadbala.total * 0.32
        + ashtakavarga.score * 0.15
        + varga.score * 0.18
        + aspect_quality.score * 0.12
        + 5.0
        - combustion_penalty
        - war_penalty
    )
    return TraditionalPlanetStrength(
        planet=planet_name,
        dignity_score=dignity,
        shadbala_score=shadbala,
        ashtakavarga_score=ashtakavarga,
        varga_support_score=varga,
        aspect_quality_score=aspect_quality,
        combustion_status=combustion_status,
        combustion_penalty=round(combustion_penalty, 2),
        planetary_war_status=war_status,
        planetary_war_penalty=round(war_penalty, 2),
        sign_relationship=_sign_relationship(planet, d1)[0],
        final_traditional_strength=round(final, 2),
        evidence=[
            f"Final = dignity 18%, Shadbala 32%, Ashtakavarga 15%, varga support 18%, aspect quality 12%, baseline 5, minus combustion/war penalties.",
            f"Combustion: {combustion_status}.",
            f"Planetary war: {war_status}.",
        ],
    )


def _dignity_score(planet: PlanetPosition, chart: Chart) -> TraditionalComponentScore:
    relationship, relationship_evidence = _sign_relationship(planet, chart)
    score = 55.0
    evidence = [relationship_evidence]
    if planet.dignity.exalted:
        score = 100.0
        evidence.append("Planet is exalted.")
    elif planet.dignity.moolatrikona:
        score = 88.0
        evidence.append("Planet is in moolatrikona.")
    elif planet.dignity.own_sign:
        score = 82.0
        evidence.append("Planet is in own sign.")
    elif planet.dignity.debilitated:
        score = 20.0
        evidence.append("Planet is debilitated.")
    elif relationship == "Friend Sign":
        score = 70.0
    elif relationship == "Enemy Sign":
        score = 35.0

    return TraditionalComponentScore(score=score, evidence=evidence)


def _shadbala_score(planet_name: str, charts: dict[str, Chart]) -> TraditionalShadbalaScore:
    d1 = charts["D1"]
    planet = d1.planets[planet_name]
    components = {
        "sthana_bala": _dignity_score(planet, d1),
        "dig_bala": _dig_bala(planet_name, planet),
        "kala_bala": _kala_bala(planet_name, d1),
        "chesta_bala": _chesta_bala(planet_name, planet),
        "naisargika_bala": TraditionalComponentScore(
            score=NAISARGIKA_BALA.get(planet_name, 40.0),
            evidence=[f"Naisargika Bala uses normalized natural strength for {planet_name}."],
        ),
        "drik_bala": _drik_bala(planet_name, d1.aspects),
    }
    total = mean(component.score for component in components.values())
    return TraditionalShadbalaScore(total=round(total, 2), **components)


def _dig_bala(planet_name: str, planet: PlanetPosition) -> TraditionalComponentScore:
    ideal_house = DIG_BALA_HOUSES.get(planet_name)
    if ideal_house is None or planet.house is None:
        return TraditionalComponentScore(score=50.0, evidence=["Dig Bala is neutral for nodes or missing house data."])
    distance = min((planet.house - ideal_house) % 12, (ideal_house - planet.house) % 12)
    score = _clamp(100.0 - distance * 16.0)
    return TraditionalComponentScore(
        score=score,
        evidence=[f"{planet_name} gains directional strength near house {ideal_house}; current house is {planet.house}."],
    )


def _kala_bala(planet_name: str, chart: Chart) -> TraditionalComponentScore:
    hour = chart.birth_data.birth_time.hour + chart.birth_data.birth_time.minute / 60.0
    is_day = 6.0 <= hour < 18.0
    day_planets = {"Sun", "Jupiter", "Venus"}
    night_planets = {"Moon", "Mars", "Saturn"}
    if planet_name == "Mercury":
        score = 70.0
        note = "Mercury receives balanced Kala Bala in this normalized model."
    elif planet_name in day_planets:
        score = 78.0 if is_day else 48.0
        note = f"{planet_name} is stronger by day; birth time is treated as {'day' if is_day else 'night'}."
    elif planet_name in night_planets:
        score = 78.0 if not is_day else 48.0
        note = f"{planet_name} is stronger by night; birth time is treated as {'night' if not is_day else 'day'}."
    else:
        score = 50.0
        note = "Kala Bala is neutral for nodes in this normalized model."
    return TraditionalComponentScore(score=score, evidence=[note])


def _chesta_bala(planet_name: str, planet: PlanetPosition) -> TraditionalComponentScore:
    if planet_name in NODES:
        return TraditionalComponentScore(score=65.0 if planet.retrograde else 45.0, evidence=["Nodes use motion state as a simple Chesta Bala proxy."])
    speed_score = min(75.0, abs(planet.speed) * 30.0)
    score = 85.0 if planet.retrograde else max(35.0, 45.0 + speed_score)
    return TraditionalComponentScore(
        score=_clamp(score),
        evidence=[f"Chesta Bala uses retrograde state and apparent speed; speed is {planet.speed:.4f}."],
    )


def _drik_bala(planet_name: str, aspects: list[Aspect]) -> TraditionalComponentScore:
    incoming = [aspect for aspect in aspects if aspect.target == planet_name]
    benefic = [aspect.source for aspect in incoming if aspect.source in BENEFICS]
    malefic = [aspect.source for aspect in incoming if aspect.source in MALEFICS]
    score = _clamp(50.0 + len(benefic) * 12.0 - len(malefic) * 10.0)
    return TraditionalComponentScore(
        score=score,
        evidence=[
            f"Benefic incoming aspects: {', '.join(benefic) or 'none'}.",
            f"Malefic incoming aspects: {', '.join(malefic) or 'none'}.",
        ],
    )


def _ashtakavarga_score(planet_name: str, chart: Chart) -> TraditionalComponentScore:
    planet = chart.planets[planet_name]
    bindus = 0
    evidence: list[str] = []
    for provider, offsets in ASHTAKAVARGA_SUPPORT_OFFSETS.items():
        provider_house = 1 if provider == "Ascendant" else chart.planets.get(provider).house if provider in chart.planets else None
        relative = _relative_house(provider_house, planet.house)
        if relative in offsets:
            bindus += 1
            evidence.append(f"{provider} contributes a bindu at relative house {relative}.")
    score = _clamp(bindus / len(ASHTAKAVARGA_SUPPORT_OFFSETS) * 100.0)
    evidence.insert(0, f"{planet_name} receives {bindus}/{len(ASHTAKAVARGA_SUPPORT_OFFSETS)} normalized Ashtakavarga bindus.")
    return TraditionalComponentScore(score=score, evidence=evidence)


def _varga_support_score(planet_name: str, charts: dict[str, Chart]) -> TraditionalComponentScore:
    scores: list[float] = []
    evidence: list[str] = []
    for code in ("D1", "D9", "D10", "D60"):
        chart = charts[code]
        planet = chart.planets[planet_name]
        score = _dignity_score(planet, chart).score
        scores.append(score)
        evidence.append(f"{code}: {planet.zodiac.sign_name} dignity support scores {score:.0f}/100.")
    return TraditionalComponentScore(score=round(mean(scores), 2), evidence=evidence)


def _aspect_quality_score(planet_name: str, aspects: list[Aspect]) -> TraditionalComponentScore:
    relevant = [aspect for aspect in aspects if aspect.source == planet_name or aspect.target == planet_name]
    benefic = sum(1 for aspect in relevant if aspect.source in BENEFICS or aspect.target in BENEFICS)
    malefic = sum(1 for aspect in relevant if aspect.source in MALEFICS or aspect.target in MALEFICS)
    score = _clamp(50.0 + benefic * 8.0 - malefic * 6.0)
    return TraditionalComponentScore(
        score=score,
        evidence=[
            f"{planet_name} has {len(relevant)} total aspect links.",
            f"Benefic-quality links: {benefic}; malefic-quality links: {malefic}.",
        ],
    )


def _combustion_status(planet_name: str, chart: Chart) -> tuple[str, float]:
    if planet_name == "Sun":
        return "Sun is the combustion source", 0.0
    if planet_name in NODES:
        return "Nodes are not evaluated for combustion", 0.0
    threshold = COMBUSTION_ORBS.get(planet_name)
    if threshold is None:
        return "Combustion not applicable", 0.0
    distance = _angular_separation(chart.planets[planet_name].longitude, chart.planets["Sun"].longitude)
    if distance > threshold:
        return f"Not combust ({distance:.2f}° from Sun; threshold {threshold:.1f}°)", 0.0
    penalty = 20.0 * (1.0 - distance / threshold)
    return f"Combust ({distance:.2f}° from Sun; threshold {threshold:.1f}°)", penalty


def _planetary_war_statuses(chart: Chart) -> dict[str, tuple[str, float]]:
    statuses: dict[str, tuple[str, float]] = {}
    for index, first_name in enumerate(WAR_PLANETS):
        for second_name in WAR_PLANETS[index + 1 :]:
            first = chart.planets[first_name]
            second = chart.planets[second_name]
            if first.zodiac.sign_number != second.zodiac.sign_number:
                continue
            separation = _angular_separation(first.longitude, second.longitude)
            if separation > 1.0:
                continue
            winner, loser = (first_name, second_name) if abs(first.latitude) >= abs(second.latitude) else (second_name, first_name)
            statuses[winner] = (f"Victorious in planetary war with {loser} ({separation:.2f}° separation)", 0.0)
            statuses[loser] = (f"Defeated in planetary war with {winner} ({separation:.2f}° separation)", 15.0)
    return statuses


def _sign_relationship(planet: PlanetPosition, chart: Chart) -> tuple[str, str]:
    sign_lord = SIGN_BY_NUMBER[planet.zodiac.sign_number].lord
    natural = _natural_relationship(planet.name, sign_lord)
    temporary = _temporary_relationship(planet, chart.planets.get(sign_lord))
    if natural == "friend" and temporary == "friend":
        relationship = "Friend Sign"
    elif natural == "enemy" and temporary == "enemy":
        relationship = "Enemy Sign"
    elif natural == "friend" and temporary == "enemy":
        relationship = "Neutral Sign"
    elif natural == "enemy" and temporary == "friend":
        relationship = "Neutral Sign"
    elif natural == "neutral" and temporary == "friend":
        relationship = "Friend Sign"
    elif natural == "neutral" and temporary == "enemy":
        relationship = "Enemy Sign"
    else:
        relationship = "Neutral Sign"
    return relationship, f"{planet.name} is in {planet.zodiac.sign_name}, ruled by {sign_lord}: natural {natural}, temporary {temporary}."


def _natural_relationship(planet: str, other: str) -> str:
    if other in NATURAL_FRIENDS.get(planet, set()):
        return "friend"
    if other in NATURAL_ENEMIES.get(planet, set()):
        return "enemy"
    return "neutral"


def _temporary_relationship(planet: PlanetPosition, other: PlanetPosition | None) -> str:
    if other is None or planet.house is None or other.house is None:
        return "neutral"
    relative = _relative_house(planet.house, other.house)
    return "friend" if relative in {2, 3, 4, 10, 11, 12} else "enemy"


def _relative_house(source: int | None, target: int | None) -> int:
    if source is None or target is None:
        return 0
    return ((target - source + 12) % 12) + 1


def _angular_separation(first: float, second: float) -> float:
    separation = abs(first - second) % 360.0
    return min(separation, 360.0 - separation)


def _clamp(value: float) -> float:
    return max(0.0, min(100.0, round(value, 2)))
