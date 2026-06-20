import pytest

pytest.importorskip("swisseph")
pytest.importorskip("httpx")

from fastapi.testclient import TestClient

from app.astrology.traditional_strength import (
    _combustion_status,
    _planetary_war_statuses,
    calculate_traditional_strength,
)
from app.astrology.varga.calculator import calculate_varga_chart
from app.astrology.zodiac import zodiac_position
from app.main import app


def _chart_payload() -> dict[str, object]:
    return {
        "birth_data": {
            "name": "Test Native",
            "gender": "Female",
            "birth_date": "1990-01-01",
            "birth_time": "12:00:00",
            "place_of_birth": "New Delhi",
            "country": "India",
            "latitude": 28.6139,
            "longitude": 77.2090,
            "timezone": 5.5,
        }
    }


def test_traditional_strength_route_returns_component_scores() -> None:
    response = TestClient(app).post("/traditional-strength", json=_chart_payload())

    assert response.status_code == 200
    body = response.json()
    assert body["system"] == "traditional_jyotish_strength"
    assert len(body["planets"]) == 9
    first = body["planets"][0]
    assert 0 <= first["final_traditional_strength"] <= 100
    assert set(first["shadbala_score"]) == {
        "sthana_bala",
        "dig_bala",
        "kala_bala",
        "chesta_bala",
        "naisargika_bala",
        "drik_bala",
        "total",
    }


def test_traditional_strength_direct_engine_scores_all_default_planets(sample_chart) -> None:
    charts = {
        "D1": sample_chart,
        "D9": calculate_varga_chart(sample_chart, 9),
        "D10": calculate_varga_chart(sample_chart, 10),
        "D60": calculate_varga_chart(sample_chart, 60),
    }

    response = calculate_traditional_strength(charts)

    assert len(response.planets) == 9
    assert all(0 <= row.final_traditional_strength <= 100 for row in response.planets)
    assert all(0 <= row.ashtakavarga_score.score <= 100 for row in response.planets)
    assert all(row.varga_support_score.evidence for row in response.planets)


def test_combustion_status_applies_penalty_near_sun(sample_chart) -> None:
    sun = sample_chart.planets["Sun"]
    mars = sample_chart.planets["Mars"].model_copy(update={"longitude": sun.longitude + 3.0})
    chart = sample_chart.model_copy(update={"planets": sample_chart.planets | {"Mars": mars}})

    status, penalty = _combustion_status("Mars", chart)

    assert status.startswith("Combust")
    assert penalty > 0


def test_planetary_war_marks_close_planets(sample_chart) -> None:
    mars = sample_chart.planets["Mars"].model_copy(
        update={"longitude": 10.0, "latitude": 1.0, "zodiac": zodiac_position(10.0)}
    )
    mercury = sample_chart.planets["Mercury"].model_copy(
        update={"longitude": 10.5, "latitude": 0.1, "zodiac": zodiac_position(10.5)}
    )
    chart = sample_chart.model_copy(
        update={"planets": sample_chart.planets | {"Mars": mars, "Mercury": mercury}}
    )

    statuses = _planetary_war_statuses(chart)

    assert statuses["Mars"][0].startswith("Victorious")
    assert statuses["Mercury"][1] > 0
