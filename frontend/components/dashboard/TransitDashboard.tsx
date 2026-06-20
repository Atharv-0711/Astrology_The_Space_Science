"use client";

import { useMemo } from "react";

import { useTransits } from "@/hooks/useChart";
import type { ChartRequest, TransitEntry } from "@/lib/types";

import { StatusBadge } from "./StatusBadge";

export function TransitDashboard({
  request,
  enabled,
  term,
}: {
  request: ChartRequest;
  enabled: boolean;
  term: (layer: string, canonical: string) => string;
}) {
  const transitRequest = useMemo(
    () => ({
      ...request,
      calculation_date: new Date().toISOString().slice(0, 10),
    }),
    [request],
  );
  const transits = useTransits(transitRequest, enabled);

  if (transits.isLoading) {
    return (
      <div className="rounded-2xl border border-sky-200/20 bg-sky-200/10 p-5 text-sm text-slate-300">
        Loading current transits...
      </div>
    );
  }

  if (transits.isError) {
    return (
      <div className="rounded-2xl border border-red-400/30 bg-red-950/30 p-5 text-sm text-red-100">
        Transit calculations could not be loaded. Please check that the backend is running.
      </div>
    );
  }

  if (!transits.data) {
    return (
      <div className="rounded-2xl border border-sky-200/20 bg-sky-200/10 p-5 text-sm text-slate-300">
        Open this section to load the current transit summary.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-sky-200/20 bg-sky-200/10 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-semibold text-white">Current Transit Summary</p>
          <p className="mt-2 text-sm text-slate-300">
            Slow-moving planet positions for {formatDate(transits.data.calculation_date)} against the natal chart.
          </p>
        </div>
        <StatusBadge tone="good">Live</StatusBadge>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {transits.data.entries.map((entry) => (
          <TransitCard key={entry.planet} entry={entry} term={term} />
        ))}
      </div>
    </div>
  );
}

function TransitCard({
  entry,
  term,
}: {
  entry: TransitEntry;
  term: (layer: string, canonical: string) => string;
}) {
  return (
    <div className="rounded-xl bg-black/20 p-4 text-sm text-slate-300">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-white">{term("planets", entry.planet)}</p>
          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-sky-100/70">
            {entry.motion}
          </p>
        </div>
        <span className="rounded-full bg-sky-200/15 px-2 py-1 text-xs font-semibold text-sky-100">
          House {entry.natal_house}
        </span>
      </div>
      <div className="mt-3 grid gap-2 text-xs">
        <TransitFact
          label="Transit"
          value={`${term("signs", entry.transit_sign)} ${entry.transit_degree.toFixed(2)}°`}
        />
        <TransitFact label="Natal Sign" value={term("signs", entry.natal_sign)} />
        <TransitFact label="Aspect" value={entry.relationship} />
      </div>
    </div>
  );
}

function TransitFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-white/[0.04] px-3 py-2">
      <span className="text-slate-400">{label}</span>
      <span className="text-right font-medium text-slate-100">{value}</span>
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
  }).format(new Date(`${value}T00:00:00`));
}
