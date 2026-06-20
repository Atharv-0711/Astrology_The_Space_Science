# Dasha Engine Architecture

The Dasha engine is separate from the Varga engine. It consumes the D1 chart only for the Moon's sidereal Lahiri longitude, Nakshatra, Pada, and Nakshatra lord.

## Defaults

- System: Vedic Astrology
- Zodiac: Sidereal
- Ayanamsha: Lahiri
- Nakshatra system: 27 Nakshatras
- Default Dasha: Vimshottari

## Vimshottari Rules

The implementation uses the classical 120-year sequence:

`Ketu -> Venus -> Sun -> Moon -> Mars -> Rahu -> Jupiter -> Saturn -> Mercury`

Planetary years:

- Ketu: 7
- Venus: 20
- Sun: 6
- Moon: 10
- Mars: 7
- Rahu: 18
- Jupiter: 16
- Saturn: 19
- Mercury: 17

Birth balance is calculated from the Moon's exact position inside its Nakshatra:

`remaining_fraction = remaining_degrees_in_nakshatra / 13deg20min`

`remaining_years = birth_lord_years * remaining_fraction`

Each child level is subdivided by:

`child_duration = parent_duration * child_lord_years / 120`

The same rule is applied recursively for Mahadasha, Antardasha, Pratyantar, Sookshma, and Prana.

## API

- `POST /dasha/vimshottari`: full Vimshottari timeline
- `POST /dasha/current`: current running hierarchy
- `POST /dasha/timeline`: full timeline response
- `POST /dasha/next`: next periods
- `POST /dasha`: backwards-compatible alias for the timeline

Requests can use the existing nested chart payload or the flat payload:

```json
{
  "date": "2003-11-04",
  "time": "19:10:00",
  "lat": 30.1173,
  "lon": 78.3034,
  "timezone": 5.5,
  "calculation_date": "2025-01-01",
  "include_depth": 5
}
```

`timezone` is required for accurate birth-time conversion when using the flat payload. If omitted, it defaults to UTC.

## Interpretations

Dasha interpretation JSON lives under:

- `backend/app/astrology/interpretations/data/dasha/mahadasha/`
- `backend/app/astrology/interpretations/data/dasha/antardasha/`

The calculation engine attaches matching Mahadasha and Antardasha interpretations without coupling period math to interpretation prose.

## Future Engines

`backend/app/astrology/dasha/registry.py` exposes `DASHA_REGISTRY`. Vimshottari is implemented, while Yogini, Ashtottari, Kalachakra, Chara, Narayana, and Shoola are registered as future extension points.
