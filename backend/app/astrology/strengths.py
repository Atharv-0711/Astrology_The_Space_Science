from app.astrology.constants import (
    DEBILITATION_SIGNS,
    EXALTATION_SIGNS,
    MOOLATRIKONA_SIGNS,
    OWN_SIGNS,
)
from app.astrology.schemas import DignityStatus, ZodiacPosition


def dignity_for_planet(planet: str, zodiac: ZodiacPosition) -> DignityStatus:
    sign_number = zodiac.sign_number
    return DignityStatus(
        exalted=EXALTATION_SIGNS.get(planet) == sign_number,
        debilitated=DEBILITATION_SIGNS.get(planet) == sign_number,
        own_sign=sign_number in OWN_SIGNS.get(planet, ()),
        moolatrikona=MOOLATRIKONA_SIGNS.get(planet) == sign_number,
    )
