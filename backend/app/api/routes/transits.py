from fastapi import APIRouter, Depends, HTTPException

from app.api.deps import settings_dependency
from app.astrology.engine import calculate_chart
from app.astrology.schemas import TransitEntry, TransitRequest, TransitResponse
from app.core.config import Settings

router = APIRouter(tags=["transits"])

FOCUS_PLANETS = ("Jupiter", "Saturn", "Rahu", "Ketu")


@router.post("/transits", response_model=TransitResponse)
def calculate_transits(
    request: TransitRequest,
    settings: Settings = Depends(settings_dependency),
) -> TransitResponse:
    try:
        natal_chart = calculate_chart(
            birth_data=request.birth_data,
            settings=request.settings,
            ephemeris_path=settings.swiss_ephemeris_path,
        )
        transit_birth_data = request.birth_data.model_copy(
            update={"birth_date": request.calculation_date}
        )
        transit_chart = calculate_chart(
            birth_data=transit_birth_data,
            settings=request.settings,
            ephemeris_path=settings.swiss_ephemeris_path,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    entries = [
        _build_transit_entry(planet, natal_chart, transit_chart)
        for planet in FOCUS_PLANETS
        if planet in natal_chart.planets and planet in transit_chart.planets
    ]
    return TransitResponse(
        calculation_date=request.calculation_date,
        focus=list(FOCUS_PLANETS),
        entries=entries,
    )


def _build_transit_entry(planet: str, natal_chart, transit_chart) -> TransitEntry:
    natal = natal_chart.planets[planet]
    transit = transit_chart.planets[planet]
    natal_house = _house_from_ascendant(
        transit.zodiac.sign_number,
        natal_chart.ascendant.zodiac.sign_number,
    )
    longitude_delta = _longitude_delta(transit.longitude, natal.longitude)

    return TransitEntry(
        planet=planet,
        natal_sign=natal.zodiac.sign_name,
        transit_sign=transit.zodiac.sign_name,
        transit_degree=round(transit.zodiac.degree, 2),
        natal_house=natal_house,
        motion="Retrograde" if transit.retrograde else "Direct",
        relationship=_relationship(longitude_delta),
        longitude_delta=round(longitude_delta, 2),
    )


def _house_from_ascendant(sign_number: int, ascendant_sign_number: int) -> int:
    return ((sign_number - ascendant_sign_number) % 12) + 1


def _longitude_delta(source: float, target: float) -> float:
    raw_delta = abs((source - target) % 360)
    return min(raw_delta, 360 - raw_delta)


def _relationship(delta: float) -> str:
    if delta <= 8:
        return "Return / conjunction"
    if abs(delta - 60) <= 8:
        return "Supportive sextile"
    if abs(delta - 90) <= 8:
        return "Square pressure"
    if abs(delta - 120) <= 8:
        return "Supportive trine"
    if abs(delta - 180) <= 8:
        return "Opposition"
    return "Background influence"
