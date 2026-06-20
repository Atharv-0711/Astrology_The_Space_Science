"use client";

import { useMemo } from "react";

import { useChart, useCurrentDasha } from "@/hooks/useChart";
import type { Chart, ChartRequest, CurrentDashaResponse, PlanetPosition } from "@/lib/types";

import { StatusBadge } from "./StatusBadge";
import { aspectCountByPlanet, planetScore } from "./helpers";

type Tone = "good" | "info" | "warn" | "danger";

type EvaluatedItem = {
  title: string;
  score: number;
  status: string;
  why: string;
};

type MarriageEvaluation = {
  score: number;
  stability: EvaluatedItem;
  timing: EvaluatedItem;
  partnerCharacteristics: string[];
  strengths: string[];
  challenges: string[];
  indicators: EvaluatedItem[];
  dashaInfluence: EvaluatedItem[];
  d9Summary: EvaluatedItem;
  yogas: EvaluatedItem[];
  afflictions: EvaluatedItem[];
};

const CHARA_KARAKA_PLANETS = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"];
const RELATIONSHIP_HOUSES = new Set([1, 2, 4, 5, 7, 9, 11]);
const DIFFICULT_HOUSES = new Set([6, 8, 12]);
const BENEFICS = new Set(["Jupiter", "Venus", "Mercury", "Moon"]);
const MALEFICS = new Set(["Mars", "Saturn", "Rahu", "Ketu", "Sun"]);
const SIGN_TRAITS: Record<string, string> = {
  Aries: "independent, direct, energetic, and action-oriented",
  Taurus: "steady, loyal, sensual, and security-focused",
  Gemini: "communicative, curious, adaptable, and mentally active",
  Cancer: "nurturing, protective, emotional, and family-centered",
  Leo: "confident, expressive, proud, and status-aware",
  Virgo: "practical, analytical, service-minded, and detail-focused",
  Libra: "relationship-oriented, diplomatic, refined, and fairness-seeking",
  Scorpio: "intense, private, loyal, and transformative",
  Sagittarius: "principled, adventurous, optimistic, and growth-seeking",
  Capricorn: "mature, responsible, ambitious, and duty-conscious",
  Aquarius: "independent, intellectual, unconventional, and socially aware",
  Pisces: "sensitive, compassionate, imaginative, and spiritual",
};

export function MarriageAnalysisModule({
  chart,
  request,
  enabled,
  term,
}: {
  chart: Chart;
  request: ChartRequest;
  enabled: boolean;
  term: (layer: string, canonical: string) => string;
}) {
  const d9 = useChart("D9", request, enabled);
  const currentDasha = useCurrentDasha(request, undefined, enabled);
  const evaluation = useMemo(
    () => buildMarriageEvaluation(chart, d9.data ?? null, currentDasha.data ?? null, term),
    [chart, d9.data, currentDasha.data, term],
  );

  return (
    <div className="space-y-5">
      <div className="grid gap-4 lg:grid-cols-[1fr_2fr]">
        <ScoreCard score={evaluation.score} title="Marriage Score" status={scoreLabel(evaluation.score)} />
        <div className="grid gap-3 md:grid-cols-2">
          <PotentialCard item={evaluation.stability} />
          <PotentialCard item={evaluation.timing} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <NarrativeList title="Partner Characteristics" items={evaluation.partnerCharacteristics} />
        <NarrativeList title="Strengths" items={evaluation.strengths} />
        <NarrativeList title="Challenges" items={evaluation.challenges} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <EvaluationSection title="Marriage Yogas" items={evaluation.yogas} />
        <EvaluationSection title="Afflictions" items={evaluation.afflictions} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <EvaluationSection title="Current Dasha Influence" items={evaluation.dashaInfluence} />
        <D9Summary item={evaluation.d9Summary} loading={d9.isLoading} enabled={enabled} hasError={d9.isError || currentDasha.isError} />
      </div>

      <EvaluationSection title="Marriage Indicators" items={evaluation.indicators} />
    </div>
  );
}

function ScoreCard({ score, title, status }: { score: number; title: string; status: string }) {
  return (
    <div className="rounded-2xl border border-pink-200/20 bg-pink-200/10 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-pink-100/70">{title}</p>
          <p className="mt-2 text-4xl font-bold text-white">{score}/100</p>
        </div>
        <StatusBadge tone={toneForScore(score)}>{status}</StatusBadge>
      </div>
      <p className="mt-4 text-sm text-slate-300">
        This score combines the 7th house and lord, Venus, Jupiter, Darakaraka, Upapada Lagna, D9, yogas, afflictions, and active dasha timing.
      </p>
    </div>
  );
}

function PotentialCard({ item }: { item: EvaluatedItem }) {
  return (
    <div className="rounded-2xl bg-black/20 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="font-semibold text-white">{item.title}</p>
        <StatusBadge tone={toneForScore(item.score)}>{item.score}/100</StatusBadge>
      </div>
      <p className="mt-2 text-sm text-slate-400">{item.why}</p>
    </div>
  );
}

function EvaluationSection({ title, items }: { title: string; items: EvaluatedItem[] }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-black/10">
      <div className="border-b border-white/10 px-4 py-3">
        <h3 className="font-semibold text-white">{title}</h3>
      </div>
      <div className="grid gap-3 p-4 md:grid-cols-2">
        {items.map((item) => (
          <div key={item.title} className="rounded-xl bg-black/20 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="font-semibold text-white">{item.title}</p>
              <StatusBadge tone={toneForScore(item.score)}>{item.status}</StatusBadge>
            </div>
            <p className="mt-2 text-sm text-slate-400">{item.why}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function NarrativeList({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-black/10 p-4">
      <h3 className="font-semibold text-white">{title}</h3>
      <ul className="mt-3 space-y-2 text-sm text-slate-300">
        {items.map((item) => (
          <li key={item} className="rounded-xl bg-black/20 px-3 py-2">
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

function D9Summary({
  item,
  loading,
  enabled,
  hasError,
}: {
  item: EvaluatedItem;
  loading: boolean;
  enabled: boolean;
  hasError: boolean;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-semibold text-white">D9 Summary</p>
          <p className="mt-1 text-sm text-slate-400">{item.why}</p>
        </div>
        <StatusBadge tone={toneForScore(item.score)}>{loading ? "Loading D9" : `${item.score}/100`}</StatusBadge>
      </div>
      {!enabled ? <p className="mt-3 text-xs text-slate-500">Open this section to load D9 and current dasha calculations.</p> : null}
      {hasError ? (
        <p className="mt-3 text-xs text-amber-100">
          Some live marriage factors could not be loaded, so the score is based on natal indicators only.
        </p>
      ) : null}
    </section>
  );
}

function buildMarriageEvaluation(
  chart: Chart,
  d9: Chart | null,
  dasha: CurrentDashaResponse | null,
  term: (layer: string, canonical: string) => string,
): MarriageEvaluation {
  const aspectCounts = aspectCountByPlanet(chart);
  const seventhHouse = chart.houses["7"];
  const seventhLord = chart.planets[seventhHouse.lord];
  const venus = chart.planets.Venus;
  const jupiter = chart.planets.Jupiter;
  const darakaraka = getDarakaraka(chart);
  const upapada = calculateUpapada(chart);
  const yogas = detectMarriageYogas(chart, d9, darakaraka, term);
  const afflictions = detectAfflictions(chart, seventhLord, venus, darakaraka, term);

  const seventhHouseScore = scoreHouse(seventhHouse, chart);
  const seventhLordScore = seventhLord ? scoreRelationshipPlanet(seventhLord, aspectCounts.get(seventhLord.name) ?? 0) : 40;
  const seventhLordPlacementScore = seventhLord ? scorePlacement(seventhLord.house) : 40;
  const venusScore = scoreRelationshipPlanet(venus, aspectCounts.get("Venus") ?? 0);
  const jupiterScore = scoreRelationshipPlanet(jupiter, aspectCounts.get("Jupiter") ?? 0);
  const darakarakaScore = darakaraka ? scoreRelationshipPlanet(darakaraka, aspectCounts.get(darakaraka.name) ?? 0) : 45;
  const upapadaScore = scoreUpapada(upapada, chart);
  const d9Score = d9 ? scoreD9(d9, seventhHouse.lord) : 45;
  const yogaScore = clampScore(50 + yogas.filter((item) => item.score >= 65).length * 8 - afflictions.filter((item) => item.score <= 45).length * 8);
  const dashaScore = scoreDasha(dasha, chart, seventhHouse.lord, darakaraka, aspectCounts);

  const score = clampScore(
    seventhHouseScore * 0.13 +
      seventhLordScore * 0.14 +
      seventhLordPlacementScore * 0.09 +
      venusScore * 0.12 +
      jupiterScore * 0.09 +
      darakarakaScore * 0.08 +
      upapadaScore * 0.08 +
      d9Score * 0.14 +
      yogaScore * 0.07 +
      dashaScore * 0.06,
  );

  const stabilityScore = clampScore(
    seventhLordScore * 0.25 +
      venusScore * 0.2 +
      jupiterScore * 0.15 +
      d9Score * 0.25 +
      (100 - afflictions.reduce((sum, item) => sum + (item.score <= 45 ? 8 : 0), 0)) * 0.15,
  );

  const timingScore = dashaScore;
  const indicators: EvaluatedItem[] = [
    {
      title: "7th House",
      score: seventhHouseScore,
      status: scoreLabel(seventhHouseScore),
      why: `${term("signs", seventhHouse.sign_name)} on the 7th describes relationship style. ${occupantText(seventhHouse, term)} ${houseStrengthText(seventhHouse)}`,
    },
    {
      title: "7th Lord",
      score: seventhLordScore,
      status: scoreLabel(seventhLordScore),
      why: seventhLord
        ? `${term("planets", seventhLord.name)} rules marriage partnership and scores ${seventhLordScore}/100 because ${planetConditionText(seventhLord, aspectCounts.get(seventhLord.name) ?? 0)}`
        : `The 7th lord ${term("planets", seventhHouse.lord)} is missing from the chart payload, so this factor is weighted conservatively.`,
    },
    {
      title: "7th Lord Placement",
      score: seventhLordPlacementScore,
      status: scoreLabel(seventhLordPlacementScore),
      why: seventhLord
        ? `${term("planets", seventhLord.name)} is placed in house ${seventhLord.house ?? "-"}; ${placementMeaning(seventhLord.house)}`
        : "Placement cannot be evaluated because the 7th lord is missing from the chart payload.",
    },
    planetIndicator("Venus", venus, venusScore, aspectCounts, term, "affection, attraction, romance, compromise, and marital harmony"),
    planetIndicator("Jupiter", jupiter, jupiterScore, aspectCounts, term, "family growth, wisdom, protection, counsel, and traditional support for marriage"),
    {
      title: "Darakaraka",
      score: darakarakaScore,
      status: scoreLabel(darakarakaScore),
      why: darakaraka
        ? `${term("planets", darakaraka.name)} is Darakaraka because it has the lowest degree among classical planets. It describes spouse karma and scores ${darakarakaScore}/100 because ${planetConditionText(darakaraka, aspectCounts.get(darakaraka.name) ?? 0)}`
        : "Darakaraka could not be calculated from the available classical planets.",
    },
    {
      title: "Upapada Lagna",
      score: upapadaScore,
      status: scoreLabel(upapadaScore),
      why: `${term("signs", upapada.signName)} is estimated as Upapada Lagna from the 12th lord. It falls in house ${upapada.houseFromAscendant}, so ${upapadaMeaning(upapada.houseFromAscendant)}`,
    },
  ];

  const strengths = [
    ...indicators.filter((item) => item.score >= 68).slice(0, 4).map((item) => `${item.title}: ${item.why}`),
    ...yogas.filter((item) => item.score >= 68).slice(0, 2).map((item) => `${item.title}: ${item.why}`),
  ];
  const challenges = [
    ...indicators.filter((item) => item.score <= 48).slice(0, 4).map((item) => `${item.title}: ${item.why}`),
    ...afflictions.filter((item) => item.score <= 48).slice(0, 3).map((item) => `${item.title}: ${item.why}`),
  ];

  return {
    score,
    stability: {
      title: "Relationship Stability Score",
      score: stabilityScore,
      status: scoreLabel(stabilityScore),
      why: "Stability is judged from 7th lord condition, Venus, Jupiter, D9 confirmation, and whether afflictions pressure the marriage factors.",
    },
    timing: {
      title: "Marriage Timing Indicators",
      score: timingScore,
      status: scoreLabel(timingScore),
      why: dashaTimingText(dasha, chart, seventhHouse.lord, darakaraka, term),
    },
    partnerCharacteristics: partnerCharacteristics(chart, seventhLord, darakaraka, upapada, term),
    strengths: strengths.length ? strengths : ["Marriage promise is mixed rather than absent; no single factor crosses the strong threshold, so D9 and dasha timing become especially important."],
    challenges: challenges.length ? challenges : ["No major marriage factor falls below the challenge threshold; still review dasha timing before drawing timing conclusions."],
    indicators,
    dashaInfluence: buildDashaInfluence(dasha, chart, seventhHouse.lord, darakaraka, aspectCounts, term),
    d9Summary: {
      title: "D9 Navamsa",
      score: d9Score,
      status: scoreLabel(d9Score),
      why: d9 ? d9SummaryText(d9, seventhHouse.lord, term) : "D9 has not loaded yet, so the marriage score currently uses a conservative placeholder for Navamsa strength.",
    },
    yogas: yogas.length ? yogas : [{ title: "Marriage Yogas", score: 50, status: "Developing", why: "No strong marriage yoga was detected from the current chart factors, so the judgment relies more on the 7th lord, Venus, Jupiter, D9, and dasha." }],
    afflictions: afflictions.length ? afflictions : [{ title: "Afflictions", score: 70, status: "Manageable", why: "No major affliction pattern was detected against the 7th house, 7th lord, Venus, or Darakaraka in this rule set." }],
  };
}

function planetIndicator(
  name: string,
  planet: PlanetPosition,
  score: number,
  aspectCounts: Map<string, number>,
  term: (layer: string, canonical: string) => string,
  role: string,
): EvaluatedItem {
  return {
    title: name,
    score,
    status: scoreLabel(score),
    why: `${term("planets", name)} represents ${role}. It is in ${term("signs", planet.zodiac.sign_name)} house ${planet.house ?? "-"} and scores ${score}/100 because ${planetConditionText(planet, aspectCounts.get(name) ?? 0)}`,
  };
}

function scoreRelationshipPlanet(planet: PlanetPosition, aspectCount: number) {
  return planetScore(planet, aspectCount);
}

function scoreHouse(house: Chart["houses"][string], chart: Chart) {
  let score = 48;
  score += Math.min(18, house.occupants.length * 6);
  if (house.strength !== null) score += house.strength * 6;
  const lord = chart.planets[house.lord];
  if (lord?.dignity.exalted) score += 10;
  if (lord?.dignity.own_sign || lord?.dignity.moolatrikona) score += 8;
  if (lord?.dignity.debilitated) score -= 12;
  if (house.occupants.some((planet) => BENEFICS.has(planet))) score += 8;
  if (house.occupants.some((planet) => MALEFICS.has(planet))) score -= 8;
  return clampScore(score);
}

function scorePlacement(house: number | null | undefined) {
  if (!house) return 40;
  if (RELATIONSHIP_HOUSES.has(house)) return 76;
  if (house === 3 || house === 10) return 58;
  if (DIFFICULT_HOUSES.has(house)) return 38;
  return 52;
}

function scoreD9(d9: Chart, seventhLordName: string) {
  const d9Seventh = d9.houses["7"];
  const d9SeventhLord = d9.planets[d9Seventh.lord];
  const natalSeventhLordInD9 = d9.planets[seventhLordName];
  let score = scoreHouse(d9Seventh, d9) * 0.45;
  score += (d9SeventhLord ? planetScore(d9SeventhLord, 0) : 45) * 0.3;
  score += (natalSeventhLordInD9 ? scorePlacement(natalSeventhLordInD9.house) : 45) * 0.25;
  return clampScore(score);
}

function scoreDasha(
  dasha: CurrentDashaResponse | null,
  chart: Chart,
  seventhLordName: string,
  darakaraka: PlanetPosition | null,
  aspectCounts: Map<string, number>,
) {
  if (!dasha?.current_mahadasha) return 45;
  const active = [dasha.current_mahadasha, dasha.current_antardasha].filter(Boolean) as string[];
  const scores = active.map((planetName) => {
    const planet = chart.planets[planetName];
    if (!planet) return 45;
    let score = scoreRelationshipPlanet(planet, aspectCounts.get(planetName) ?? 0);
    if ([seventhLordName, "Venus", "Jupiter", darakaraka?.name].includes(planetName)) score += 12;
    if (planet.house && [2, 7, 11].includes(planet.house)) score += 8;
    if (planet.house && DIFFICULT_HOUSES.has(planet.house)) score -= 8;
    return clampScore(score);
  });
  return clampScore(scores.reduce((sum, score) => sum + score, 0) / scores.length);
}

function getDarakaraka(chart: Chart) {
  const ranked = CHARA_KARAKA_PLANETS.map((name) => chart.planets[name])
    .filter(Boolean)
    .sort((first, second) => first.zodiac.degree - second.zodiac.degree);
  return ranked[0] ?? null;
}

function calculateUpapada(chart: Chart) {
  const twelfth = chart.houses["12"];
  const twelfthLord = chart.planets[twelfth.lord];
  const lordSign = twelfthLord?.zodiac.sign_number ?? twelfth.sign_number;
  const distance = ((lordSign - twelfth.sign_number + 12) % 12) + 1;
  const signNumber = ((lordSign + distance - 2) % 12) + 1;
  const houseFromAscendant = ((signNumber - chart.ascendant.zodiac.sign_number + 12) % 12) + 1;
  const signName = Object.values(chart.houses).find((house) => house.sign_number === signNumber)?.sign_name ?? twelfth.sign_name;
  return { signNumber, signName, houseFromAscendant };
}

function scoreUpapada(upapada: ReturnType<typeof calculateUpapada>, chart: Chart) {
  const house = Object.values(chart.houses).find((item) => item.sign_number === upapada.signNumber);
  let score = scorePlacement(upapada.houseFromAscendant);
  if (house?.occupants.some((planet) => BENEFICS.has(planet))) score += 10;
  if (house?.occupants.some((planet) => MALEFICS.has(planet))) score -= 10;
  return clampScore(score);
}

function detectMarriageYogas(
  chart: Chart,
  d9: Chart | null,
  darakaraka: PlanetPosition | null,
  term: (layer: string, canonical: string) => string,
) {
  const yogas: EvaluatedItem[] = [];
  const seventhHouse = chart.houses["7"];
  const seventhLord = chart.planets[seventhHouse.lord];
  const venus = chart.planets.Venus;
  const jupiter = chart.planets.Jupiter;

  if (seventhLord && RELATIONSHIP_HOUSES.has(seventhLord.house ?? 0)) {
    yogas.push({
      title: "7th Lord Supports Relationship Houses",
      score: 76,
      status: "Supportive",
      why: `${term("planets", seventhLord.name)} rules the 7th and sits in house ${seventhLord.house}, linking marriage with stable relationship or gain houses.`,
    });
  }
  if (venus.dignity.exalted || venus.dignity.own_sign || venus.dignity.moolatrikona) {
    yogas.push({
      title: "Strong Venus",
      score: 82,
      status: "Strong",
      why: `${term("planets", "Venus")} has strong dignity, supporting affection, attraction, and willingness to harmonize in marriage.`,
    });
  }
  if (jupiter.dignity.exalted || jupiter.dignity.own_sign || jupiter.house === 7 || jupiter.house === 5 || jupiter.house === 9) {
    yogas.push({
      title: "Jupiter Family Support",
      score: 76,
      status: "Supportive",
      why: `${term("planets", "Jupiter")} supports family life because its dignity or placement connects wisdom, protection, and dharma to relationship factors.`,
    });
  }
  if (d9?.houses["7"].occupants.some((planet) => BENEFICS.has(planet))) {
    yogas.push({
      title: "Benefic D9 7th House",
      score: 78,
      status: "Supportive",
      why: "D9 7th house receives benefic occupation, so the divisional chart confirms relational support beyond the natal chart.",
    });
  }
  if (darakaraka && [1, 5, 7, 9, 11].includes(darakaraka.house ?? 0)) {
    yogas.push({
      title: "Darakaraka in Supportive House",
      score: 72,
      status: "Supportive",
      why: `${term("planets", darakaraka.name)} as Darakaraka sits in house ${darakaraka.house}, making spouse karma more visible and workable.`,
    });
  }
  return yogas;
}

function detectAfflictions(
  chart: Chart,
  seventhLord: PlanetPosition | undefined,
  venus: PlanetPosition,
  darakaraka: PlanetPosition | null,
  term: (layer: string, canonical: string) => string,
) {
  const afflictions: EvaluatedItem[] = [];
  const seventhHouse = chart.houses["7"];
  const maleficOccupants = seventhHouse.occupants.filter((planet) => MALEFICS.has(planet));
  if (maleficOccupants.length) {
    afflictions.push({
      title: "Malefic Pressure on 7th House",
      score: 38,
      status: "Challenging",
      why: `${maleficOccupants.map((planet) => term("planets", planet)).join(" / ")} occupy the 7th house, which can create intensity, delay, conflict, or karmic pressure in partnership.`,
    });
  }
  if (seventhLord && DIFFICULT_HOUSES.has(seventhLord.house ?? 0)) {
    afflictions.push({
      title: "7th Lord in Difficult House",
      score: 40,
      status: "Challenging",
      why: `${term("planets", seventhLord.name)} rules marriage but sits in house ${seventhLord.house}, so relationship results may require more adjustment, healing, or patience.`,
    });
  }
  if (venus.dignity.debilitated || DIFFICULT_HOUSES.has(venus.house ?? 0)) {
    afflictions.push({
      title: "Venus Under Strain",
      score: 42,
      status: "Challenging",
      why: `${term("planets", "Venus")} is strained by dignity or house placement, which can affect affection, mutual comfort, and ease of compromise.`,
    });
  }
  if (darakaraka && (darakaraka.dignity.debilitated || DIFFICULT_HOUSES.has(darakaraka.house ?? 0))) {
    afflictions.push({
      title: "Darakaraka Under Strain",
      score: 42,
      status: "Challenging",
      why: `${term("planets", darakaraka.name)} is Darakaraka and is strained by dignity or placement, so spouse karma may need conscious maturity.`,
    });
  }
  return afflictions;
}

function buildDashaInfluence(
  dasha: CurrentDashaResponse | null,
  chart: Chart,
  seventhLordName: string,
  darakaraka: PlanetPosition | null,
  aspectCounts: Map<string, number>,
  term: (layer: string, canonical: string) => string,
) {
  if (!dasha?.current_mahadasha) {
    return [
      {
        title: "Current Mahadasha",
        score: 45,
        status: "Pending",
        why: "Current mahadasha has not loaded yet, so timing influence is not strongly included in the marriage judgment.",
      },
    ];
  }

  return [dasha.current_mahadasha, dasha.current_antardasha].filter(Boolean).map((planetName, index) => {
    const planet = chart.planets[planetName as string];
    const score = planet ? scoreDashaPlanet(planet, planetName as string, seventhLordName, darakaraka, aspectCounts) : 45;
    return {
      title: index === 0 ? "Current Mahadasha" : "Current Antardasha",
      score,
      status: planetName as string,
      why: planet
        ? `${term("planets", planet.name)} is active and affects marriage timing because ${dashaPlanetReason(planet, planetName as string, seventhLordName, darakaraka)}`
        : `${planetName} is active, but that planet was not available in the chart payload.`,
    };
  });
}

function scoreDashaPlanet(
  planet: PlanetPosition,
  planetName: string,
  seventhLordName: string,
  darakaraka: PlanetPosition | null,
  aspectCounts: Map<string, number>,
) {
  let score = scoreRelationshipPlanet(planet, aspectCounts.get(planetName) ?? 0);
  if ([seventhLordName, "Venus", "Jupiter", darakaraka?.name].includes(planetName)) score += 12;
  if (planet.house && [2, 7, 11].includes(planet.house)) score += 8;
  if (planet.house && DIFFICULT_HOUSES.has(planet.house)) score -= 8;
  return clampScore(score);
}

function dashaTimingText(
  dasha: CurrentDashaResponse | null,
  chart: Chart,
  seventhLordName: string,
  darakaraka: PlanetPosition | null,
  term: (layer: string, canonical: string) => string,
) {
  if (!dasha?.current_mahadasha) {
    return "Current dasha has not loaded yet, so timing is treated as pending rather than favorable or unfavorable.";
  }
  const active = [dasha.current_mahadasha, dasha.current_antardasha].filter(Boolean) as string[];
  const reasons = active.map((planetName) => {
    const planet = chart.planets[planetName];
    return planet ? `${term("planets", planetName)}: ${dashaPlanetReason(planet, planetName, seventhLordName, darakaraka)}` : `${planetName}: not present in chart payload`;
  });
  return reasons.join(" ");
}

function dashaPlanetReason(
  planet: PlanetPosition,
  planetName: string,
  seventhLordName: string,
  darakaraka: PlanetPosition | null,
) {
  const reasons: string[] = [];
  if ([seventhLordName, "Venus", "Jupiter", darakaraka?.name].includes(planetName)) reasons.push("it is a direct marriage significator");
  if (planet.house && [2, 7, 11].includes(planet.house)) reasons.push(`it occupies house ${planet.house}, a marriage/timing support house`);
  if (planet.house && DIFFICULT_HOUSES.has(planet.house)) reasons.push(`it occupies house ${planet.house}, which can delay or complicate timing`);
  if (!reasons.length) reasons.push("it is not a direct marriage significator, so timing support is moderate");
  return `${reasons.join("; ")}.`;
}

function partnerCharacteristics(
  chart: Chart,
  seventhLord: PlanetPosition | undefined,
  darakaraka: PlanetPosition | null,
  upapada: ReturnType<typeof calculateUpapada>,
  term: (layer: string, canonical: string) => string,
) {
  const seventhHouse = chart.houses["7"];
  const characteristics = [
    `${term("signs", seventhHouse.sign_name)} on the 7th suggests a partner who may be ${SIGN_TRAITS[seventhHouse.sign_name] ?? "mixed in temperament"}.`,
    seventhLord
      ? `The 7th lord ${term("planets", seventhLord.name)} adds ${planetPartnerStyle(seventhLord.name)} qualities because it carries the spouse-house agenda.`
      : `The 7th lord ${term("planets", seventhHouse.lord)} is missing from the chart payload, so partner traits rely more on the 7th sign and D9.`,
    darakaraka
      ? `Darakaraka ${term("planets", darakaraka.name)} points to ${planetPartnerStyle(darakaraka.name)} spouse karma.`
      : "Darakaraka could not be calculated from available planets.",
    `Upapada Lagna in ${term("signs", upapada.signName)} adds a public marriage image that is ${SIGN_TRAITS[upapada.signName] ?? "mixed in expression"}.`,
  ];
  return characteristics;
}

function planetPartnerStyle(planet: string) {
  const styles: Record<string, string> = {
    Sun: "dignified, visible, principled, and leadership-oriented",
    Moon: "caring, receptive, emotionally responsive, and family-oriented",
    Mars: "assertive, energetic, protective, and direct",
    Mercury: "communicative, youthful, clever, and adaptable",
    Jupiter: "wise, supportive, ethical, and family-positive",
    Venus: "affectionate, artistic, refined, and harmony-seeking",
    Saturn: "mature, responsible, serious, and commitment-oriented",
    Rahu: "unconventional, ambitious, foreign, or highly worldly",
    Ketu: "private, spiritual, detached, or unusual",
  };
  return styles[planet] ?? "mixed";
}

function d9SummaryText(d9: Chart, seventhLordName: string, term: (layer: string, canonical: string) => string) {
  const d9Seventh = d9.houses["7"];
  const d9SeventhLord = d9.planets[d9Seventh.lord];
  const natalSeventhLordInD9 = d9.planets[seventhLordName];
  return `D9 7th house is ${term("signs", d9Seventh.sign_name)} ruled by ${term("planets", d9Seventh.lord)}. ${occupantText(d9Seventh, term)} ${d9SeventhLord ? `Its lord is in D9 house ${d9SeventhLord.house ?? "-"}, so ${placementMeaning(d9SeventhLord.house)}` : "The D9 7th lord is missing from the payload."} ${natalSeventhLordInD9 ? `Natal 7th lord ${term("planets", seventhLordName)} appears in D9 house ${natalSeventhLordInD9.house ?? "-"}, adding marriage-specific confirmation.` : ""}`;
}

function planetConditionText(planet: PlanetPosition, aspectCount: number) {
  const reasons: string[] = [];
  if (planet.dignity.exalted) reasons.push("it is exalted, giving high relational confidence");
  if (planet.dignity.own_sign) reasons.push("it is in own sign, giving stable self-expression");
  if (planet.dignity.moolatrikona) reasons.push("it is in moolatrikona, giving purposeful strength");
  if (planet.dignity.debilitated) reasons.push("it is debilitated, so relationship results need support from placement, aspects, D9, or dasha");
  if (!reasons.length) reasons.push("it has baseline dignity, meaning strength depends mainly on house placement, aspects, D9, and timing rather than sign dignity");
  if (planet.house && RELATIONSHIP_HOUSES.has(planet.house)) reasons.push(`house ${planet.house} supports relationship expression`);
  if (planet.house && DIFFICULT_HOUSES.has(planet.house)) reasons.push(`house ${planet.house} can delay, complicate, or internalize relationship results`);
  if (planet.retrograde) reasons.push("retrograde motion makes relationship results more reflective or revision-oriented");
  if (aspectCount > 0) reasons.push(`${aspectCount} aspect links connect it with other chart factors`);
  return `${reasons.join("; ")}.`;
}

function occupantText(house: Chart["houses"][string], term: (layer: string, canonical: string) => string) {
  if (!house.occupants.length) {
    return "No planets occupy it, so judgment depends more on the house lord, aspects, and divisional support than direct activation.";
  }
  return `${house.occupants.map((planet) => term("planets", planet)).join(" / ")} occupy it, directly activating the house themes.`;
}

function houseStrengthText(house: Chart["houses"][string]) {
  if (house.strength === null) {
    return "No separate house strength value is available, so the module uses occupants and lord condition.";
  }
  return `House strength contributes ${house.strength.toFixed(1)} to the score, so its raw house condition is explicitly counted.`;
}

function placementMeaning(house: number | null | undefined) {
  if (!house) return "without a house value, placement cannot add relationship confidence.";
  if (RELATIONSHIP_HOUSES.has(house)) return "this is relationship-supportive because it links partnership with family, romance, dharma, stability, or gains.";
  if (DIFFICULT_HOUSES.has(house)) return "this is challenging because it can indicate delay, conflict, separation themes, or the need for conscious adjustment.";
  return "this is moderate because it supports marriage indirectly rather than through a primary relationship house.";
}

function upapadaMeaning(house: number) {
  if ([1, 4, 5, 7, 9, 11].includes(house)) return "public marriage image and family continuity are supported.";
  if ([6, 8, 12].includes(house)) return "marriage image may involve adjustment, privacy, distance, or karmic complexity.";
  return "marriage image is moderate and depends more on its lord and D9 support.";
}

function scoreLabel(score: number) {
  if (score >= 75) return "Strong";
  if (score >= 60) return "Promising";
  if (score >= 45) return "Developing";
  return "Challenged";
}

function toneForScore(score: number): Tone {
  if (score >= 75) return "good";
  if (score >= 60) return "info";
  if (score >= 45) return "warn";
  return "danger";
}

function clampScore(score: number) {
  return Math.round(Math.max(0, Math.min(100, score)));
}
