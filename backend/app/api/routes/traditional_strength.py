from fastapi import APIRouter, Depends, HTTPException

from app.api.deps import settings_dependency
from app.astrology.engine import calculate_chart
from app.astrology.schemas import ChartRequest, TraditionalStrengthResponse
from app.astrology.traditional_strength import calculate_traditional_strength
from app.astrology.varga.calculator import calculate_varga_chart
from app.core.config import Settings

router = APIRouter(tags=["traditional-strength"])


@router.post("/traditional-strength", response_model=TraditionalStrengthResponse)
def traditional_strength(
    request: ChartRequest,
    settings: Settings = Depends(settings_dependency),
) -> TraditionalStrengthResponse:
    try:
        d1_chart = calculate_chart(
            birth_data=request.birth_data,
            settings=request.settings,
            ephemeris_path=settings.swiss_ephemeris_path,
        )
        charts = {
            "D1": d1_chart,
            "D9": calculate_varga_chart(d1_chart, 9),
            "D10": calculate_varga_chart(d1_chart, 10),
            "D60": calculate_varga_chart(d1_chart, 60),
        }
        return calculate_traditional_strength(charts)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
