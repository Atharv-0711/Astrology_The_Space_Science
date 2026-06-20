from app.astrology.aspects import calculate_aspects
from app.astrology.constants import PLANET_ABBREVIATIONS
from app.astrology.houses import assign_planet_houses, build_whole_sign_houses
from app.astrology.schemas import Ascendant, AstrologySettings, BirthData, Chart, PlanetPosition
from app.astrology.strengths import dignity_for_planet
from app.astrology.varga.engine import divisional_longitude
from app.astrology.varga.rules import get_varga_config, get_varga_config_by_code
from app.astrology.zodiac import zodiac_position


def generate_chart(
    birth_data: BirthData,
    varga: int = 1,
    settings: AstrologySettings | None = None,
    ephemeris_path: str | None = None,
) -> Chart:
    from app.astrology.engine import calculate_chart

    d1_chart = calculate_chart(birth_data, settings, ephemeris_path)
    return calculate_varga_chart(d1_chart, varga)


def calculate_varga_chart(chart: Chart, varga: int) -> Chart:
    config = get_varga_config(varga)
    if config.division == 1:
        return chart.model_copy(update={"chart_type": config.code})

    ascendant = _varga_ascendant(chart.ascendant, config.division)
    planets = {
        name: _varga_planet(planet, config.division)
        for name, planet in chart.planets.items()
    }
    planets_with_houses = assign_planet_houses(planets, ascendant)
    houses = build_whole_sign_houses(ascendant, planets_with_houses)
    aspects = calculate_aspects(planets_with_houses, chart.settings)

    return Chart(
        chart_type=config.code,
        birth_data=chart.birth_data,
        settings=chart.settings,
        julian_day=chart.julian_day,
        ascendant=ascendant,
        planets=planets_with_houses,
        houses=houses,
        aspects=aspects,
    )


def calculate_named_varga_chart(chart: Chart, chart_code: str) -> Chart:
    config = get_varga_config_by_code(chart_code)
    return calculate_varga_chart(chart, config.division)


def _varga_ascendant(ascendant: Ascendant, division: int) -> Ascendant:
    longitude = divisional_longitude(ascendant.longitude, division)
    zodiac = zodiac_position(longitude)
    return Ascendant(longitude=longitude, zodiac=zodiac, lord=zodiac.sign_lord)


def _varga_planet(planet: PlanetPosition, division: int) -> PlanetPosition:
    longitude = divisional_longitude(planet.longitude, division)
    zodiac = zodiac_position(longitude)
    return PlanetPosition(
        name=planet.name,
        abbreviation=PLANET_ABBREVIATIONS[planet.name],
        longitude=longitude,
        latitude=planet.latitude,
        speed=planet.speed,
        retrograde=planet.retrograde,
        zodiac=zodiac,
        dignity=dignity_for_planet(planet.name, zodiac),
    )
