from collections.abc import Generator

from fastapi import Depends

from app.core.config import Settings, get_settings
from app.services.dasha_service import DashaService
from app.services.varshphal_service import VarshphalService


def settings_dependency() -> Settings:
    return get_settings()


def dasha_service_dependency(settings: Settings = Depends(settings_dependency)) -> DashaService:
    return DashaService(ephemeris_path=settings.swiss_ephemeris_path)


def varshphal_service_dependency(
    settings: Settings = Depends(settings_dependency),
) -> VarshphalService:
    return VarshphalService(ephemeris_path=settings.swiss_ephemeris_path)


def database_session_dependency() -> Generator[None, None, None]:
    """Placeholder dependency until Phase 10 wires SQLAlchemy sessions."""
    yield None
