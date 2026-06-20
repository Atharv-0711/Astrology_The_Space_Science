from app.astrology.constants import PLANET_ABBREVIATIONS
from app.astrology.schemas import Chart, ChartLabel, ChartLine, ChartPoint, NorthIndianChartPayload

CHART_LINES: tuple[tuple[tuple[float, float], tuple[float, float]], ...] = (
    ((10.0, 10.0), (90.0, 10.0)),
    ((90.0, 10.0), (90.0, 90.0)),
    ((90.0, 90.0), (10.0, 90.0)),
    ((10.0, 90.0), (10.0, 10.0)),
    ((10.0, 10.0), (90.0, 90.0)),
    ((10.0, 90.0), (90.0, 10.0)),
    ((50.0, 90.0), (10.0, 50.0)),
    ((10.0, 50.0), (50.0, 10.0)),
    ((50.0, 10.0), (90.0, 50.0)),
    ((90.0, 50.0), (50.0, 90.0)),
)

HOUSE_LABEL_POSITIONS: dict[int, tuple[float, float]] = {
    1: (50.0, 26.5),
    2: (27.5, 22.5),
    3: (12.5, 38.0),
    4: (25.0, 50.0),
    5: (12.5, 65.5),
    6: (25.0, 79.0),
    7: (50.0, 73.5),
    8: (75.0, 79.0),
    9: (87.5, 65.5),
    10: (75.0, 50.0),
    11: (87.5, 38.0),
    12: (72.5, 22.5),
}

SIGN_LABEL_POSITIONS: dict[int, tuple[float, float]] = {
    1: (50.0, 37.0),
    2: (30.0, 20.0),
    3: (17.0, 31.0),
    4: (37.0, 50.0),
    5: (17.0, 69.0),
    6: (30.0, 80.0),
    7: (50.0, 61.0),
    8: (70.0, 80.0),
    9: (83.0, 69.0),
    10: (63.0, 50.0),
    11: (83.0, 31.0),
    12: (70.0, 20.0),
}

PLANET_LABEL_SLOTS: dict[int, tuple[tuple[float, float], ...]] = {
    1: (
        (50.0, 23.0),
        (45.0, 28.0),
        (55.0, 28.0),
        (40.0, 33.0),
        (50.0, 33.0),
        (60.0, 33.0),
        (45.0, 38.0),
        (55.0, 38.0),
        (50.0, 43.0),
    ),
    2: (
        (30.0, 16.0),
        (24.0, 20.0),
        (36.0, 20.0),
        (23.0, 24.0),
        (30.0, 24.0),
        (37.0, 24.0),
        (27.0, 27.0),
        (33.0, 27.0),
        (30.0, 28.5),
    ),
    3: (
        (17.0, 30.0),
        (20.0, 24.0),
        (20.0, 36.0),
        (14.0, 22.0),
        (14.0, 38.0),
        (23.0, 30.0),
        (16.0, 27.0),
        (16.0, 33.0),
        (12.5, 30.0),
    ),
    4: (
        (30.0, 50.0),
        (25.0, 45.0),
        (25.0, 55.0),
        (30.0, 40.0),
        (35.0, 45.0),
        (35.0, 55.0),
        (30.0, 60.0),
        (20.0, 50.0),
        (40.0, 50.0),
    ),
    5: (
        (17.0, 70.0),
        (20.0, 64.0),
        (20.0, 76.0),
        (14.0, 62.0),
        (14.0, 78.0),
        (23.0, 70.0),
        (16.0, 67.0),
        (16.0, 73.0),
        (12.5, 70.0),
    ),
    6: (
        (30.0, 83.0),
        (24.0, 80.0),
        (36.0, 80.0),
        (22.0, 84.0),
        (30.0, 84.0),
        (38.0, 84.0),
        (26.0, 87.0),
        (34.0, 87.0),
        (30.0, 88.5),
    ),
    7: (
        (50.0, 77.0),
        (45.0, 72.0),
        (55.0, 72.0),
        (40.0, 67.0),
        (50.0, 67.0),
        (60.0, 67.0),
        (45.0, 62.0),
        (55.0, 62.0),
        (50.0, 57.0),
    ),
    8: (
        (70.0, 83.0),
        (64.0, 80.0),
        (76.0, 80.0),
        (62.0, 84.0),
        (70.0, 84.0),
        (78.0, 84.0),
        (66.0, 87.0),
        (74.0, 87.0),
        (70.0, 88.5),
    ),
    9: (
        (83.0, 70.0),
        (80.0, 64.0),
        (80.0, 76.0),
        (86.0, 62.0),
        (86.0, 78.0),
        (77.0, 70.0),
        (84.0, 67.0),
        (84.0, 73.0),
        (87.5, 70.0),
    ),
    10: (
        (70.0, 50.0),
        (75.0, 45.0),
        (75.0, 55.0),
        (70.0, 40.0),
        (65.0, 45.0),
        (65.0, 55.0),
        (70.0, 60.0),
        (80.0, 50.0),
        (60.0, 50.0),
    ),
    11: (
        (83.0, 30.0),
        (80.0, 24.0),
        (80.0, 36.0),
        (86.0, 22.0),
        (86.0, 38.0),
        (77.0, 30.0),
        (84.0, 27.0),
        (84.0, 33.0),
        (87.5, 30.0),
    ),
    12: (
        (70.0, 16.0),
        (64.0, 20.0),
        (76.0, 20.0),
        (63.0, 24.0),
        (70.0, 24.0),
        (77.0, 24.0),
        (67.0, 27.0),
        (73.0, 27.0),
        (70.0, 28.5),
    ),
}


def _planet_label_position(house_number: int, index: int) -> tuple[float, float]:
    slots = PLANET_LABEL_SLOTS[house_number]
    if index < len(slots):
        return slots[index]
    return slots[-1]


def build_north_indian_chart_payload(chart: Chart) -> NorthIndianChartPayload:
    labels: list[ChartLabel] = []

    for house_number, house in chart.houses.items():
        sign_x, sign_y = SIGN_LABEL_POSITIONS[house_number]
        labels.append(
            ChartLabel(
                kind="sign",
                text=str(house.sign_number),
                house=house_number,
                x=sign_x,
                y=sign_y,
                tooltip=f"{house.sign_name} ruled by {house.lord}",
            )
        )

        house_x, house_y = HOUSE_LABEL_POSITIONS[house_number]
        labels.append(
            ChartLabel(
                kind="house",
                text=f"H{house_number}",
                house=house_number,
                x=house_x,
                y=house_y - 7.0,
                tooltip=f"House {house_number}: {house.sign_name}",
            )
        )

        for index, planet_name in enumerate(house.occupants):
            planet = chart.planets[planet_name]
            planet_x, planet_y = _planet_label_position(house_number, index)
            labels.append(
                ChartLabel(
                    kind="planet",
                    text=f"{PLANET_ABBREVIATIONS[planet_name]} {planet.zodiac.degree:.1f}",
                    house=house_number,
                    x=planet_x,
                    y=planet_y,
                    planet=planet_name,
                    tooltip=(
                        f"{planet_name}: {planet.zodiac.sign_name}, "
                        f"{planet.zodiac.nakshatra} Pada {planet.zodiac.pada}, "
                        f"House {planet.house}"
                    ),
                )
            )

    asc_house_x, asc_house_y = HOUSE_LABEL_POSITIONS[1]
    labels.append(
        ChartLabel(
            kind="ascendant",
            text=f"Asc {chart.ascendant.zodiac.degree:.1f}",
            house=1,
            x=asc_house_x,
            y=asc_house_y - 4.2,
            tooltip=(
                f"Ascendant: {chart.ascendant.zodiac.sign_name}, "
                f"{chart.ascendant.zodiac.nakshatra} Pada {chart.ascendant.zodiac.pada}"
            ),
        )
    )

    return NorthIndianChartPayload(
        chart_type=chart.chart_type,
        lines=[
            ChartLine(
                start=ChartPoint(x=start[0], y=start[1]),
                end=ChartPoint(x=end[0], y=end[1]),
            )
            for start, end in CHART_LINES
        ],
        labels=labels,
    )
