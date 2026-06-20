from app.astrology.varshphal.schemas import (
    MuddaDashaTimeline,
    Muntha,
    Saham,
    TajikaYoga,
    VarshphalPrediction,
)

AREA_SAHAMS = {
    "Career": {"Rajya Saham", "Karma Saham"},
    "Marriage": {"Vivaha Saham"},
    "Relationships": {"Vivaha Saham", "Punya Saham"},
    "Wealth": {"Punya Saham", "Rajya Saham"},
    "Health": {"Mrityu Saham"},
    "Education": {"Vidya Saham"},
    "Children": {"Putra Saham"},
    "Travel": {"Punya Saham"},
    "Spirituality": {"Punya Saham", "Vidya Saham"},
}


def generate_predictions(
    muntha: Muntha,
    yogas: list[TajikaYoga],
    sahams: list[Saham],
    mudda_dasha: MuddaDashaTimeline,
) -> list[VarshphalPrediction]:
    predictions: list[VarshphalPrediction] = []
    current_lord = mudda_dasha.current.planet if mudda_dasha.current else mudda_dasha.start_lord
    strong_yogas = [yoga for yoga in yogas if yoga.strength >= 60.0][:3]

    for area, saham_names in AREA_SAHAMS.items():
        relevant_sahams = [saham for saham in sahams if saham.name in saham_names]
        factors = [
            f"Muntha in house {muntha.muntha_house} ({muntha.muntha_sign}), ruled by {muntha.munthesh}",
            f"Current Mudda influence: {current_lord}",
        ]
        factors.extend(
            f"{saham.name} in house {saham.house} ({saham.sign})" for saham in relevant_sahams
        )
        factors.extend(f"{yoga.name}: {', '.join(yoga.planets)}" for yoga in strong_yogas)
        predictions.append(
            VarshphalPrediction(
                area=area,
                summary=_summary_for_area(area, muntha, relevant_sahams, current_lord, strong_yogas),
                factors=factors,
            )
        )

    return predictions


def _summary_for_area(
    area: str,
    muntha: Muntha,
    sahams: list[Saham],
    current_lord: str,
    yogas: list[TajikaYoga],
) -> str:
    houses = ", ".join(str(saham.house) for saham in sahams) or "supporting"
    yoga_note = " Strong applying Tajika yogas support visible results." if yogas else ""
    return (
        f"{area} matters are judged through house {houses}, Muntha house "
        f"{muntha.muntha_house}, and the active Mudda lord {current_lord}."
        f"{yoga_note}"
    )
