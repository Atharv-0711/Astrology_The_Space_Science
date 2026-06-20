from app.astrology.aspects import calculate_vedic_aspects, calculate_western_aspects
from app.astrology.schemas import PlanetPosition


def planet(name: str, house: int, longitude: float) -> PlanetPosition:
    return PlanetPosition.model_construct(
        name=name,
        longitude=longitude,
        house=house,
    )


def aspect_types_for(source: str, aspects) -> set[str]:
    return {aspect.aspect_type for aspect in aspects if aspect.source == source}


def test_vedic_aspects_use_authentic_special_offsets() -> None:
    planets = {
        "Mars": planet("Mars", 1, 0),
        "Jupiter": planet("Jupiter", 2, 30),
        "Saturn": planet("Saturn", 3, 60),
        "Sun": planet("Sun", 4, 90),
        "Moon": planet("Moon", 5, 120),
        "Uranus": planet("Uranus", 6, 150),
        "Mercury": planet("Mercury", 7, 180),
        "Venus": planet("Venus", 8, 210),
        "Neptune": planet("Neptune", 9, 240),
        "Pluto": planet("Pluto", 10, 270),
        "Rahu": planet("Rahu", 11, 300),
        "Ketu": planet("Ketu", 12, 330),
    }

    aspects = calculate_vedic_aspects(planets)

    assert {"4th Aspect", "7th Aspect", "8th Aspect"}.issubset(aspect_types_for("Mars", aspects))
    assert {"5th Aspect", "7th Aspect", "9th Aspect"}.issubset(aspect_types_for("Jupiter", aspects))
    assert {"3rd Aspect", "7th Aspect", "10th Aspect"}.issubset(aspect_types_for("Saturn", aspects))


def test_vedic_aspects_include_universal_seventh_aspect() -> None:
    planets = {
        "Sun": planet("Sun", 1, 0),
        "Moon": planet("Moon", 7, 180),
    }

    aspects = calculate_vedic_aspects(planets)

    assert any(
        aspect.source == "Sun"
        and aspect.target == "Moon"
        and aspect.aspect_type == "7th Aspect"
        and aspect.aspect_system == "Vedic"
        and aspect.strength == 100
        and aspect.exact
        and aspect.reason
        for aspect in aspects
    )


def test_rahu_ketu_mutual_rows_are_suppressed() -> None:
    planets = {
        "Rahu": planet("Rahu", 1, 0),
        "Ketu": planet("Ketu", 7, 180),
    }

    vedic_aspects = calculate_vedic_aspects(planets)
    western_aspects = calculate_western_aspects(planets, orb=6)

    assert vedic_aspects == []
    assert western_aspects == []


def test_western_aspects_include_system_angle_orb_and_strength() -> None:
    planets = {
        "Jupiter": planet("Jupiter", 1, 0),
        "Moon": planet("Moon", 5, 122.3),
    }

    aspects = calculate_western_aspects(planets, orb=6)

    assert len(aspects) == 1
    aspect = aspects[0]
    assert aspect.aspect_type == "Trine"
    assert aspect.aspect_system == "Western"
    assert aspect.angle == 122.3
    assert round(aspect.orb or 0, 2) == 2.3
    assert aspect.strength is not None and aspect.strength > 0
    assert not aspect.exact
    assert aspect.reason
