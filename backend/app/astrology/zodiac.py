from app.astrology.constants import NAKSHATRA_SPAN, NAKSHATRAS, PADA_SPAN, SIGN_BY_NUMBER, SIGN_SPAN
from app.astrology.schemas import ZodiacPosition


def normalize_longitude(longitude: float) -> float:
    return longitude % 360.0


def sign_number_for_longitude(longitude: float) -> int:
    return int(normalize_longitude(longitude) // SIGN_SPAN) + 1


def degree_in_sign(longitude: float) -> float:
    return normalize_longitude(longitude) % SIGN_SPAN


def zodiac_position(longitude: float) -> ZodiacPosition:
    normalized = normalize_longitude(longitude)
    sign_number = sign_number_for_longitude(normalized)
    sign = SIGN_BY_NUMBER[sign_number]
    nakshatra_index = int(normalized // NAKSHATRA_SPAN)
    nakshatra = NAKSHATRAS[min(nakshatra_index, len(NAKSHATRAS) - 1)]
    pada = int((normalized % NAKSHATRA_SPAN) // PADA_SPAN) + 1

    return ZodiacPosition(
        longitude=normalized,
        sign_number=sign.number,
        sign_name=sign.name,
        degree=degree_in_sign(normalized),
        sign_lord=sign.lord,
        nakshatra_number=nakshatra.number,
        nakshatra=nakshatra.name,
        nakshatra_lord=nakshatra.lord,
        pada=min(pada, 4),
    )
