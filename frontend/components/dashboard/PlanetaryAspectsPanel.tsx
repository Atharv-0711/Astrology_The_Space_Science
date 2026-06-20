import type { Chart } from "@/lib/types";

import { formatMaybeNumber } from "./helpers";

type Aspect = Chart["aspects"][number];

const GROUPS: Array<{ title: string; sources: string[] }> = [
  { title: "Jupiter Aspects", sources: ["Jupiter"] },
  { title: "Saturn Aspects", sources: ["Saturn"] },
  { title: "Mars Aspects", sources: ["Mars"] },
  { title: "Rahu/Ketu Aspects", sources: ["Rahu", "Ketu"] },
];

export function PlanetaryAspectsPanel({
  chart,
  term,
}: {
  chart: Chart;
  term: (layer: string, canonical: string) => string;
}) {
  if (!chart.aspects.length) {
    return <p className="text-sm text-slate-400">No aspects are available for this chart configuration.</p>;
  }

  const groupedAspects = buildAspectGroups(chart.aspects);

  return (
    <div className="space-y-5">
      {groupedAspects.map((group) => (
        <section key={group.title} className="overflow-hidden rounded-2xl border border-white/10 bg-black/10">
          <div className="border-b border-white/10 px-4 py-3">
            <h3 className="font-semibold text-white">{group.title}</h3>
            <p className="mt-1 text-xs text-slate-400">{group.aspects.length} generated aspect rows</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] text-left text-sm">
              <thead className="bg-black/20 text-slate-400">
                <tr>
                  <th className="px-4 py-3">Source</th>
                  <th className="px-4 py-3">Target</th>
                  <th className="px-4 py-3">Aspect Name</th>
                  <th className="px-4 py-3">Aspect System</th>
                  <th className="px-4 py-3">Strength</th>
                  <th className="px-4 py-3">Source House</th>
                  <th className="px-4 py-3">Target House</th>
                </tr>
              </thead>
              <tbody>
                {group.aspects.map((aspect, index) => (
                  <AspectRow
                    key={`${aspect.source}-${aspect.target}-${aspect.aspect_type}-${aspect.aspect_system}-${index}`}
                    aspect={aspect}
                    term={term}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  );
}

function AspectRow({
  aspect,
  term,
}: {
  aspect: Aspect;
  term: (layer: string, canonical: string) => string;
}) {
  return (
    <tr className="border-t border-white/10 text-slate-200">
      <td className="px-4 py-3 font-medium text-white">{term("planets", aspect.source)}</td>
      <td className="px-4 py-3">{term("planets", aspect.target)}</td>
      <td className="px-4 py-3">
        <div className="font-medium text-slate-100">{aspect.aspect_type}</div>
        {aspect.aspect_system === "Western" ? (
          <div className="mt-1 text-xs text-slate-400">
            Angle {formatMaybeNumber(aspect.angle)}°, orb {formatMaybeNumber(aspect.orb)}°
          </div>
        ) : null}
        {aspect.reason ? <div className="mt-1 max-w-md text-xs text-slate-400">{aspect.reason}</div> : null}
      </td>
      <td className="px-4 py-3">{aspect.aspect_system}</td>
      <td className="px-4 py-3">{aspect.strength === null ? "-" : `${formatMaybeNumber(aspect.strength, 0)}%`}</td>
      <td className="px-4 py-3">{aspect.source_house ?? "-"}</td>
      <td className="px-4 py-3">{aspect.target_house ?? "-"}</td>
    </tr>
  );
}

function buildAspectGroups(aspects: Aspect[]) {
  const grouped = GROUPS.map((group) => ({
    title: group.title,
    aspects: aspects.filter((aspect) => group.sources.includes(aspect.source)),
  })).filter((group) => group.aspects.length > 0);

  const groupedSources = new Set(GROUPS.flatMap((group) => group.sources));
  const otherAspects = aspects.filter((aspect) => !groupedSources.has(aspect.source));
  if (otherAspects.length) {
    grouped.push({ title: "Other Aspects", aspects: otherAspects });
  }

  return grouped;
}
