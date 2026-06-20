from app.astrology.constants import DEFAULT_PLANETS
from app.astrology.panchang import calculate_astronomical_data, calculate_panchang
from app.astrology.schemas import AstrologySettings, BirthData, Chart
from app.astrology.varshphal.schemas import (
    AnnualHoroscopeInformationBlock,
    AstronomicalData,
    BirthInformation,
    ChartReferenceData,
    DashaSection,
    MuddaDashaPeriod,
    MuddaDashaTimeline,
    Muntha,
    MunthaSection,
    PlanetaryPositionRow,
    Saham,
    SahamSection,
    TajikaAspect,
    TajikaSection,
    TajikaYoga,
    VarshPravesh,
    VarshaPraveshData,
)
from app.astrology.varshphal.strength_analysis import (
    aspect_counts,
    build_annual_summary,
    build_strength_analysis,
    combust_status,
    muntha_strength,
)


def build_annual_horoscope_information_block(
    birth_data: BirthData,
    year: int,
    settings: AstrologySettings,
    natal_chart: Chart,
    varsha_chart: Chart,
    pravesh: VarshPravesh,
    muntha: Muntha,
    tajika_aspects: list[TajikaAspect],
    tajika_yogas: list[TajikaYoga],
    sahams: list[Saham],
    mudda_dasha: MuddaDashaTimeline,
    ephemeris_path: str | None = None,
) -> AnnualHoroscopeInformationBlock:
    natal_panchang = calculate_panchang(birth_data, settings, ephemeris_path)
    varsha_panchang = calculate_panchang(varsha_chart.birth_data, settings, ephemeris_path)
    astronomy = calculate_astronomical_data(birth_data, settings, ephemeris_path)
    return AnnualHoroscopeInformationBlock(
        birth_info=_birth_info(birth_data),
        astronomical_data=AstronomicalData(
            local_mean_time=astronomy.local_mean_time,
            local_time_correction=astronomy.local_time_correction,
            war_time_correction=astronomy.war_time_correction,
            julian_day=astronomy.julian_day,
            sunrise=astronomy.sunrise,
            sunset=astronomy.sunset,
            ayanamsha_value=astronomy.ayanamsha_value,
            ayanamsha_name=astronomy.ayanamsha_name,
        ),
        natal_reference=_chart_reference(natal_chart, natal_panchang.yoga, natal_panchang.karana),
        varsha_pravesh=_varsha_pravesh(year, varsha_chart, pravesh, varsha_panchang.yoga, varsha_panchang.karana),
        muntha=MunthaSection(
            muntha_sign=muntha.muntha_sign,
            muntha_house=muntha.muntha_house,
            munthesh=muntha.munthesh,
            muntha_strength=muntha_strength(varsha_chart, muntha, tajika_aspects),
        ),
        tajika=_tajika_section(tajika_aspects, tajika_yogas),
        mudda_dasha=_dasha_section(mudda_dasha),
        sahams=_saham_section(sahams),
        planetary_positions=_planetary_positions(varsha_chart, tajika_aspects),
        strength_analysis=build_strength_analysis(varsha_chart, tajika_aspects),
        annual_summary=build_annual_summary(varsha_chart, tajika_aspects, tajika_yogas),
    )


def _birth_info(birth_data: BirthData) -> BirthInformation:
    return BirthInformation(
        name=birth_data.name,
        gender=birth_data.gender,
        date_of_birth=birth_data.birth_date,
        time_of_birth=birth_data.birth_time.strftime("%H:%M:%S"),
        day_of_birth=birth_data.birth_date.strftime("%A"),
        place_of_birth=birth_data.place_of_birth,
        country=birth_data.country,
        latitude=birth_data.latitude,
        longitude=birth_data.longitude,
        time_zone=birth_data.timezone,
    )


def _chart_reference(chart: Chart, yoga: str, karana: str) -> ChartReferenceData:
    moon = chart.planets["Moon"]
    return ChartReferenceData(
        lagna=chart.ascendant.zodiac.sign_name,
        lagna_lord=chart.ascendant.lord,
        moon_sign=moon.zodiac.sign_name,
        moon_sign_lord=moon.zodiac.sign_lord,
        nakshatra=moon.zodiac.nakshatra,
        nakshatra_lord=moon.zodiac.nakshatra_lord,
        yoga=yoga,
        karana=karana,
    )


def _varsha_pravesh(
    year: int,
    chart: Chart,
    pravesh: VarshPravesh,
    yoga: str,
    karana: str,
) -> VarshaPraveshData:
    moon = chart.planets["Moon"]
    local = pravesh.local_datetime
    return VarshaPraveshData(
        varshphal_year=year,
        exact_varsha_pravesh_date=local.date(),
        exact_varsha_pravesh_time=local.strftime("%H:%M:%S"),
        varsha_lagna=chart.ascendant.zodiac.sign_name,
        varsha_lagna_lord=chart.ascendant.lord,
        varsha_moon_sign=moon.zodiac.sign_name,
        varsha_moon_sign_lord=moon.zodiac.sign_lord,
        varsha_nakshatra=moon.zodiac.nakshatra,
        varsha_nakshatra_lord=moon.zodiac.nakshatra_lord,
        varsha_yoga=yoga,
        varsha_karana=karana,
    )


def _tajika_section(aspects: list[TajikaAspect], yogas: list[TajikaYoga]) -> TajikaSection:
    grouped = {name: [yoga for yoga in yogas if yoga.name == name] for name in _TAJIKA_NAMES}
    return TajikaSection(
        tajika_aspects=aspects,
        ithasala_yogas=grouped["Ithasala"],
        isharafa_yogas=grouped["Isharafa"],
        kamboola_yogas=grouped["Kamboola"],
        nakta_yogas=grouped["Nakta"],
        yamaya_yogas=grouped["Yamaya"],
        manahoo_yogas=grouped["Manahoo"],
        radda_yogas=grouped["Radda"],
    )


def _dasha_section(timeline: MuddaDashaTimeline) -> DashaSection:
    current = timeline.current
    if current is None:
        return DashaSection()
    parent = _parent_period(timeline.periods, current)
    return DashaSection(
        current_mudda_dasha=parent.planet if parent else current.planet,
        current_antardasha=current.planet if current.level == "antardasha" else None,
        start_date=current.start_date,
        end_date=current.end_date,
    )


def _parent_period(
    periods: list[MuddaDashaPeriod],
    current: MuddaDashaPeriod,
) -> MuddaDashaPeriod | None:
    if current.level == "mahadasha":
        return current
    for period in periods:
        if any(child.start_date == current.start_date and child.planet == current.planet for child in period.children):
            return period
    return None


def _saham_section(sahams: list[Saham]) -> SahamSection:
    by_name = {saham.name: saham for saham in sahams}
    return SahamSection(
        punya_saham=by_name.get("Punya Saham"),
        rajya_saham=by_name.get("Rajya Saham"),
        karma_saham=by_name.get("Karma Saham"),
        vivaha_saham=by_name.get("Vivaha Saham"),
        putra_saham=by_name.get("Putra Saham"),
        vidya_saham=by_name.get("Vidya Saham"),
        mrityu_saham=by_name.get("Mrityu Saham"),
    )


def _planetary_positions(
    chart: Chart,
    aspects: list[TajikaAspect],
) -> dict[str, PlanetaryPositionRow]:
    counts = aspect_counts(aspects)
    sun = chart.planets["Sun"]
    rows: dict[str, PlanetaryPositionRow] = {}
    for planet_name in DEFAULT_PLANETS:
        planet = chart.planets[planet_name]
        rows[planet_name] = PlanetaryPositionRow(
            longitude=planet.longitude,
            sign=planet.zodiac.sign_name,
            degree=planet.zodiac.degree,
            nakshatra=planet.zodiac.nakshatra,
            pada=planet.zodiac.pada,
            house=planet.house,
            retrograde_status=planet.retrograde,
            combust_status=combust_status(planet_name, planet, sun),
            aspect_count=counts.get(planet_name, 0),
        )
    return rows


_TAJIKA_NAMES = ("Ithasala", "Isharafa", "Kamboola", "Nakta", "Yamaya", "Manahoo", "Radda")
