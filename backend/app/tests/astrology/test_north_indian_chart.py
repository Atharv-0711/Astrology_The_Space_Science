from app.astrology.charts.north_indian import build_north_indian_chart_payload
from app.astrology.schemas import Chart
from app.astrology.varga.calculator import calculate_varga_chart


def test_north_indian_payload_contains_lines_and_interactive_labels(sample_chart: Chart) -> None:
    payload = build_north_indian_chart_payload(sample_chart)

    assert payload.chart_type == "D1"
    assert payload.view_box == "0 0 100 100"
    assert len(payload.lines) == 10
    assert any(label.kind == "planet" and label.planet == "Moon" for label in payload.labels)
    assert all(label.tooltip for label in payload.labels)


def test_north_indian_payload_places_first_house_at_top(sample_chart: Chart) -> None:
    payload = build_north_indian_chart_payload(sample_chart)

    house_labels = {label.house: label for label in payload.labels if label.kind == "house"}
    sign_labels = {label.house: label for label in payload.labels if label.kind == "sign"}
    ascendant_label = next(label for label in payload.labels if label.kind == "ascendant")

    assert house_labels[1].x == 50.0
    assert house_labels[1].y < 50.0
    assert sign_labels[1].x == 50.0
    assert sign_labels[1].y == 37.0
    assert ascendant_label.house == 1
    assert ascendant_label.y < 50.0
    assert house_labels[7].x == 50.0
    assert house_labels[7].y > 50.0
    assert sign_labels[7].x == 50.0
    assert sign_labels[7].y == 61.0


def test_north_indian_payload_renders_any_supported_varga(sample_chart: Chart) -> None:
    d60_chart = calculate_varga_chart(sample_chart, 60)

    payload = build_north_indian_chart_payload(d60_chart)

    assert payload.chart_type == "D60"
    assert len(payload.lines) == 10
    assert any(label.kind == "ascendant" for label in payload.labels)
    assert any(label.kind == "planet" for label in payload.labels)
