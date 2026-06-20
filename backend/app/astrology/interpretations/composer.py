from app.astrology.schemas import Chart


def collect_interpretation_factors(chart: Chart) -> dict[str, object]:
    return {
        "lagna": chart.ascendant.zodiac.sign_name,
        "planets": {
            name: {
                "house": planet.house,
                "sign": planet.zodiac.sign_name,
                "nakshatra": planet.zodiac.nakshatra,
            }
            for name, planet in chart.planets.items()
        },
    }
