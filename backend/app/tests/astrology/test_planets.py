import pytest

pytest.importorskip("swisseph")

from app.astrology.planets import calculate_planets
from app.astrology.schemas import AstrologySettings
from app.astrology.zodiac import normalize_longitude


def test_calculate_planets_derives_ketu_opposite_true_rahu() -> None:
    planets = calculate_planets(2460000.5, AstrologySettings())

    assert "Rahu" in planets
    assert "Ketu" in planets
    assert "Uranus" not in planets
    assert planets["Ketu"].longitude == pytest.approx(
        normalize_longitude(planets["Rahu"].longitude + 180.0)
    )


def test_outer_planets_are_opt_in() -> None:
    planets = calculate_planets(
        2460000.5,
        AstrologySettings(include_outer_planets=True),
    )

    assert {"Uranus", "Neptune", "Pluto"}.issubset(planets)
