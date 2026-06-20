from app.astrology.zodiac import normalize_longitude, zodiac_position


def test_normalize_longitude_wraps_values() -> None:
    assert normalize_longitude(361.5) == 1.5
    assert normalize_longitude(-1.0) == 359.0


def test_zodiac_position_calculates_sign_nakshatra_and_pada() -> None:
    position = zodiac_position(13.3334)

    assert position.sign_number == 1
    assert position.sign_name == "Aries"
    assert position.sign_lord == "Mars"
    assert position.nakshatra == "Bharani"
    assert position.nakshatra_lord == "Venus"
    assert position.pada == 1


def test_zodiac_position_handles_last_nakshatra_boundary() -> None:
    position = zodiac_position(359.9999)

    assert position.sign_number == 12
    assert position.nakshatra == "Revati"
    assert position.pada == 4
