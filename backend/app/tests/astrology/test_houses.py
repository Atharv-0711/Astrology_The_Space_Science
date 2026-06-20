from app.astrology.houses import sign_for_whole_sign_house, whole_sign_house_for_sign


def test_whole_sign_house_assignment_from_aries_lagna() -> None:
    assert whole_sign_house_for_sign(sign_number=1, ascendant_sign_number=1) == 1
    assert whole_sign_house_for_sign(sign_number=7, ascendant_sign_number=1) == 7
    assert whole_sign_house_for_sign(sign_number=12, ascendant_sign_number=1) == 12


def test_whole_sign_house_assignment_wraps_from_scorpio_lagna() -> None:
    assert whole_sign_house_for_sign(sign_number=8, ascendant_sign_number=8) == 1
    assert whole_sign_house_for_sign(sign_number=1, ascendant_sign_number=8) == 6
    assert sign_for_whole_sign_house(house_number=12, ascendant_sign_number=8) == 7
