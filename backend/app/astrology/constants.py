from dataclasses import dataclass


@dataclass(frozen=True)
class Sign:
    number: int
    name: str
    lord: str


@dataclass(frozen=True)
class Nakshatra:
    number: int
    name: str
    lord: str


@dataclass(frozen=True)
class PlanetDefinition:
    name: str
    abbreviation: str
    is_luminary: bool = False
    is_node: bool = False
    enabled_by_default: bool = True


NAKSHATRA_SPAN = 360.0 / 27.0
PADA_SPAN = NAKSHATRA_SPAN / 4.0
SIGN_SPAN = 30.0

SIGNS: tuple[Sign, ...] = (
    Sign(1, "Aries", "Mars"),
    Sign(2, "Taurus", "Venus"),
    Sign(3, "Gemini", "Mercury"),
    Sign(4, "Cancer", "Moon"),
    Sign(5, "Leo", "Sun"),
    Sign(6, "Virgo", "Mercury"),
    Sign(7, "Libra", "Venus"),
    Sign(8, "Scorpio", "Mars"),
    Sign(9, "Sagittarius", "Jupiter"),
    Sign(10, "Capricorn", "Saturn"),
    Sign(11, "Aquarius", "Saturn"),
    Sign(12, "Pisces", "Jupiter"),
)

SIGN_BY_NUMBER = {sign.number: sign for sign in SIGNS}
SIGN_BY_NAME = {sign.name: sign for sign in SIGNS}

NAKSHATRAS: tuple[Nakshatra, ...] = (
    Nakshatra(1, "Ashwini", "Ketu"),
    Nakshatra(2, "Bharani", "Venus"),
    Nakshatra(3, "Krittika", "Sun"),
    Nakshatra(4, "Rohini", "Moon"),
    Nakshatra(5, "Mrigashira", "Mars"),
    Nakshatra(6, "Ardra", "Rahu"),
    Nakshatra(7, "Punarvasu", "Jupiter"),
    Nakshatra(8, "Pushya", "Saturn"),
    Nakshatra(9, "Ashlesha", "Mercury"),
    Nakshatra(10, "Magha", "Ketu"),
    Nakshatra(11, "Purva Phalguni", "Venus"),
    Nakshatra(12, "Uttara Phalguni", "Sun"),
    Nakshatra(13, "Hasta", "Moon"),
    Nakshatra(14, "Chitra", "Mars"),
    Nakshatra(15, "Swati", "Rahu"),
    Nakshatra(16, "Vishakha", "Jupiter"),
    Nakshatra(17, "Anuradha", "Saturn"),
    Nakshatra(18, "Jyeshtha", "Mercury"),
    Nakshatra(19, "Mula", "Ketu"),
    Nakshatra(20, "Purva Ashadha", "Venus"),
    Nakshatra(21, "Uttara Ashadha", "Sun"),
    Nakshatra(22, "Shravana", "Moon"),
    Nakshatra(23, "Dhanishta", "Mars"),
    Nakshatra(24, "Shatabhisha", "Rahu"),
    Nakshatra(25, "Purva Bhadrapada", "Jupiter"),
    Nakshatra(26, "Uttara Bhadrapada", "Saturn"),
    Nakshatra(27, "Revati", "Mercury"),
)

PLANETS: tuple[PlanetDefinition, ...] = (
    PlanetDefinition("Sun", "Su", is_luminary=True),
    PlanetDefinition("Moon", "Mo", is_luminary=True),
    PlanetDefinition("Mercury", "Me"),
    PlanetDefinition("Venus", "Ve"),
    PlanetDefinition("Mars", "Ma"),
    PlanetDefinition("Jupiter", "Ju"),
    PlanetDefinition("Saturn", "Sa"),
    PlanetDefinition("Rahu", "Ra", is_node=True),
    PlanetDefinition("Ketu", "Ke", is_node=True),
    PlanetDefinition("Uranus", "Ur", enabled_by_default=False),
    PlanetDefinition("Neptune", "Ne", enabled_by_default=False),
    PlanetDefinition("Pluto", "Pl", enabled_by_default=False),
)

PLANET_ABBREVIATIONS = {planet.name: planet.abbreviation for planet in PLANETS}
DEFAULT_PLANETS = tuple(planet.name for planet in PLANETS if planet.enabled_by_default)
OUTER_PLANETS = ("Uranus", "Neptune", "Pluto")

VIMSHOTTARI_SEQUENCE: tuple[str, ...] = (
    "Ketu",
    "Venus",
    "Sun",
    "Moon",
    "Mars",
    "Rahu",
    "Jupiter",
    "Saturn",
    "Mercury",
)

VIMSHOTTARI_YEARS: dict[str, int] = {
    "Ketu": 7,
    "Venus": 20,
    "Sun": 6,
    "Moon": 10,
    "Mars": 7,
    "Rahu": 18,
    "Jupiter": 16,
    "Saturn": 19,
    "Mercury": 17,
}

EXALTATION_SIGNS: dict[str, int] = {
    "Sun": 1,
    "Moon": 2,
    "Mars": 10,
    "Mercury": 6,
    "Jupiter": 4,
    "Venus": 12,
    "Saturn": 7,
    "Rahu": 2,
    "Ketu": 8,
}

DEBILITATION_SIGNS: dict[str, int] = {
    "Sun": 7,
    "Moon": 8,
    "Mars": 4,
    "Mercury": 12,
    "Jupiter": 10,
    "Venus": 6,
    "Saturn": 1,
    "Rahu": 8,
    "Ketu": 2,
}

OWN_SIGNS: dict[str, tuple[int, ...]] = {
    "Sun": (5,),
    "Moon": (4,),
    "Mars": (1, 8),
    "Mercury": (3, 6),
    "Jupiter": (9, 12),
    "Venus": (2, 7),
    "Saturn": (10, 11),
}

MOOLATRIKONA_SIGNS: dict[str, int] = {
    "Sun": 5,
    "Moon": 2,
    "Mars": 1,
    "Mercury": 6,
    "Jupiter": 9,
    "Venus": 7,
    "Saturn": 11,
}

VEDIC_ASPECT_OFFSETS: dict[str, tuple[int, ...]] = {
    "Sun": (7,),
    "Moon": (7,),
    "Mercury": (7,),
    "Venus": (7,),
    "Mars": (4, 7, 8),
    "Jupiter": (5, 7, 9),
    "Saturn": (3, 7, 10),
    "Rahu": (5, 7, 9),
    "Ketu": (5, 7, 9),
}

WESTERN_ASPECT_ANGLES: dict[str, float] = {
    "Conjunction": 0.0,
    "Opposition": 180.0,
    "Trine": 120.0,
    "Square": 90.0,
    "Sextile": 60.0,
}
