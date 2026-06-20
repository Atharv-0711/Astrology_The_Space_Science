from app.astrology.divisional.engine import calculate_d10_chart, calculate_d9_chart, divisional_longitude
from app.astrology.schemas import Chart
from app.astrology.varga.calculator import calculate_varga_chart
from app.astrology.varga.engine import calculate_varga
from app.astrology.varga.rules import VARGA_CONFIG
from app.astrology.zodiac import sign_number_for_longitude


def test_navamsa_sign_rules_for_movable_fixed_and_dual_signs() -> None:
    assert sign_number_for_longitude(divisional_longitude(0.0, "D9")) == 1
    assert sign_number_for_longitude(divisional_longitude(30.0, "D9")) == 10
    assert sign_number_for_longitude(divisional_longitude(60.0, "D9")) == 7


def test_dashamsa_sign_rules_for_odd_and_even_signs() -> None:
    assert sign_number_for_longitude(divisional_longitude(0.0, "D10")) == 1
    assert sign_number_for_longitude(divisional_longitude(30.0, "D10")) == 10


def test_d9_and_d10_return_complete_chart_payloads(sample_chart: Chart) -> None:
    d9 = calculate_d9_chart(sample_chart)
    d10 = calculate_d10_chart(sample_chart)

    assert d9.chart_type == "D9"
    assert d10.chart_type == "D10"
    assert len(d9.planets) == len(sample_chart.planets)
    assert len(d10.houses) == 12
    assert all(planet.house in range(1, 13) for planet in d9.planets.values())


def test_calculate_varga_returns_structured_result() -> None:
    result = calculate_varga(longitude=123.45, division=9)

    assert result.division == 9
    assert result.chart_code == "D9"
    assert 1 <= result.sign_number <= 12
    assert result.rashi
    assert 0.0 <= result.degree < 30.0


def test_d1_varga_matches_source_chart(sample_chart: Chart) -> None:
    d1 = calculate_varga_chart(sample_chart, 1)

    assert d1.chart_type == "D1"
    assert d1.ascendant.longitude == sample_chart.ascendant.longitude
    assert d1.planets == sample_chart.planets
    assert d1.houses == sample_chart.houses


def test_supported_vargas_produce_valid_signs() -> None:
    for division in VARGA_CONFIG:
        result = calculate_varga(longitude=123.45, division=division)

        assert result.division == division
        assert 1 <= result.sign_number <= 12
        assert 0.0 <= result.longitude < 360.0
        assert 0.0 <= result.degree < 30.0


def test_all_supported_varga_charts_return_complete_payloads(sample_chart: Chart) -> None:
    for division, config in VARGA_CONFIG.items():
        chart = calculate_varga_chart(sample_chart, division)

        assert chart.chart_type == config.code
        assert len(chart.planets) == len(sample_chart.planets)
        assert len(chart.houses) == 12
        assert all(planet.house in range(1, 13) for planet in chart.planets.values())
