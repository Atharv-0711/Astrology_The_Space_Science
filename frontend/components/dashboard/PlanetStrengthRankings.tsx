import type { Chart } from "@/lib/types";

import { StatusBadge } from "./StatusBadge";
import { aspectCountByPlanet, dignityLabels, planetScore } from "./helpers";

export function PlanetStrengthRankings({
  chart,
  term,
}: {
  chart: Chart;
  term: (layer: string, canonical: string) => string;
}) {
  const aspectCounts = aspectCountByPlanet(chart);
  const rows = Object.values(chart.planets)
    .map((planet) => ({
      planet,
      score: planetScore(planet, aspectCounts.get(planet.name) ?? 0),
      aspectCount: aspectCounts.get(planet.name) ?? 0,
    }))
    .sort((first, second) => second.score - first.score);

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-amber-200/20 bg-amber-200/10 p-4">
        <p className="font-semibold text-white">Planet Power Index</p>
        <p className="mt-2 text-sm text-slate-300">
          Quick ranking from the existing lightweight formula: dignity, house placement, aspect count, and retrograde motion.
        </p>
      </div>
      {rows.map(({ planet, score, aspectCount }, index) => (
        <div key={planet.name} className="rounded-2xl bg-black/20 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-white">
                #{index + 1} {term("planets", planet.name)}
              </p>
              <p className="mt-1 text-sm text-slate-400">
                House {planet.house ?? "-"} · {aspectCount} aspects · {dignityLabels(planet).join(", ")}
              </p>
            </div>
            <StatusBadge tone={score >= 70 ? "good" : score <= 35 ? "danger" : "warn"}>
              {score.toFixed(0)}/100
            </StatusBadge>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-amber-300" style={{ width: `${score}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
