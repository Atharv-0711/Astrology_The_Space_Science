from fastapi import APIRouter, Depends, HTTPException, Query

from app.api.deps import settings_dependency
from app.astrology.charts.north_indian import build_north_indian_chart_payload
from app.astrology.engine import generate_chart
from app.astrology.schemas import Chart, ChartRequest, NorthIndianChartPayload
from app.core.config import Settings

router = APIRouter(tags=["charts"])


@router.post("/chart", response_model=Chart)
@router.post("/d1", response_model=Chart)
def create_chart(
    request: ChartRequest,
    varga: int = Query(default=1, ge=1, le=60),
    settings: Settings = Depends(settings_dependency),
) -> Chart:
    return _create_varga_chart(request, varga, settings)


@router.post("/charts/{chart_type}", response_model=Chart)
def create_named_varga_chart(
    chart_type: str,
    request: ChartRequest,
    settings: Settings = Depends(settings_dependency),
) -> Chart:
    return _create_varga_chart(request, _division_from_chart_type(chart_type), settings)


@router.post("/d9", response_model=Chart)
def create_d9_chart(
    request: ChartRequest,
    settings: Settings = Depends(settings_dependency),
) -> Chart:
    return _create_varga_chart(request, 9, settings)


@router.post("/d10", response_model=Chart)
def create_d10_chart(
    request: ChartRequest,
    settings: Settings = Depends(settings_dependency),
) -> Chart:
    return _create_varga_chart(request, 10, settings)


@router.post("/chart/svg", response_model=NorthIndianChartPayload)
@router.post("/d1/svg", response_model=NorthIndianChartPayload)
def create_d1_svg_payload(
    request: ChartRequest,
    varga: int = Query(default=1, ge=1, le=60),
    settings: Settings = Depends(settings_dependency),
) -> NorthIndianChartPayload:
    chart = _create_varga_chart(request, varga, settings)
    return build_north_indian_chart_payload(chart)


@router.post("/charts/{chart_type}/svg", response_model=NorthIndianChartPayload)
def create_named_varga_svg_payload(
    chart_type: str,
    request: ChartRequest,
    settings: Settings = Depends(settings_dependency),
) -> NorthIndianChartPayload:
    chart = _create_varga_chart(request, _division_from_chart_type(chart_type), settings)
    return build_north_indian_chart_payload(chart)


@router.post("/d9/svg", response_model=NorthIndianChartPayload)
def create_d9_svg_payload(
    request: ChartRequest,
    settings: Settings = Depends(settings_dependency),
) -> NorthIndianChartPayload:
    chart = create_d9_chart(request, settings)
    return build_north_indian_chart_payload(chart)


@router.post("/d10/svg", response_model=NorthIndianChartPayload)
def create_d10_svg_payload(
    request: ChartRequest,
    settings: Settings = Depends(settings_dependency),
) -> NorthIndianChartPayload:
    chart = create_d10_chart(request, settings)
    return build_north_indian_chart_payload(chart)


def _create_varga_chart(request: ChartRequest, varga: int, settings: Settings) -> Chart:
    try:
        return generate_chart(
            birth_data=request.birth_data,
            varga=varga,
            settings=request.settings,
            ephemeris_path=settings.swiss_ephemeris_path,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


def _division_from_chart_type(chart_type: str) -> int:
    normalized = chart_type.upper()
    if not normalized.startswith("D"):
        raise HTTPException(status_code=400, detail=f"Unsupported chart type: {chart_type}")
    try:
        return int(normalized[1:])
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=f"Unsupported chart type: {chart_type}") from exc
