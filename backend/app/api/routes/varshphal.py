from fastapi import APIRouter, Depends, HTTPException

from app.api.deps import varshphal_service_dependency
from app.astrology.schemas import Chart, NorthIndianChartPayload
from app.astrology.varshphal.schemas import (
    AnnualHoroscopeInformationBlock,
    MuddaDashaTimeline,
    Muntha,
    SahamReport,
    TajikaReport,
    VarshPravesh,
    VarshphalReport,
    VarshphalRequest,
)
from app.services.varshphal_service import VarshphalService

router = APIRouter(tags=["varshphal"])


@router.post("/varshphal", response_model=VarshphalReport)
@router.post("/varshphal/report", response_model=VarshphalReport)
def create_varshphal(
    request: VarshphalRequest,
    service: VarshphalService = Depends(varshphal_service_dependency),
) -> VarshphalReport:
    return _calculate_report(request, service)


@router.post("/varshphal/pravesh", response_model=VarshPravesh)
def create_varsh_pravesh(
    request: VarshphalRequest,
    service: VarshphalService = Depends(varshphal_service_dependency),
) -> VarshPravesh:
    try:
        return service.pravesh(request.birth_data, request.year, request.settings)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/varshphal/chart", response_model=Chart)
def create_varshphal_chart(
    request: VarshphalRequest,
    service: VarshphalService = Depends(varshphal_service_dependency),
) -> Chart:
    return _calculate_report(request, service).chart


@router.post("/varshphal/chart/svg", response_model=NorthIndianChartPayload)
def create_varshphal_chart_svg(
    request: VarshphalRequest,
    service: VarshphalService = Depends(varshphal_service_dependency),
) -> NorthIndianChartPayload:
    try:
        return service.chart_svg(
            request.birth_data,
            request.year,
            request.settings,
            request.calculation_date,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/varshphal/muntha", response_model=Muntha)
def create_varshphal_muntha(
    request: VarshphalRequest,
    service: VarshphalService = Depends(varshphal_service_dependency),
) -> Muntha:
    return _calculate_report(request, service).muntha


@router.post("/varshphal/dasha", response_model=MuddaDashaTimeline)
def create_varshphal_dasha(
    request: VarshphalRequest,
    service: VarshphalService = Depends(varshphal_service_dependency),
) -> MuddaDashaTimeline:
    return _calculate_report(request, service).mudda_dasha


@router.post("/varshphal/tajika", response_model=TajikaReport)
def create_varshphal_tajika(
    request: VarshphalRequest,
    service: VarshphalService = Depends(varshphal_service_dependency),
) -> TajikaReport:
    try:
        return service.tajika(
            request.birth_data,
            request.year,
            request.settings,
            request.calculation_date,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/varshphal/sahams", response_model=SahamReport)
def create_varshphal_sahams(
    request: VarshphalRequest,
    service: VarshphalService = Depends(varshphal_service_dependency),
) -> SahamReport:
    try:
        return service.sahams(
            request.birth_data,
            request.year,
            request.settings,
            request.calculation_date,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/varshphal/annual-horoscope", response_model=AnnualHoroscopeInformationBlock)
def create_annual_horoscope_information_block(
    request: VarshphalRequest,
    service: VarshphalService = Depends(varshphal_service_dependency),
) -> AnnualHoroscopeInformationBlock:
    try:
        return service.annual_horoscope(
            request.birth_data,
            request.year,
            request.settings,
            request.calculation_date,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


def _calculate_report(request: VarshphalRequest, service: VarshphalService) -> VarshphalReport:
    try:
        return service.report(
            request.birth_data,
            request.year,
            request.settings,
            request.calculation_date,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
