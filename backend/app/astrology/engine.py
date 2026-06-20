from app.astrology.aspects import calculate_aspects
from app.astrology.divisional.engine import calculate_divisional_chart
from app.astrology.houses import (
    assign_planet_houses,
    build_whole_sign_houses,
    calculate_ascendant,
)
from app.astrology.planets import calculate_planets
from app.astrology.schemas import AstrologySettings, BirthData, Chart
from app.astrology.time import julian_day_from_birth_data


def calculate_chart(
    birth_data: BirthData,
    settings: AstrologySettings | None = None,
    ephemeris_path: str | None = None,
) -> Chart:
    chart_settings = settings or AstrologySettings()
    julian_day = julian_day_from_birth_data(birth_data)
    planets = calculate_planets(julian_day, chart_settings, ephemeris_path)
    ascendant = calculate_ascendant(julian_day, birth_data)
    planets_with_houses = assign_planet_houses(planets, ascendant)
    houses = build_whole_sign_houses(ascendant, planets_with_houses)
    aspects = calculate_aspects(planets_with_houses, chart_settings)

    return Chart(
        birth_data=birth_data,
        settings=chart_settings,
        julian_day=julian_day,
        ascendant=ascendant,
        planets=planets_with_houses,
        houses=houses,
        aspects=aspects,
    )


def calculate_named_chart(
    birth_data: BirthData,
    chart_type: str,
    settings: AstrologySettings | None = None,
    ephemeris_path: str | None = None,
) -> Chart:
    d1_chart = calculate_chart(birth_data, settings, ephemeris_path)
    return calculate_divisional_chart(d1_chart, chart_type.upper())


def generate_chart(
    birth_data: BirthData,
    varga: int = 1,
    settings: AstrologySettings | None = None,
    ephemeris_path: str | None = None,
) -> Chart:
    d1_chart = calculate_chart(birth_data, settings, ephemeris_path)
    return calculate_divisional_chart(d1_chart, f"D{varga}")
