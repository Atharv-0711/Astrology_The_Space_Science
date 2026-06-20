from fastapi import APIRouter
from pydantic import BaseModel

from app.astrology.varga.rules import SUPPORTED_CHARTS, supported_vargas

router = APIRouter(tags=["divisional charts"])


class SupportedChart(BaseModel):
    code: str
    division: int
    name: str


class SupportedChartsResponse(BaseModel):
    supported_charts: dict[str, int]
    charts: list[SupportedChart]


@router.get("/divisional/charts", response_model=SupportedChartsResponse)
@router.get("/charts/supported", response_model=SupportedChartsResponse)
def list_supported_charts() -> SupportedChartsResponse:
    charts = [
        SupportedChart(code=config.code, division=config.division, name=config.name)
        for config in supported_vargas()
    ]
    return SupportedChartsResponse(supported_charts=SUPPORTED_CHARTS, charts=charts)
