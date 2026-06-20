from dataclasses import dataclass

from app.astrology.houses import whole_sign_house_for_sign
from app.astrology.schemas import Chart
from app.astrology.varshphal.schemas import Saham
from app.astrology.zodiac import normalize_longitude, zodiac_position


@dataclass(frozen=True)
class SahamFormula:
    name: str
    plus: str
    minus: str
    reverse_at_night: bool
    description: str


SAHAM_FORMULAS: tuple[SahamFormula, ...] = (
    SahamFormula("Punya Saham", "Moon", "Sun", True, "Ascendant + Moon - Sun"),
    SahamFormula("Vivaha Saham", "Venus", "Saturn", False, "Ascendant + Venus - Saturn"),
    SahamFormula("Putra Saham", "Jupiter", "Sun", False, "Ascendant + Jupiter - Sun"),
    SahamFormula("Rajya Saham", "Sun", "Saturn", False, "Ascendant + Sun - Saturn"),
    SahamFormula("Karma Saham", "Mars", "Mercury", False, "Ascendant + Mars - Mercury"),
    SahamFormula("Vidya Saham", "Mercury", "Jupiter", False, "Ascendant + Mercury - Jupiter"),
    SahamFormula("Mrityu Saham", "Saturn", "Moon", False, "Ascendant + Saturn - Moon"),
)


def calculate_sahams(chart: Chart) -> list[Saham]:
    is_day_chart = _is_day_chart(chart)
    ascendant = chart.ascendant.longitude
    sahams: list[Saham] = []

    for formula in SAHAM_FORMULAS:
        plus = formula.plus
        minus = formula.minus
        if formula.reverse_at_night and not is_day_chart:
            plus, minus = minus, plus
        longitude = normalize_longitude(
            ascendant + chart.planets[plus].longitude - chart.planets[minus].longitude
        )
        zodiac = zodiac_position(longitude)
        house = whole_sign_house_for_sign(zodiac.sign_number, chart.ascendant.zodiac.sign_number)
        sahams.append(
            Saham(
                name=formula.name,
                longitude=longitude,
                sign=zodiac.sign_name,
                sign_number=zodiac.sign_number,
                degree=zodiac.degree,
                house=house,
                lord=zodiac.sign_lord,
                formula=formula.description if plus == formula.plus else "Ascendant + Sun - Moon",
            )
        )

    return sahams


def supported_saham_count() -> int:
    return len(SAHAM_FORMULAS)


def _is_day_chart(chart: Chart) -> bool:
    sun_house = chart.planets["Sun"].house or 0
    return 7 <= sun_house <= 12
