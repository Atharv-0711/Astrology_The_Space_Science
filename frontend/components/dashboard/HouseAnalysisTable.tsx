import type { Chart } from "@/lib/types";

import { StatusBadge } from "./StatusBadge";
import { planetScore } from "./helpers";

type HouseAnalysis = {
  number: number;
  sign: string;
  lord: string;
  lordPlacement: string;
  lordStrength: number;
  occupants: string[];
  beneficInfluences: string[];
  maleficInfluences: string[];
  planetCount: number;
  aspectCount: number;
  yogaInfluences: string[];
  score: number;
  rating: "Very Strong" | "Strong" | "Average" | "Weak" | "Very Weak";
  explanation: string;
};

const BENEFICS = new Set(["Jupiter", "Venus", "Mercury", "Moon"]);
const MALEFICS = new Set(["Saturn", "Mars", "Rahu", "Ketu", "Sun"]);
const SUPPORTIVE_LORD_HOUSES = new Set([1, 2, 4, 5, 7, 9, 10, 11]);
const DIFFICULT_LORD_HOUSES = new Set([6, 8, 12]);

export function HouseAnalysisTable({
  chart,
  term,
}: {
  chart: Chart;
  term: (layer: string, canonical: string) => string;
}) {
  const houses = Object.values(chart.houses)
    .sort((first, second) => first.number - second.number)
    .map((house) => analyzeHouse(chart, String(house.number)));

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1080px] text-left text-sm">
          <thead className="bg-black/20 text-slate-400">
            <tr>
              <th className="px-4 py-3">House</th>
              <th className="px-4 py-3">Sign</th>
              <th className="px-4 py-3">Lord</th>
              <th className="px-4 py-3">Occupants</th>
              <th className="px-4 py-3">Benefic Influence</th>
              <th className="px-4 py-3">Malefic Influence</th>
              <th className="px-4 py-3">House Score</th>
              <th className="px-4 py-3">Rating</th>
            </tr>
          </thead>
          <tbody>
            {houses.map((house) => (
              <tr key={house.number} className="border-t border-white/10 text-slate-200 align-top">
                <td className="px-4 py-3 font-semibold text-white">{house.number}</td>
                <td className="px-4 py-3">{term("signs", house.sign)}</td>
                <td className="px-4 py-3">
                  <div className="font-medium text-white">{term("planets", house.lord)}</div>
                  <div className="mt-1 text-xs text-slate-400">
                    {house.lordPlacement}; lord strength {house.lordStrength}/100
                  </div>
                </td>
                <td className="px-4 py-3">
                  {house.occupants.length
                    ? house.occupants.map((planet) => term("planets", planet)).join(" / ")
                    : "-"}
                  <div className="mt-1 text-xs text-slate-500">Planets: {house.planetCount}</div>
                </td>
                <td className="px-4 py-3">{formatInfluences(house.beneficInfluences, term)}</td>
                <td className="px-4 py-3">{formatInfluences(house.maleficInfluences, term)}</td>
                <td className="px-4 py-3">
                  <StatusBadge tone={toneForScore(house.score)}>{house.score}/100</StatusBadge>
                  <div className="mt-1 text-xs text-slate-500">Aspects: {house.aspectCount}</div>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge tone={toneForScore(house.score)}>{house.rating}</StatusBadge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {houses.map((house) => (
          <details key={`explanation-${house.number}`} className="rounded-2xl bg-black/20 p-4">
            <summary className="cursor-pointer list-none">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="font-semibold text-white">House {house.number} Score Explanation</p>
                <StatusBadge tone={toneForScore(house.score)}>{house.rating}</StatusBadge>
              </div>
              <p className="mt-2 text-sm text-slate-400">{house.explanation}</p>
            </summary>
            <div className="mt-3 grid gap-2 text-sm text-slate-300">
              <Detail label="House Lord Placement" value={house.lordPlacement} />
              <Detail label="House Lord Strength" value={`${house.lordStrength}/100`} />
              <Detail label="Benefic Influences" value={formatInfluences(house.beneficInfluences, term)} />
              <Detail label="Malefic Influences" value={formatInfluences(house.maleficInfluences, term)} />
              <Detail label="Yoga Influences" value={house.yogaInfluences.length ? house.yogaInfluences.join(" / ") : "No direct yoga-style house activation detected."} />
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}

function analyzeHouse(chart: Chart, houseKey: string): HouseAnalysis {
  const house = chart.houses[houseKey];
  const lord = chart.planets[house.lord];
  const aspectsToHouse = chart.aspects.filter((aspect) => aspect.target_house === house.number);
  const beneficOccupants = house.occupants.filter((planet) => BENEFICS.has(planet));
  const maleficOccupants = house.occupants.filter((planet) => MALEFICS.has(planet));
  const beneficAspects = aspectsToHouse.filter((aspect) => BENEFICS.has(aspect.source));
  const maleficAspects = aspectsToHouse.filter((aspect) => MALEFICS.has(aspect.source));
  const beneficInfluences = [...beneficOccupants, ...beneficAspects.map((aspect) => aspect.source)];
  const maleficInfluences = [...maleficOccupants, ...maleficAspects.map((aspect) => aspect.source)];
  const lordStrength = lord ? planetScore(lord, aspectCountForPlanet(chart, house.lord)) : 40;
  const yogaInfluences = yogaInfluencesForHouse(chart, house.number);

  let score = 45;
  score += (lordStrength - 50) * 0.45;
  if (lord?.dignity.exalted) score += 14;
  if (lord?.dignity.own_sign) score += 10;
  if (lord?.dignity.moolatrikona) score += 9;
  if (lord?.dignity.debilitated) score -= 16;
  if (lord?.house && SUPPORTIVE_LORD_HOUSES.has(lord.house)) score += 8;
  if (lord?.house && DIFFICULT_LORD_HOUSES.has(lord.house)) score -= 10;
  score += Math.min(12, house.occupants.length * 4);
  score += Math.min(16, beneficInfluences.length * 6);
  score -= Math.min(18, maleficInfluences.length * 6);
  score += Math.min(10, yogaInfluences.length * 5);

  const houseScore = clampScore(score);
  const rating = ratingForScore(houseScore);
  return {
    number: house.number,
    sign: house.sign_name,
    lord: house.lord,
    lordPlacement: lord ? `${house.lord} in house ${lord.house ?? "-"} (${lord.zodiac.sign_name})` : `${house.lord} placement unavailable`,
    lordStrength,
    occupants: house.occupants,
    beneficInfluences: unique(beneficInfluences),
    maleficInfluences: unique(maleficInfluences),
    planetCount: house.occupants.length,
    aspectCount: aspectsToHouse.length,
    yogaInfluences,
    score: houseScore,
    rating,
    explanation: buildExplanation({
      houseNumber: house.number,
      lordName: house.lord,
      lord,
      lordStrength,
      beneficInfluences: unique(beneficInfluences),
      maleficInfluences: unique(maleficInfluences),
      occupantCount: house.occupants.length,
      aspectCount: aspectsToHouse.length,
      yogaInfluences,
      score: houseScore,
      rating,
    }),
  };
}

function buildExplanation({
  houseNumber,
  lordName,
  lord,
  lordStrength,
  beneficInfluences,
  maleficInfluences,
  occupantCount,
  aspectCount,
  yogaInfluences,
  score,
  rating,
}: {
  houseNumber: number;
  lordName: string;
  lord: Chart["planets"][string] | undefined;
  lordStrength: number;
  beneficInfluences: string[];
  maleficInfluences: string[];
  occupantCount: number;
  aspectCount: number;
  yogaInfluences: string[];
  score: number;
  rating: HouseAnalysis["rating"];
}) {
  const reasons: string[] = [
    `House ${houseNumber} is rated ${rating} with a score of ${score}/100.`,
    `${lordName} as house lord contributes ${lordStrength}/100.`,
  ];
  if (lord?.dignity.exalted) reasons.push("The lord is exalted, which strongly improves house delivery.");
  if (lord?.dignity.own_sign) reasons.push("The lord is in own sign, stabilizing the house.");
  if (lord?.dignity.moolatrikona) reasons.push("The lord is in moolatrikona, adding purposeful strength.");
  if (lord?.dignity.debilitated) reasons.push("The lord is debilitated, reducing reliability unless supported elsewhere.");
  if (lord?.house && SUPPORTIVE_LORD_HOUSES.has(lord.house)) reasons.push(`The lord sits in house ${lord.house}, a supportive placement for manifestation.`);
  if (lord?.house && DIFFICULT_LORD_HOUSES.has(lord.house)) reasons.push(`The lord sits in house ${lord.house}, which can delay or complicate results.`);
  reasons.push(`${occupantCount} occupant(s) and ${aspectCount} aspect(s) directly activate the house.`);
  if (beneficInfluences.length) reasons.push(`Benefic influence from ${beneficInfluences.join(", ")} improves the score.`);
  if (maleficInfluences.length) reasons.push(`Malefic influence from ${maleficInfluences.join(", ")} pressures the score.`);
  if (yogaInfluences.length) reasons.push(`Yoga-style activation from ${yogaInfluences.join(", ")} adds support.`);
  return reasons.join(" ");
}

function yogaInfluencesForHouse(chart: Chart, houseNumber: number) {
  const influences: string[] = [];
  const house = chart.houses[String(houseNumber)];
  const lord = chart.planets[house.lord];
  if (lord && [1, 4, 7, 10].includes(houseNumber) && [1, 5, 9].includes(lord.house ?? 0)) {
    influences.push("Kendra-trikona lord support");
  }
  if ([2, 5, 9, 11].includes(houseNumber) && house.occupants.some((planet) => BENEFICS.has(planet))) {
    influences.push("Dhana-supporting benefic activation");
  }
  if ([6, 8, 12].includes(houseNumber) && lord?.house && [6, 8, 12].includes(lord.house)) {
    influences.push("Vipareeta-style dusthana lord activation");
  }
  return influences;
}

function aspectCountForPlanet(chart: Chart, planetName: string) {
  return chart.aspects.filter((aspect) => aspect.source === planetName || aspect.target === planetName).length;
}

function formatInfluences(influences: string[], term: (layer: string, canonical: string) => string) {
  if (!influences.length) return "-";
  return influences.map((planet) => term("planets", planet)).join(" / ");
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/[0.04] px-3 py-2">
      <span className="text-slate-500">{label}: </span>
      <span>{value}</span>
    </div>
  );
}

function ratingForScore(score: number): HouseAnalysis["rating"] {
  if (score >= 85) return "Very Strong";
  if (score >= 70) return "Strong";
  if (score >= 50) return "Average";
  if (score >= 35) return "Weak";
  return "Very Weak";
}

function toneForScore(score: number) {
  if (score >= 70) return "good";
  if (score >= 50) return "info";
  if (score >= 35) return "warn";
  return "danger";
}

function clampScore(score: number) {
  return Math.round(Math.max(0, Math.min(100, score)));
}

function unique(values: string[]) {
  return Array.from(new Set(values));
}
