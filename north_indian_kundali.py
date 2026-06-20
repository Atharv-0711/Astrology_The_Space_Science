import swisseph as swe
import matplotlib.pyplot as plt
from datetime import datetime, timedelta

RASHIS = [
    "Aries","Taurus","Gemini","Cancer","Leo","Virgo",
    "Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"
]

NAKSHATRAS = [
    "Ashwini","Bharani","Krittika","Rohini","Mrigashira","Ardra",
    "Punarvasu","Pushya","Ashlesha","Magha","Purva Phalguni",
    "Uttara Phalguni","Hasta","Chitra","Swati","Vishakha",
    "Anuradha","Jyeshtha","Mula","Purva Ashadha","Uttara Ashadha",
    "Shravana","Dhanishta","Shatabhisha","Purva Bhadrapada",
    "Uttara Bhadrapada","Revati"
]

PLANETS = {
    "Sun": swe.SUN,
    "Moon": swe.MOON,
    "Mercury": swe.MERCURY,
    "Venus": swe.VENUS,
    "Mars": swe.MARS,
    "Jupiter": swe.JUPITER,
    "Saturn": swe.SATURN,
    "Rahu": swe.TRUE_NODE
}

PLANET_LABELS = {
    "Sun": "Su",
    "Moon": "Mo",
    "Mercury": "Me",
    "Venus": "Ve",
    "Mars": "Ma",
    "Jupiter": "Ju",
    "Saturn": "Sa",
    "Rahu": "Ra",
    "Ketu": "Ke"
}

NAKSHATRA_SPAN = 360 / 27
PADA_SPAN = NAKSHATRA_SPAN / 4


def get_local_birth_datetime(year, month, day, hour, minute):
    return datetime(year, month, day, hour, minute)


def get_julian_day(year, month, day, hour, minute, timezone):
    local_time = get_local_birth_datetime(year, month, day, hour, minute)
    utc_time = local_time - timedelta(hours=timezone)
    ut = utc_time.hour + utc_time.minute / 60 + utc_time.second / 3600
    return swe.julday(utc_time.year, utc_time.month, utc_time.day, ut)


def get_zodiac_details(longitude):
    longitude %= 360
    sign_no = int(longitude / 30) % len(RASHIS)
    nak_no = int(longitude / NAKSHATRA_SPAN) % len(NAKSHATRAS)
    pada = int((longitude % NAKSHATRA_SPAN) / PADA_SPAN) + 1

    return {
        "longitude": longitude,
        "sign_no": sign_no,
        "degree_in_sign": longitude % 30,
        "rashi": RASHIS[sign_no],
        "nakshatra": NAKSHATRAS[nak_no],
        "pada": min(pada, 4)
    }


def get_planet_data(jd):
    planet_data = {}

    for name, pid in PLANETS.items():
        lon = swe.calc_ut(jd, pid, swe.FLG_SIDEREAL)[0][0]
        planet_data[name] = get_zodiac_details(lon)

    rahu_lon = planet_data["Rahu"]["longitude"]
    planet_data["Ketu"] = get_zodiac_details(rahu_lon + 180)
    return planet_data


def get_whole_sign_house(planet_sign_no, lagna_sign_no):
    return ((planet_sign_no - lagna_sign_no) % 12) + 1


def format_chart_label(name, degree):
    label = PLANET_LABELS.get(name, name)
    return f"{label}-{degree:.2f}°"


def draw_chart(lagna_longitude, planet_data):
    lagna_sign_no = int(lagna_longitude / 30) % len(RASHIS)
    lagna_rashi = RASHIS[lagna_sign_no]
    house_contents = {i: [] for i in range(1, 13)}

    house_contents[1].append(format_chart_label("Asc", lagna_longitude % 30))
    for planet, data in planet_data.items():
        house = get_whole_sign_house(data["sign_no"], lagna_sign_no)
        house_contents[house].append(format_chart_label(planet, data["degree_in_sign"]))

    fig, ax = plt.subplots(figsize=(10, 10))
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 10)
    ax.set_aspect("equal")
    ax.axis("off")

    fig.patch.set_facecolor("#17170d")
    ax.set_facecolor("#17170d")
    line_color = "#d6d63a"
    text_color = "#e8e0c8"
    sign_color = "#ffff4d"

    lines = [
        ([1, 9], [1, 1]), ([9, 9], [1, 9]), ([9, 1], [9, 9]),
        ([1, 1], [9, 1]), ([1, 9], [1, 9]), ([1, 9], [9, 1]),
        ([5, 1], [9, 5]), ([1, 5], [5, 1]), ([5, 9], [1, 5]),
        ([9, 5], [5, 9])
    ]

    for x_points, y_points in lines:
        ax.plot(x_points, y_points, color=line_color, linewidth=1.5)

    house_pos = {
        1: (5.0, 7.35), 2: (2.75, 7.75), 3: (1.25, 6.2),
        4: (2.5, 5.0), 5: (1.25, 3.45), 6: (2.75, 2.25),
        7: (5.0, 2.65), 8: (7.25, 2.25), 9: (8.75, 3.45),
        10: (7.5, 5.0), 11: (8.75, 6.2), 12: (7.25, 7.75)
    }
    house_align = {
        1: "center", 2: "center", 3: "left", 4: "center",
        5: "left", 6: "center", 7: "center", 8: "center",
        9: "right", 10: "center", 11: "right", 12: "center"
    }
    sign_pos = {
        1: (5.0, 5.82), 2: (3.82, 6.18), 3: (3.9, 5.5),
        4: (3.82, 5.0), 5: (3.9, 4.5), 6: (3.82, 3.82),
        7: (5.0, 4.18), 8: (6.18, 3.82), 9: (6.1, 4.5),
        10: (6.18, 5.0), 11: (6.1, 5.5), 12: (6.18, 6.18)
    }

    for house, (x, y) in sign_pos.items():
        sign_no = ((lagna_sign_no + house - 1) % 12) + 1
        ax.text(x, y, str(sign_no), ha="center", va="center",
                fontsize=10, color=sign_color, fontweight="bold")

    for house in range(1, 13):
        x, y = house_pos[house]
        txt = "\n".join(house_contents[house])
        fontsize = 9 if len(house_contents[house]) > 3 else 10
        ax.text(x, y, txt, ha=house_align[house], va="center",
                fontsize=fontsize, color=text_color,
                fontweight="bold", linespacing=1.2)

    plt.title(f"Lagna Chart (D1) - {lagna_rashi}", color=text_color, fontsize=14)
    plt.show()


def main():
    year = int(input("Year: "))
    month = int(input("Month: "))
    day = int(input("Day: "))
    hour = int(input("Hour (24h): "))
    minute = int(input("Minute: "))
    latitude = float(input("Latitude: "))
    longitude = float(input("Longitude: "))
    timezone = float(input("Timezone (IST=5.5): "))

    jd = get_julian_day(year, month, day, hour, minute, timezone)

    swe.set_sid_mode(swe.SIDM_LAHIRI)

    planet_data = get_planet_data(jd)

    houses = swe.houses_ex(jd, latitude, longitude, b'P', swe.FLG_SIDEREAL)
    ascmc = houses[1]

    lagna_longitude = ascmc[0] % 360
    lagna_rashi = RASHIS[int(lagna_longitude / 30) % len(RASHIS)]

    print("\nLagna:", lagna_rashi, round(lagna_longitude, 2))

    for planet, data in planet_data.items():
        print(
            planet,
            round(data["longitude"], 2),
            data["rashi"],
            data["nakshatra"],
            "Pada",
            data["pada"]
        )

    draw_chart(lagna_longitude, planet_data)


if __name__ == "__main__":
    main()


