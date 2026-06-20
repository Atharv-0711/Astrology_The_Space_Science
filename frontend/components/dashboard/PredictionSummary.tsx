import type { Chart } from "@/lib/types";

import { StatusBadge } from "./StatusBadge";
import { aspectCountByPlanet, planetScore } from "./helpers";

const AREAS = [
  { label: "Career", houses: [10, 6, 11], planets: ["Sun", "Saturn", "Mercury"] },
  { label: "Marriage", houses: [7, 2, 11], planets: ["Venus", "Jupiter"] },
  { label: "Finance", houses: [2, 11, 9], planets: ["Jupiter", "Venus", "Mercury"] },
  { label: "Health", houses: [1, 6, 8], planets: ["Sun", "Mars", "Saturn"] },
  { label: "Education", houses: [4, 5, 9], planets: ["Mercury", "Jupiter"] },
];

export function PredictionSummary({
  chart,
  term,
}: {
  chart: Chart;
  term: (layer: string, canonical: string) => string;
}) {
  const aspectCounts = aspectCountByPlanet(chart);
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {AREAS.map((area) => {
        const score = areaScore(chart, area.houses, area.planets, aspectCounts);
        return (
          <div key={area.label} className="rounded-2xl bg-black/20 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="font-semibold text-white">{area.label}</p>
              <StatusBadge tone={score >= 70 ? "good" : score <= 40 ? "warn" : "info"}>{score.toFixed(0)}/100</StatusBadge>
            </div>
            <p className="mt-2 text-sm text-slate-400">
              Key houses: {area.houses.join(", ")} · Planets: {area.planets.map((planet) => term("planets", planet)).join(" / ")}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function areaScore(
  chart: Chart,
  houses: number[],
  planets: string[],
  aspectCounts: Map<string, number>,
) {
  const houseScore =
    houses.reduce((sum, houseNumber) => {
      const house = chart.houses[String(houseNumber)];
      return sum + 45 + (house?.occupants.length ?? 0) * 8 + (house?.strength ?? 0) * 4;
    }, 0) / houses.length;
  const planetStrength =
    planets.reduce((sum, planetName) => {
      const planet = chart.planets[planetName];
      return sum + (planet ? planetScore(planet, aspectCounts.get(planetName) ?? 0) : 45);
    }, 0) / planets.length;
  return Math.max(0, Math.min(100, (houseScore + planetStrength) / 2));
}
