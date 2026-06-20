from fastapi import APIRouter

from app.i18n import RTL_LOCALE_CODES, SUPPORTED_LOCALE_CODES, canonical_term_layers, serialize_supported_locales

router = APIRouter(prefix="/i18n", tags=["i18n"])


@router.get("/locales")
def get_supported_locales() -> dict[str, object]:
    return {
        "default_locale": "en",
        "supported_locale_codes": sorted(SUPPORTED_LOCALE_CODES),
        "rtl_locale_codes": sorted(RTL_LOCALE_CODES),
        "locales": serialize_supported_locales(),
    }


@router.get("/canonical-terms")
def get_canonical_term_layers() -> dict[str, object]:
    return {
        "source_locale": "en",
        "canonical_values_are_engine_contract": True,
        "layers": canonical_term_layers(),
    }
