import pytest

pytest.importorskip("swisseph")
pytest.importorskip("httpx")

from fastapi.testclient import TestClient

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


def test_d9_and_d10_routes_return_chart_types() -> None:
    client = TestClient(app)

    d9_response = client.post("/d9", json=_chart_payload())
    d10_response = client.post("/d10", json=_chart_payload())

    assert d9_response.status_code == 200
    assert d9_response.json()["chart_type"] == "D9"
    assert d10_response.status_code == 200
    assert d10_response.json()["chart_type"] == "D10"


def test_generic_chart_route_returns_requested_varga() -> None:
    client = TestClient(app)

    response = client.post("/chart?varga=60", json=_chart_payload())

    assert response.status_code == 200
    assert response.json()["chart_type"] == "D60"
    assert len(response.json()["houses"]) == 12


def test_named_chart_route_returns_requested_varga() -> None:
    client = TestClient(app)

    response = client.post("/charts/D27", json=_chart_payload())

    assert response.status_code == 200
    assert response.json()["chart_type"] == "D27"


def test_dasha_route_returns_timeline() -> None:
    client = TestClient(app)
    payload = _chart_payload() | {"calculation_date": "1995-01-01", "include_depth": 3}

    response = client.post("/dasha", json=payload)

    assert response.status_code == 200
    assert len(response.json()["mahadashas"]) >= 9
    assert response.json()["birth_balance"]["planet"]
    assert response.json()["current"]["path"]["mahadasha"]["status"] == "running"


def test_dasha_current_route_accepts_flat_payload() -> None:
    client = TestClient(app)
    payload = {
        "date": "2003-11-04",
        "time": "19:10:00",
        "lat": 30.1173,
        "lon": 78.3034,
        "timezone": 5.5,
        "calculation_date": "2025-01-01",
        "include_depth": 3,
    }

    response = client.post("/dasha/current", json=payload)

    assert response.status_code == 200
    assert response.json()["current_mahadasha"]
    assert response.json()["start_date"]
    assert response.json()["end_date"]


def test_dasha_next_route_returns_upcoming_periods() -> None:
    client = TestClient(app)
    payload = _chart_payload() | {"calculation_date": "1995-01-01", "include_depth": 2}

    response = client.post("/dasha/next", json=payload)

    assert response.status_code == 200
    assert response.json()["next"]
    assert response.json()["upcoming"]


def test_svg_route_returns_chart_layout() -> None:
    client = TestClient(app)

    response = client.post("/d1/svg", json=_chart_payload())

    assert response.status_code == 200
    assert response.json()["view_box"] == "0 0 100 100"
    assert response.json()["lines"]


def test_generic_svg_route_returns_requested_varga_layout() -> None:
    client = TestClient(app)

    response = client.post("/chart/svg?varga=60", json=_chart_payload())

    assert response.status_code == 200
    assert response.json()["chart_type"] == "D60"
    assert response.json()["lines"]


def test_supported_charts_route_lists_classical_vargas() -> None:
    client = TestClient(app)

    response = client.get("/divisional/charts")

    assert response.status_code == 200
    payload = response.json()
    assert payload["supported_charts"]["D1"] == 1
    assert payload["supported_charts"]["D60"] == 60
    assert any(chart["code"] == "D9" and chart["name"] == "Navamsa" for chart in payload["charts"])


def test_varshphal_route_returns_annual_report() -> None:
    client = TestClient(app)
    payload = _chart_payload() | {"year": 2030}

    response = client.post("/varshphal", json=payload)

    assert response.status_code == 200
    body = response.json()
    assert body["year"] == 2030
    assert body["chart"]["chart_type"] == "Varshphal"
    assert body["muntha"]["munthesh"]
    assert body["mudda_dasha"]["periods"]


def test_varshphal_subroutes_return_requested_sections() -> None:
    client = TestClient(app)
    payload = _chart_payload() | {"year": 2030}

    chart_response = client.post("/varshphal/chart", json=payload)
    muntha_response = client.post("/varshphal/muntha", json=payload)
    dasha_response = client.post("/varshphal/dasha", json=payload)
    svg_response = client.post("/varshphal/chart/svg", json=payload)
    tajika_response = client.post("/varshphal/tajika", json=payload)
    sahams_response = client.post("/varshphal/sahams", json=payload)

    assert chart_response.status_code == 200
    assert chart_response.json()["chart_type"] == "Varshphal"
    assert muntha_response.status_code == 200
    assert muntha_response.json()["muntha_house"] in range(1, 13)
    assert dasha_response.status_code == 200
    assert dasha_response.json()["system"] == "mudda"
    assert svg_response.status_code == 200
    assert svg_response.json()["chart_type"] == "Varshphal"
    assert tajika_response.status_code == 200
    assert len(tajika_response.json()["yoga_statuses"]) == 8
    assert sahams_response.status_code == 200
    assert sahams_response.json()["supported_count"] >= 7
    assert len(sahams_response.json()["sahams"]) == 7


def test_varshphal_annual_horoscope_route_returns_requested_block() -> None:
    client = TestClient(app)
    payload = _chart_payload() | {"year": 2030}

    response = client.post("/varshphal/annual-horoscope", json=payload)

    assert response.status_code == 200
    body = response.json()
    assert set(body) == {
        "birth_info",
        "astronomical_data",
        "natal_reference",
        "varsha_pravesh",
        "muntha",
        "tajika",
        "mudda_dasha",
        "sahams",
        "planetary_positions",
        "strength_analysis",
        "annual_summary",
    }
    assert body["birth_info"]["gender"] == "Female"
    assert body["varsha_pravesh"]["varshphal_year"] == 2030
    assert len(body["planetary_positions"]) == 9
    assert 0 <= body["annual_summary"]["career_score"] <= 100


def test_cors_preflight_allows_frontend_origin() -> None:
    client = TestClient(app)

    response = client.options(
        "/d1",
        headers={
            "Origin": "http://localhost:3000",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type",
        },
    )

    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "http://localhost:3000"
