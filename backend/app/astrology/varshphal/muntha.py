from app.astrology.constants import SIGN_BY_NUMBER
from app.astrology.houses import whole_sign_house_for_sign
from app.astrology.schemas import Chart
from app.astrology.varshphal.schemas import Muntha


def calculate_muntha(natal_chart: Chart, varsha_chart: Chart, year: int) -> Muntha:
    completed_years = max(0, year - natal_chart.birth_data.birth_date.year)
    natal_lagna_sign = natal_chart.ascendant.zodiac.sign_number
    muntha_sign_number = ((natal_lagna_sign + completed_years - 1) % 12) + 1
    muntha_sign = SIGN_BY_NUMBER[muntha_sign_number]
    muntha_house = whole_sign_house_for_sign(
        muntha_sign_number,
        varsha_chart.ascendant.zodiac.sign_number,
    )

    return Muntha(
        muntha_house=muntha_house,
        muntha_sign=muntha_sign.name,
        muntha_sign_number=muntha_sign.number,
        munthesh=muntha_sign.lord,
        completed_years=completed_years,
    )
