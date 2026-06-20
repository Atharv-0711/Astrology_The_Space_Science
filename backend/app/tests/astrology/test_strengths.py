from app.astrology.strengths import dignity_for_planet
from app.astrology.zodiac import zodiac_position


def test_dignity_flags_exaltation_and_own_sign() -> None:
    sun_aries = dignity_for_planet("Sun", zodiac_position(10.0))
    mars_aries = dignity_for_planet("Mars", zodiac_position(10.0))

    assert sun_aries.exalted
    assert not sun_aries.debilitated
    assert mars_aries.own_sign
    assert mars_aries.moolatrikona


def test_dignity_flags_debilitation() -> None:
    sun_libra = dignity_for_planet("Sun", zodiac_position(190.0))

    assert sun_libra.debilitated
    assert not sun_libra.exalted
