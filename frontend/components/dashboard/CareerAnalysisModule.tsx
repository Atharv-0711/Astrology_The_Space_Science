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

type Potential = EvaluatedItem & {
  fields?: string[];
};

type CareerEvaluation = {
  score: number;
  strength: EvaluatedItem;
  themes: string[];
  suitableFields: string[];
  leadership: Potential;
  business: Potential;
  employment: Potential;
  recognition: Potential;
  strengths: string[];
  challenges: string[];
  indicators: EvaluatedItem[];
  dashaInfluence: EvaluatedItem[];
  d10Summary: EvaluatedItem;
};

const CHARA_KARAKA_PLANETS = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"];
const FIELD_BY_PLANET: Record<string, string[]> = {
  Sun: ["Leadership", "government", "administration", "executive roles"],
  Moon: ["Public-facing work", "hospitality", "care", "people operations"],
  Mars: ["Engineering", "defense", "operations", "technical execution"],
  Mercury: ["Commerce", "analytics", "communication", "technology"],
  Jupiter: ["Teaching", "advisory", "law", "finance", "strategy"],
  Venus: ["Design", "luxury", "arts", "media", "relationship management"],
  Saturn: ["Operations", "infrastructure", "compliance", "large organizations"],
  Rahu: ["Technology", "foreign markets", "innovation", "unconventional industries"],
  Ketu: ["Research", "spiritual work", "specialized analysis", "independent consulting"],
};
const CAREER_HOUSES = new Set([1, 2, 6, 10, 11]);
const SUPPORTIVE_HOUSES = new Set([1, 2, 5, 9, 10, 11]);
const DIFFICULT_HOUSES = new Set([8, 12]);

export function CareerAnalysisModule({
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
  const d10 = useChart("D10", request, enabled);
  const currentDasha = useCurrentDasha(request, undefined, enabled);
  const evaluation = useMemo(
    () => buildCareerEvaluation(chart, d10.data ?? null, currentDasha.data ?? null, term),
    [chart, d10.data, currentDasha.data, term],
  );

  return (
    <div className="space-y-5">
      <div className="grid gap-4 lg:grid-cols-[1fr_2fr]">
        <ScoreCard evaluation={evaluation} />
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <PotentialCard item={evaluation.leadership} />
          <PotentialCard item={evaluation.business} />
          <PotentialCard item={evaluation.employment} />
          <PotentialCard item={evaluation.recognition} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <NarrativeList title="Career Themes" items={evaluation.themes} />
        <NarrativeList title="Suitable Fields" items={evaluation.suitableFields} />
        <NarrativeList title="Strengths" items={evaluation.strengths} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <NarrativeList title="Challenges" items={evaluation.challenges} />
        <EvaluationSection title="Current Dasha Influence" items={evaluation.dashaInfluence} />
      </div>

      <EvaluationSection title="Career Indicators" items={evaluation.indicators} />

      <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-semibold text-white">D10 Summary</p>
            <p className="mt-1 text-sm text-slate-400">{evaluation.d10Summary.why}</p>
          </div>
          <StatusBadge tone={toneForScore(evaluation.d10Summary.score)}>
            {d10.isLoading ? "Loading D10" : `${evaluation.d10Summary.score}/100`}
          </StatusBadge>
        </div>
        {!enabled ? (
          <p className="mt-3 text-xs text-slate-500">Open this section to load D10 and current dasha calculations.</p>
        ) : null}
        {d10.isError || currentDasha.isError ? (
          <p className="mt-3 text-xs text-amber-100">
            Some live career factors could not be loaded, so the score is based on natal indicators only.
          </p>
        ) : null}
      </div>
    </div>
  );
}

function ScoreCard({ evaluation }: { evaluation: CareerEvaluation }) {
  return (
    <div className="rounded-2xl border border-amber-200/20 bg-amber-200/10 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-amber-100/70">Career Score</p>
          <p className="mt-2 text-4xl font-bold text-white">{evaluation.score}/100</p>
        </div>
        <StatusBadge tone={toneForScore(evaluation.score)}>{evaluation.strength.status}</StatusBadge>
      </div>
      <p className="mt-4 text-sm text-slate-300">{evaluation.strength.why}</p>
    </div>
  );
}

function PotentialCard({ item }: { item: Potential }) {
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

function buildCareerEvaluation(
  chart: Chart,
  d10: Chart | null,
  dasha: CurrentDashaResponse | null,
  term: (layer: string, canonical: string) => string,
): CareerEvaluation {
  const aspectCounts = aspectCountByPlanet(chart);
  const tenthHouse = chart.houses["10"];
  const tenthLord = chart.planets[tenthHouse.lord];
  const secondHouse = chart.houses["2"];
  const sixthHouse = chart.houses["6"];
  const eleventhHouse = chart.houses["11"];
  const amatyakaraka = getAmatyakaraka(chart);

  const tenthHouseScore = scoreHouse(tenthHouse, 10, chart);
  const tenthLordScore = tenthLord ? scoreCareerPlanet(tenthLord, aspectCounts.get(tenthLord.name) ?? 0) : 40;
  const tenthLordPlacementScore = tenthLord ? scoreHousePlacement(tenthLord.house) : 40;
  const d10Score = d10 ? scoreD10(d10, tenthHouse.lord) : 45;
  const amatyakarakaScore = amatyakaraka ? scoreCareerPlanet(amatyakaraka, aspectCounts.get(amatyakaraka.name) ?? 0) : 45;
  const saturnScore = scoreCareerPlanet(chart.planets.Saturn, aspectCounts.get("Saturn") ?? 0);
  const sunScore = scoreCareerPlanet(chart.planets.Sun, aspectCounts.get("Sun") ?? 0);
  const mercuryScore = scoreCareerPlanet(chart.planets.Mercury, aspectCounts.get("Mercury") ?? 0);
  const jupiterScore = scoreCareerPlanet(chart.planets.Jupiter, aspectCounts.get("Jupiter") ?? 0);
  const secondScore = scoreHouse(secondHouse, 2, chart);
  const sixthScore = scoreHouse(sixthHouse, 6, chart);
  const eleventhScore = scoreHouse(eleventhHouse, 11, chart);
  const dashaScore = scoreDasha(dasha, chart, aspectCounts);

  const score = clampScore(
    tenthHouseScore * 0.13 +
      tenthLordScore * 0.15 +
      tenthLordPlacementScore * 0.09 +
      d10Score * 0.13 +
      amatyakarakaScore * 0.08 +
      saturnScore * 0.08 +
      sunScore * 0.06 +
      mercuryScore * 0.06 +
      jupiterScore * 0.05 +
      secondScore * 0.05 +
      sixthScore * 0.04 +
      eleventhScore * 0.04 +
      dashaScore * 0.04,
  );

  const indicators: EvaluatedItem[] = [
    {
      title: "10th House",
      score: tenthHouseScore,
      status: scoreLabel(tenthHouseScore),
      why: `${term("signs", tenthHouse.sign_name)} on the 10th shows the public work style. ${occupantText(tenthHouse, term)} ${houseStrengthText(tenthHouse)}`,
    },
    {
      title: "10th Lord",
      score: tenthLordScore,
      status: scoreLabel(tenthLordScore),
      why: tenthLord
        ? `${term("planets", tenthLord.name)} rules the 10th and scores ${tenthLordScore}/100 because ${planetConditionText(tenthLord, aspectCounts.get(tenthLord.name) ?? 0)}`
        : `The 10th lord ${term("planets", tenthHouse.lord)} was not found in the chart payload, so this factor is weighted conservatively.`,
    },
    {
      title: "10th Lord Placement",
      score: tenthLordPlacementScore,
      status: scoreLabel(tenthLordPlacementScore),
      why: tenthLord
        ? `${term("planets", tenthLord.name)} is placed in house ${tenthLord.house ?? "-"}; ${placementMeaning(tenthLord.house)}`
        : "Placement cannot be evaluated because the 10th lord is missing from the chart payload.",
    },
    {
      title: "Amatyakaraka",
      score: amatyakarakaScore,
      status: scoreLabel(amatyakarakaScore),
      why: amatyakaraka
        ? `${term("planets", amatyakaraka.name)} is treated as Amatyakaraka because it has the second-highest degree among classical planets. ${planetConditionText(amatyakaraka, aspectCounts.get(amatyakaraka.name) ?? 0)}`
        : "Amatyakaraka could not be calculated from the available classical planets.",
    },
    planetIndicator("Saturn", chart.planets.Saturn, saturnScore, aspectCounts, term, "work discipline, service, endurance, and organizational responsibility"),
    planetIndicator("Sun", chart.planets.Sun, sunScore, aspectCounts, term, "authority, visibility, confidence, and leadership"),
    planetIndicator("Mercury", chart.planets.Mercury, mercuryScore, aspectCounts, term, "business, communication, analysis, and technical skill"),
    planetIndicator("Jupiter", chart.planets.Jupiter, jupiterScore, aspectCounts, term, "guidance, ethics, teaching, finance, and advisory ability"),
    houseIndicator("2nd House", secondHouse, secondScore, term, "income capacity, speech, family resources, and stored wealth"),
    houseIndicator("6th House", sixthHouse, sixthScore, term, "employment, competition, problem-solving, and daily service"),
    houseIndicator("11th House", eleventhHouse, eleventhScore, term, "gains, networks, promotions, and professional fulfillment"),
  ];

  const dashaInfluence = buildDashaInfluence(dasha, chart, aspectCounts, term);
  const potentials = buildPotentials(chart, d10, dasha, aspectCounts);
  const strengths = indicators
    .filter((item) => item.score >= 68)
    .slice(0, 5)
    .map((item) => `${item.title}: ${item.why}`);
  const challenges = indicators
    .filter((item) => item.score <= 48)
    .slice(0, 5)
    .map((item) => `${item.title}: ${item.why}`);

  return {
    score,
    strength: {
      title: "Career Strength",
      score,
      status: scoreLabel(score),
      why: `The score combines the 10th house and lord, D10 support, Amatyakaraka, Saturn/Sun/Mercury/Jupiter, income/service/gain houses, and current dasha. Stronger scores require both natal promise and active timing support.`,
    },
    themes: careerThemes(chart, tenthLord, amatyakaraka, term),
    suitableFields: suitableFields(chart, tenthLord, amatyakaraka),
    leadership: potentials.leadership,
    business: potentials.business,
    employment: potentials.employment,
    recognition: potentials.recognition,
    strengths: strengths.length ? strengths : ["Career promise is mixed rather than absent; no single factor crosses the strong threshold, so improvement depends on dasha activation and D10 support."],
    challenges: challenges.length ? challenges : ["No major weak career factor is below the challenge threshold; still verify timing through dasha and transits before making career decisions."],
    indicators,
    dashaInfluence,
    d10Summary: {
      title: "D10 Dashamsa",
      score: d10Score,
      status: scoreLabel(d10Score),
      why: d10 ? d10SummaryText(d10, tenthHouse.lord, term) : "D10 has not loaded yet, so the career score currently uses a conservative placeholder for divisional strength.",
    },
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

function houseIndicator(
  title: string,
  house: Chart["houses"][string],
  score: number,
  term: (layer: string, canonical: string) => string,
  role: string,
): EvaluatedItem {
  return {
    title,
    score,
    status: scoreLabel(score),
    why: `${title} governs ${role}. ${term("signs", house.sign_name)} is present here, ruled by ${term("planets", house.lord)}. ${occupantText(house, term)} ${houseStrengthText(house)}`,
  };
}

function scoreCareerPlanet(planet: PlanetPosition, aspectCount: number) {
  return planetScore(planet, aspectCount);
}

function scoreHouse(house: Chart["houses"][string], houseNumber: number, chart: Chart) {
  let score = 48;
  score += Math.min(18, house.occupants.length * 6);
  if (house.strength !== null) score += house.strength * 6;
  const lord = chart.planets[house.lord];
  if (lord?.dignity.exalted) score += 10;
  if (lord?.dignity.own_sign || lord?.dignity.moolatrikona) score += 8;
  if (lord?.dignity.debilitated) score -= 12;
  if ([10, 11, 2].includes(houseNumber) && house.occupants.length > 0) score += 4;
  if (houseNumber === 6 && house.occupants.includes("Saturn")) score += 8;
  return clampScore(score);
}

function scoreHousePlacement(house: number | null | undefined) {
  if (!house) return 40;
  if ([1, 2, 5, 9, 10, 11].includes(house)) return 78;
  if (house === 6) return 68;
  if ([3, 4, 7].includes(house)) return 58;
  if ([8, 12].includes(house)) return 38;
  return 52;
}

function scoreD10(d10: Chart, tenthLordName: string) {
  const d10Tenth = d10.houses["10"];
  const d10TenthLord = d10.planets[d10Tenth.lord];
  const natalTenthLordInD10 = d10.planets[tenthLordName];
  let score = scoreHouse(d10Tenth, 10, d10) * 0.45;
  score += (d10TenthLord ? planetScore(d10TenthLord, 0) : 45) * 0.3;
  score += (natalTenthLordInD10 ? scoreHousePlacement(natalTenthLordInD10.house) : 45) * 0.25;
  return clampScore(score);
}

function scoreDasha(dasha: CurrentDashaResponse | null, chart: Chart, aspectCounts: Map<string, number>) {
  if (!dasha?.current_mahadasha) return 45;
  const maha = chart.planets[dasha.current_mahadasha];
  const antar = dasha.current_antardasha ? chart.planets[dasha.current_antardasha] : null;
  const mahaScore = maha ? scoreCareerPlanet(maha, aspectCounts.get(maha.name) ?? 0) : 45;
  const antarScore = antar ? scoreCareerPlanet(antar, aspectCounts.get(antar.name) ?? 0) : mahaScore;
  return clampScore(mahaScore * 0.65 + antarScore * 0.35);
}

function buildDashaInfluence(
  dasha: CurrentDashaResponse | null,
  chart: Chart,
  aspectCounts: Map<string, number>,
  term: (layer: string, canonical: string) => string,
) {
  if (!dasha?.current_mahadasha) {
    return [
      {
        title: "Current Mahadasha",
        score: 45,
        status: "Pending",
        why: "Current mahadasha has not loaded yet, so timing influence is not included strongly in the career judgment.",
      },
    ];
  }

  const items: EvaluatedItem[] = [];
  const maha = chart.planets[dasha.current_mahadasha];
  items.push({
    title: "Current Mahadasha",
    score: maha ? scoreCareerPlanet(maha, aspectCounts.get(maha.name) ?? 0) : 45,
    status: dasha.current_mahadasha,
    why: maha
      ? `${term("planets", maha.name)} mahadasha activates career matters according to its condition: ${planetConditionText(maha, aspectCounts.get(maha.name) ?? 0)}`
      : `${dasha.current_mahadasha} mahadasha is active, but that planet was not available in the chart payload.`,
  });

  if (dasha.current_antardasha) {
    const antar = chart.planets[dasha.current_antardasha];
    items.push({
      title: "Current Antardasha",
      score: antar ? scoreCareerPlanet(antar, aspectCounts.get(antar.name) ?? 0) : 45,
      status: dasha.current_antardasha,
      why: antar
        ? `${term("planets", antar.name)} antardasha modifies the main career period because ${planetConditionText(antar, aspectCounts.get(antar.name) ?? 0)}`
        : `${dasha.current_antardasha} antardasha is active, but that planet was not available in the chart payload.`,
    });
  }

  return items;
}

function buildPotentials(
  chart: Chart,
  d10: Chart | null,
  dasha: CurrentDashaResponse | null,
  aspectCounts: Map<string, number>,
) {
  const sun = chart.planets.Sun;
  const saturn = chart.planets.Saturn;
  const mercury = chart.planets.Mercury;
  const jupiter = chart.planets.Jupiter;
  const tenthHouse = chart.houses["10"];
  const eleventhHouse = chart.houses["11"];
  const sixthHouse = chart.houses["6"];
  const secondHouse = chart.houses["2"];
  const d10Score = d10 ? scoreD10(d10, tenthHouse.lord) : 45;
  const dashaCareerScore = scoreDasha(dasha, chart, aspectCounts);

  const leadershipScore = clampScore(
    scoreCareerPlanet(sun, aspectCounts.get("Sun") ?? 0) * 0.4 +
      scoreHouse(tenthHouse, 10, chart) * 0.35 +
      d10Score * 0.25,
  );
  const businessScore = clampScore(
    scoreCareerPlanet(mercury, aspectCounts.get("Mercury") ?? 0) * 0.35 +
      scoreCareerPlanet(jupiter, aspectCounts.get("Jupiter") ?? 0) * 0.25 +
      scoreHouse(secondHouse, 2, chart) * 0.2 +
      scoreHouse(eleventhHouse, 11, chart) * 0.2,
  );
  const employmentScore = clampScore(
    scoreCareerPlanet(saturn, aspectCounts.get("Saturn") ?? 0) * 0.35 +
      scoreHouse(sixthHouse, 6, chart) * 0.35 +
      dashaCareerScore * 0.3,
  );
  const recognitionScore = clampScore(
    scoreCareerPlanet(sun, aspectCounts.get("Sun") ?? 0) * 0.3 +
      scoreCareerPlanet(jupiter, aspectCounts.get("Jupiter") ?? 0) * 0.25 +
      scoreHouse(tenthHouse, 10, chart) * 0.25 +
      scoreHouse(eleventhHouse, 11, chart) * 0.2,
  );

  return {
    leadership: {
      title: "Leadership Potential",
      score: leadershipScore,
      status: scoreLabel(leadershipScore),
      why: "Leadership is judged from Sun, 10th house visibility, and D10 confirmation because these show authority, status, and professional command.",
    },
    business: {
      title: "Business Potential",
      score: businessScore,
      status: scoreLabel(businessScore),
      why: "Business is judged from Mercury, Jupiter, the 2nd house of resources, and the 11th house of gains because enterprise needs trade skill, judgment, capital, and networks.",
    },
    employment: {
      title: "Employment Potential",
      score: employmentScore,
      status: scoreLabel(employmentScore),
      why: "Employment is judged from Saturn, the 6th house, and active dasha because service roles require discipline, daily work capacity, and favorable timing.",
    },
    recognition: {
      title: "Public Recognition Potential",
      score: recognitionScore,
      status: scoreLabel(recognitionScore),
      why: "Recognition is judged from Sun, Jupiter, the 10th house, and the 11th house because public status needs visibility, credibility, karma-sthana strength, and audience support.",
    },
  };
}

function careerThemes(
  chart: Chart,
  tenthLord: PlanetPosition | undefined,
  amatyakaraka: PlanetPosition | null,
  term: (layer: string, canonical: string) => string,
) {
  const tenthHouse = chart.houses["10"];
  const planets = [tenthHouse.lord, ...(tenthLord ? [tenthLord.name] : []), ...(amatyakaraka ? [amatyakaraka.name] : [])];
  const themes = new Set<string>();
  planets.forEach((planet) => FIELD_BY_PLANET[planet]?.slice(0, 3).forEach((field) => themes.add(field)));
  if (tenthHouse.occupants.length) {
    tenthHouse.occupants.forEach((planet) => FIELD_BY_PLANET[planet]?.slice(0, 2).forEach((field) => themes.add(field)));
  }
  themes.add(`${term("signs", tenthHouse.sign_name)} 10th house style: ${signCareerStyle(tenthHouse.sign_name)}`);
  return Array.from(themes).slice(0, 6);
}

function suitableFields(chart: Chart, tenthLord: PlanetPosition | undefined, amatyakaraka: PlanetPosition | null) {
  const fields = new Set<string>();
  [chart.houses["10"].lord, tenthLord?.name, amatyakaraka?.name, "Saturn", "Mercury", "Jupiter"].forEach((planet) => {
    if (!planet) return;
    FIELD_BY_PLANET[planet]?.forEach((field) => fields.add(field));
  });
  return Array.from(fields).slice(0, 8).map((field) => `${field}: supported by the planet mix tied to profession, skill, and career execution.`);
}

function getAmatyakaraka(chart: Chart) {
  const ranked = CHARA_KARAKA_PLANETS.map((name) => chart.planets[name])
    .filter(Boolean)
    .sort((first, second) => second.zodiac.degree - first.zodiac.degree);
  return ranked[1] ?? null;
}

function planetConditionText(planet: PlanetPosition, aspectCount: number) {
  const reasons: string[] = [];
  if (planet.dignity.exalted) reasons.push("it is exalted, giving high functional confidence");
  if (planet.dignity.own_sign) reasons.push("it is in own sign, giving stable self-expression");
  if (planet.dignity.moolatrikona) reasons.push("it is in moolatrikona, giving purposeful strength");
  if (planet.dignity.debilitated) reasons.push("it is debilitated, so its career promise needs support from placement, aspects, or dasha");
  if (!reasons.length) reasons.push("it has baseline dignity, meaning strength is decided mainly by house placement, aspects, and timing rather than sign dignity");
  if (planet.house && SUPPORTIVE_HOUSES.has(planet.house)) reasons.push(`house ${planet.house} supports career expression`);
  if (planet.house && planet.house === 6) reasons.push("house 6 supports employment, service, and competition");
  if (planet.house && DIFFICULT_HOUSES.has(planet.house)) reasons.push(`house ${planet.house} can delay or internalize results`);
  if (planet.retrograde) reasons.push("retrograde motion makes results more revision-oriented");
  if (aspectCount > 0) reasons.push(`${aspectCount} aspect links connect it with other chart factors`);
  return `${reasons.join("; ")}.`;
}

function occupantText(house: Chart["houses"][string], term: (layer: string, canonical: string) => string) {
  if (!house.occupants.length) {
    return "No planets occupy it, so judgment depends more on the house lord and aspects than direct activation.";
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
  if (!house) return "without a house value, placement cannot add career confidence.";
  if (CAREER_HOUSES.has(house)) return "this is career-supportive because it links profession with income, service, status, or gains.";
  if (SUPPORTIVE_HOUSES.has(house)) return "this is supportive because it places the career lord in a dharma or growth house.";
  if (DIFFICULT_HOUSES.has(house)) return "this is challenging because it can produce delay, hidden work, transformation, or foreign/isolated environments.";
  return "this is moderate because it supports career indirectly rather than through a primary work house.";
}

function d10SummaryText(d10: Chart, tenthLordName: string, term: (layer: string, canonical: string) => string) {
  const d10Tenth = d10.houses["10"];
  const d10TenthLord = d10.planets[d10Tenth.lord];
  const natalTenthLordInD10 = d10.planets[tenthLordName];
  return `D10 10th house is ${term("signs", d10Tenth.sign_name)} ruled by ${term("planets", d10Tenth.lord)}. ${occupantText(d10Tenth, term)} ${d10TenthLord ? `Its lord is in D10 house ${d10TenthLord.house ?? "-"}, so ${placementMeaning(d10TenthLord.house)}` : "The D10 10th lord is missing from the payload."} ${natalTenthLordInD10 ? `Natal 10th lord ${term("planets", tenthLordName)} appears in D10 house ${natalTenthLordInD10.house ?? "-"}, adding profession-specific confirmation.` : ""}`;
}

function signCareerStyle(sign: string) {
  const styles: Record<string, string> = {
    Aries: "initiative, technical action, and direct leadership",
    Taurus: "finance, stability, assets, food, beauty, or voice-based work",
    Gemini: "communication, trade, analysis, writing, and technology",
    Cancer: "care, public connection, land, hospitality, and protection",
    Leo: "authority, management, politics, performance, and visibility",
    Virgo: "analysis, service, health, operations, and precision work",
    Libra: "law, negotiation, design, partnership, and public dealing",
    Scorpio: "research, crisis work, investigation, healing, and transformation",
    Sagittarius: "teaching, law, travel, philosophy, and guidance",
    Capricorn: "administration, systems, hierarchy, and long-term execution",
    Aquarius: "networks, technology, reform, large groups, and innovation",
    Pisces: "creativity, spirituality, healing, counseling, and foreign links",
  };
  return styles[sign] ?? "mixed professional expression";
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
