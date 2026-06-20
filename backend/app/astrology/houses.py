import swisseph as swe

from app.astrology.constants import SIGN_BY_NUMBER
from app.astrology.schemas import Ascendant, BirthData, House, PlanetPosition
from app.astrology.zodiac import sign_number_for_longitude, zodiac_position


def calculate_ascendant(julian_day: float, birth_data: BirthData) -> Ascendant:
    flags = swe.FLG_SIDEREAL
    _cusps, ascmc = swe.houses_ex(
        julian_day,
        birth_data.latitude,
        birth_data.longitude,
        b"P",
        flags,
    )
    zodiac = zodiac_position(float(ascmc[0]))
    return Ascendant(longitude=zodiac.longitude, zodiac=zodiac, lord=zodiac.sign_lord)


def whole_sign_house_for_sign(sign_number: int, ascendant_sign_number: int) -> int:
    return ((sign_number - ascendant_sign_number) % 12) + 1


def sign_for_whole_sign_house(house_number: int, ascendant_sign_number: int) -> int:
    return ((ascendant_sign_number + house_number - 2) % 12) + 1


def build_whole_sign_houses(
    ascendant: Ascendant,
    planets: dict[str, PlanetPosition],
) -> dict[int, House]:
    ascendant_sign = sign_number_for_longitude(ascendant.longitude)
    occupants_by_house: dict[int, list[str]] = {house: [] for house in range(1, 13)}

    for planet_name, planet in planets.items():
        house_number = whole_sign_house_for_sign(planet.zodiac.sign_number, ascendant_sign)
        occupants_by_house[house_number].append(planet_name)

    houses: dict[int, House] = {}
    for house_number in range(1, 13):
        sign_number = sign_for_whole_sign_house(house_number, ascendant_sign)
        sign = SIGN_BY_NUMBER[sign_number]
        occupants = occupants_by_house[house_number]
        houses[house_number] = House(
            number=house_number,
            sign_number=sign.number,
            sign_name=sign.name,
            lord=sign.lord,
            occupants=occupants,
            strength=None,
        )

    return houses


def assign_planet_houses(
    planets: dict[str, PlanetPosition],
    ascendant: Ascendant,
) -> dict[str, PlanetPosition]:
    ascendant_sign = sign_number_for_longitude(ascendant.longitude)
    return {
        planet_name: planet.model_copy(
            update={
                "house": whole_sign_house_for_sign(planet.zodiac.sign_number, ascendant_sign),
            }
        )
        for planet_name, planet in planets.items()
    }
