import swisseph as swe

from app.astrology.constants import DEFAULT_PLANETS, PLANET_ABBREVIATIONS, OUTER_PLANETS
from app.astrology.schemas import AstrologySettings, PlanetPosition
from app.astrology.strengths import dignity_for_planet
from app.astrology.zodiac import normalize_longitude, zodiac_position

SWISS_PLANETS: dict[str, int] = {
    "Sun": swe.SUN,
    "Moon": swe.MOON,
    "Mercury": swe.MERCURY,
    "Venus": swe.VENUS,
    "Mars": swe.MARS,
    "Jupiter": swe.JUPITER,
    "Saturn": swe.SATURN,
    "Rahu": swe.TRUE_NODE,
    "Uranus": swe.URANUS,
    "Neptune": swe.NEPTUNE,
    "Pluto": swe.PLUTO,
}


def configure_ephemeris(ephemeris_path: str | None = None) -> None:
    swe.set_sid_mode(swe.SIDM_LAHIRI)
    if ephemeris_path:
        swe.set_ephe_path(ephemeris_path)


def selected_planets(settings: AstrologySettings) -> tuple[str, ...]:
    if not settings.include_outer_planets:
        return DEFAULT_PLANETS
    return DEFAULT_PLANETS + OUTER_PLANETS


def calculate_planets(
    julian_day: float,
    settings: AstrologySettings,
    ephemeris_path: str | None = None,
) -> dict[str, PlanetPosition]:
    configure_ephemeris(ephemeris_path)
    flags = swe.FLG_SIDEREAL | swe.FLG_SPEED
    positions: dict[str, PlanetPosition] = {}

    for planet in selected_planets(settings):
        if planet == "Ketu":
            continue

        raw_position, _retflag = swe.calc_ut(julian_day, SWISS_PLANETS[planet], flags)
        longitude = normalize_longitude(float(raw_position[0]))
        latitude = float(raw_position[1])
        speed = float(raw_position[3])
        zodiac = zodiac_position(longitude)

        positions[planet] = PlanetPosition(
            name=planet,
            abbreviation=PLANET_ABBREVIATIONS[planet],
            longitude=longitude,
            latitude=latitude,
            speed=speed,
            retrograde=speed < 0.0,
            zodiac=zodiac,
            dignity=dignity_for_planet(planet, zodiac),
        )

    rahu = positions["Rahu"]
    ketu_longitude = normalize_longitude(rahu.longitude + 180.0)
    ketu_zodiac = zodiac_position(ketu_longitude)
    positions["Ketu"] = PlanetPosition(
        name="Ketu",
        abbreviation=PLANET_ABBREVIATIONS["Ketu"],
        longitude=ketu_longitude,
        latitude=-rahu.latitude,
        speed=rahu.speed,
        retrograde=rahu.retrograde,
        zodiac=ketu_zodiac,
        dignity=dignity_for_planet("Ketu", ketu_zodiac),
    )

    return {planet: positions[planet] for planet in selected_planets(settings)}
