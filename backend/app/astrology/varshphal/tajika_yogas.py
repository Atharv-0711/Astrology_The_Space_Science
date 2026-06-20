from collections.abc import Callable

from app.astrology.schemas import Chart, PlanetPosition
from app.astrology.varshphal.schemas import TajikaAspect, TajikaReport, TajikaYoga, TajikaYogaStatus

BENEFICS = {"Jupiter", "Venus", "Mercury", "Moon"}
MALEFICS = {"Saturn", "Mars", "Rahu", "Ketu", "Sun"}
CLASSICAL_PLANETS = {"Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn"}
YOGA_DETECTORS: list[Callable[[Chart, list[TajikaAspect]], list[TajikaYoga]]] = []
TAJIKA_YOGA_NAMES: tuple[str, ...] = (
    "Ithasala",
    "Isharafa",
    "Kamboola",
    "Nakta",
    "Yamaya",
    "Manahoo",
    "Radda",
    "Duhphali Kuttha",
)


def yoga_detector(func: Callable[[Chart, list[TajikaAspect]], list[TajikaYoga]]):
    YOGA_DETECTORS.append(func)
    return func


def detect_tajika_yogas(chart: Chart, aspects: list[TajikaAspect]) -> list[TajikaYoga]:
    yogas: list[TajikaYoga] = []
    for detector in YOGA_DETECTORS:
        yogas.extend(detector(chart, aspects))
    return sorted(yogas, key=lambda yoga: (-yoga.strength, yoga.name))


def build_tajika_report(aspects: list[TajikaAspect], yogas: list[TajikaYoga]) -> TajikaReport:
    statuses: list[TajikaYogaStatus] = []
    for name in TAJIKA_YOGA_NAMES:
        matching = [yoga for yoga in yogas if yoga.name == name]
        statuses.append(
            TajikaYogaStatus(
                name=name,
                active=bool(matching),
                strength=round(max((yoga.strength for yoga in matching), default=0.0), 2),
                yogas=matching,
            )
        )
    return TajikaReport(tajika_aspects=aspects, yoga_statuses=statuses)


@yoga_detector
def detect_ithasala(_chart: Chart, aspects: list[TajikaAspect]) -> list[TajikaYoga]:
    return [
        TajikaYoga(
            name="Ithasala",
            planets=[aspect.source, aspect.target],
            description="Applying Tajika aspect indicating an approaching result between the planets.",
            strength=aspect.strength,
            tags=["applying", aspect.aspect_type],
        )
        for aspect in aspects
        if aspect.applying and aspect.source in CLASSICAL_PLANETS and aspect.target in CLASSICAL_PLANETS
    ]


@yoga_detector
def detect_isharafa(_chart: Chart, aspects: list[TajikaAspect]) -> list[TajikaYoga]:
    return [
        TajikaYoga(
            name="Isharafa",
            planets=[aspect.source, aspect.target],
            description="Separating Tajika aspect showing completed, weakening, or missed results.",
            strength=max(5.0, aspect.strength * 0.75),
            tags=["separating", aspect.aspect_type],
        )
        for aspect in aspects
        if not aspect.applying and aspect.strength >= 35.0
    ]


@yoga_detector
def detect_nakta(chart: Chart, aspects: list[TajikaAspect]) -> list[TajikaYoga]:
    yogas: list[TajikaYoga] = []
    moon_links = [aspect for aspect in aspects if "Moon" in {aspect.source, aspect.target} and aspect.applying]
    for first_index, first in enumerate(moon_links):
        for second in moon_links[first_index + 1 :]:
            planets = sorted({first.source, first.target, second.source, second.target})
            if len(planets) == 3:
                yogas.append(
                    TajikaYoga(
                        name="Nakta",
                        planets=planets,
                        description="Moon translates influence between two planets by applying Tajika aspects.",
                        strength=round((first.strength + second.strength) / 2.0, 2),
                        tags=["moon", "translation"],
                    )
                )
    _ = chart
    return yogas


@yoga_detector
def detect_yamaya(_chart: Chart, aspects: list[TajikaAspect]) -> list[TajikaYoga]:
    yogas: list[TajikaYoga] = []
    benefic_links = [
        aspect
        for aspect in aspects
        if aspect.applying and ({aspect.source, aspect.target} & BENEFICS)
    ]
    for first_index, first in enumerate(benefic_links):
        for second in benefic_links[first_index + 1 :]:
            shared = {first.source, first.target} & {second.source, second.target}
            if shared:
                yogas.append(
                    TajikaYoga(
                        name="Yamaya",
                        planets=sorted({first.source, first.target, second.source, second.target}),
                        description="A planet collects or distributes influence through two applying Tajika links.",
                        strength=round(min(first.strength, second.strength), 2),
                        tags=["collection", "benefic"],
                    )
                )
    return yogas


@yoga_detector
def detect_kamboola(_chart: Chart, aspects: list[TajikaAspect]) -> list[TajikaYoga]:
    return [
        TajikaYoga(
            name="Kamboola",
            planets=[aspect.source, aspect.target],
            description="Moon participates in an applying Ithasala, strengthening realization of the matter.",
            strength=min(100.0, aspect.strength + 10.0),
            tags=["moon", "ithasala"],
        )
        for aspect in aspects
        if aspect.applying and "Moon" in {aspect.source, aspect.target}
    ]


@yoga_detector
def detect_manahoo(_chart: Chart, aspects: list[TajikaAspect]) -> list[TajikaYoga]:
    return [
        TajikaYoga(
            name="Manahoo",
            planets=[aspect.source, aspect.target],
            description="Ithasala afflicted by a malefic planet, reducing ease of fulfillment.",
            strength=max(0.0, aspect.strength - 15.0),
            tags=["affliction", aspect.aspect_type],
        )
        for aspect in aspects
        if aspect.applying and ({aspect.source, aspect.target} & MALEFICS)
    ]


@yoga_detector
def detect_radda(chart: Chart, aspects: list[TajikaAspect]) -> list[TajikaYoga]:
    yogas: list[TajikaYoga] = []
    for aspect in aspects:
        if not aspect.applying:
            continue
        source = chart.planets[aspect.source]
        target = chart.planets[aspect.target]
        if _is_weakened(source) or _is_weakened(target):
            yogas.append(
                TajikaYoga(
                    name="Radda",
                    planets=[aspect.source, aspect.target],
                    description="Applying yoga is obstructed because one planet is retrograde or debilitated.",
                    strength=max(0.0, aspect.strength - 25.0),
                    tags=["cancellation", "weakness"],
                )
            )
    return yogas


@yoga_detector
def detect_duhphali_kuttha(chart: Chart, aspects: list[TajikaAspect]) -> list[TajikaYoga]:
    yogas: list[TajikaYoga] = []
    for aspect in aspects:
        source = chart.planets[aspect.source]
        target = chart.planets[aspect.target]
        if _is_weakened(source) and _is_weakened(target):
            yogas.append(
                TajikaYoga(
                    name="Duhphali Kuttha",
                    planets=[aspect.source, aspect.target],
                    description="Both planets in the Tajika contact are weak, lowering the fruit of the yoga.",
                    strength=max(0.0, aspect.strength - 35.0),
                    tags=["weakness", aspect.aspect_type],
                )
            )
    return yogas


def _is_weakened(planet: PlanetPosition) -> bool:
    return planet.retrograde or planet.dignity.debilitated
