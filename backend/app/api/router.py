from fastapi import APIRouter

from app.api.routes import auth, chart, dasha, divisional, i18n, report, traditional_strength, transits, varshphal, yogas

api_router = APIRouter()
api_router.include_router(chart.router)
api_router.include_router(dasha.router)
api_router.include_router(divisional.router)
api_router.include_router(yogas.router)
api_router.include_router(report.router)
api_router.include_router(traditional_strength.router)
api_router.include_router(transits.router)
api_router.include_router(varshphal.router)
api_router.include_router(auth.router)
api_router.include_router(i18n.router)
