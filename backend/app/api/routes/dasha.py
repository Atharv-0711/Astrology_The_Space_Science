from fastapi import APIRouter, Depends, HTTPException

from app.api.deps import dasha_service_dependency
from app.astrology.dasha.schemas import (
    CurrentDashaResponse,
    DashaCalculationRequest,
    DashaTimeline,
    NextDashaResponse,
)
from app.astrology.schemas import Chart
from app.services.dasha_service import DashaService

router = APIRouter(tags=["dashas"])


@router.post("/dasha", response_model=DashaTimeline)
def create_dasha_timeline(
    request: DashaCalculationRequest,
    service: DashaService = Depends(dasha_service_dependency),
) -> DashaTimeline:
    chart = _calculate_birth_chart(request, service)
    return service.calculate_timeline(chart, request.calculation_date, request.include_depth)


@router.post("/dasha/vimshottari", response_model=DashaTimeline)
def create_vimshottari_timeline(
    request: DashaCalculationRequest,
    service: DashaService = Depends(dasha_service_dependency),
) -> DashaTimeline:
    chart = _calculate_birth_chart(request, service)
    return service.calculate_timeline(chart, request.calculation_date, request.include_depth)


@router.post("/dasha/current", response_model=CurrentDashaResponse)
def get_current_dasha(
    request: DashaCalculationRequest,
    service: DashaService = Depends(dasha_service_dependency),
) -> CurrentDashaResponse:
    chart = _calculate_birth_chart(request, service)
    return service.current(chart, request.calculation_date, request.include_depth)


@router.post("/dasha/timeline", response_model=DashaTimeline)
def get_dasha_timeline(
    request: DashaCalculationRequest,
    service: DashaService = Depends(dasha_service_dependency),
) -> DashaTimeline:
    chart = _calculate_birth_chart(request, service)
    return service.calculate_timeline(chart, request.calculation_date, request.include_depth)


@router.post("/dasha/next", response_model=NextDashaResponse)
def get_next_dasha(
    request: DashaCalculationRequest,
    service: DashaService = Depends(dasha_service_dependency),
) -> NextDashaResponse:
    chart = _calculate_birth_chart(request, service)
    return service.next(chart, request.calculation_date, request.include_depth)


def _calculate_birth_chart(request: DashaCalculationRequest, service: DashaService) -> Chart:
    if request.birth_data is None:
        raise HTTPException(status_code=400, detail="birth data is required")
    try:
        return service.calculate_birth_chart(request.birth_data, request.settings)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
