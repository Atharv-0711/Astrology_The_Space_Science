import type { DashaPeriod, DashaTimeline } from "@/lib/types";

import { StatusBadge } from "./StatusBadge";
import { dateRange } from "./helpers";

export function InteractiveVimshottariTimeline({
  timeline,
  localeCode,
  term,
}: {
  timeline: DashaTimeline;
  localeCode: string;
  term: (layer: string, canonical: string) => string;
}) {
  const totalDays = timeline.mahadashas.reduce((sum, period) => sum + period.duration_days, 0);
  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-3">
        <Metric label="Current Mahadasha" value={formatPlanet(timeline.current.current_mahadasha, term)} />
        <Metric label="Current Antardasha" value={formatPlanet(timeline.current.current_antardasha, term)} />
        <Metric label="Current Pratyantar" value={formatPlanet(timeline.current.current_pratyantar, term)} />
        <Metric label="Upcoming Dasha" value={timeline.next.next ? `${formatPlanet(timeline.next.next.planet, term)} ${term("dashaTerms", timeline.next.next.level)}` : "-"} />
        <Metric label="Moon Nakshatra" value={`${term("nakshatras", timeline.moon.nakshatra)} Pada ${timeline.moon.pada}`} />
        <Metric label="Birth Balance" value={`${term("planets", timeline.birth_balance.planet)} ${timeline.birth_balance.remaining_years.toFixed(2)}y`} />
      </div>
      <div className="flex overflow-hidden rounded-full bg-black/30">
        {timeline.mahadashas.map((period) => (
          <div
            key={`${period.planet}-${period.start_date}-bar`}
            className={period.status === "running" ? "h-4 bg-amber-300" : "h-4 bg-white/20"}
            style={{ width: `${Math.max(1, (period.duration_days / totalDays) * 100)}%` }}
            title={`${period.planet}: ${dateRange(period.start_date, period.end_date, localeCode)}`}
          />
        ))}
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        {timeline.mahadashas.map((period) => (
          <DashaNode key={`${period.planet}-${period.start_date}`} period={period} localeCode={localeCode} term={term} />
        ))}
      </div>
    </div>
  );
}

function DashaNode({
  period,
  localeCode,
  term,
}: {
  period: DashaPeriod;
  localeCode: string;
  term: (layer: string, canonical: string) => string;
}) {
  return (
    <details className="rounded-2xl bg-black/20 p-4" open={period.status === "running"}>
      <summary className="cursor-pointer list-none">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-semibold text-white">
              {term("planets", period.planet)} {term("dashaTerms", period.level)}
            </p>
            <p className="mt-1 text-sm text-slate-400">{dateRange(period.start_date, period.end_date, localeCode)}</p>
          </div>
          <StatusBadge tone={period.status === "running" ? "good" : period.status === "past" ? "default" : "info"}>
            {period.status}
          </StatusBadge>
        </div>
      </summary>
      {period.children.length ? (
        <div className="mt-4 space-y-2">
          {period.children.map((child) => (
            <div key={`${child.planet}-${child.start_date}`} className="rounded-xl bg-white/5 p-3 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-slate-200">
                  {term("planets", child.planet)} {term("dashaTerms", child.level)}
                </span>
                <StatusBadge tone={child.status === "running" ? "good" : "default"}>{child.status}</StatusBadge>
              </div>
              <p className="mt-1 text-xs text-slate-500">{dateRange(child.start_date, child.end_date, localeCode)}</p>
            </div>
          ))}
        </div>
      ) : null}
    </details>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-black/20 p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-amber-200/70">{label}</p>
      <p className="mt-2 font-semibold text-white">{value}</p>
    </div>
  );
}

function formatPlanet(planet: string | null, term: (layer: string, canonical: string) => string) {
  return planet ? term("planets", planet) : "-";
}
