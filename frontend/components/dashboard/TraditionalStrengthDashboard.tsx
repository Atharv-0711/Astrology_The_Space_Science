"use client";

import { useTraditionalStrength } from "@/hooks/useChart";
import type { ChartRequest, TraditionalPlanetStrength } from "@/lib/types";

import { StatusBadge } from "./StatusBadge";
import { formatMaybeNumber } from "./helpers";

export function TraditionalStrengthDashboard({
  request,
  enabled,
  term,
}: {
  request: ChartRequest;
  enabled: boolean;
  term: (layer: string, canonical: string) => string;
}) {
  const traditionalStrength = useTraditionalStrength(request, enabled);

  if (!enabled) {
    return (
      <div className="rounded-2xl border border-sky-200/20 bg-sky-200/10 p-5 text-sm text-slate-300">
        Open this section to calculate traditional Jyotish strength using D1, D9, D10, D60, Shadbala, Ashtakavarga, combustion, and planetary war.
      </div>
    );
  }

  if (traditionalStrength.isLoading) {
    return <p className="text-sm text-slate-400">Calculating traditional strength...</p>;
  }

  if (traditionalStrength.isError || !traditionalStrength.data) {
    return (
      <div className="rounded-2xl border border-red-400/30 bg-red-950/30 p-5 text-sm text-red-100">
        Traditional strength could not be calculated. Please check that the backend is running.
      </div>
    );
  }

  const rows = traditionalStrength.data.planets;

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-sky-200/20 bg-sky-200/10 p-4">
        <p className="font-semibold text-white">Traditional Jyotish Strength Engine</p>
        <p className="mt-2 text-sm text-slate-300">{traditionalStrength.data.scoring_note}</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/10">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1180px] text-left text-sm">
            <thead className="bg-black/20 text-slate-400">
              <tr>
                <th className="px-4 py-3">Planet</th>
                <th className="px-4 py-3">Dignity</th>
                <th className="px-4 py-3">Shadbala</th>
                <th className="px-4 py-3">Ashtakavarga</th>
                <th className="px-4 py-3">Varga Support</th>
                <th className="px-4 py-3">Aspect Quality</th>
                <th className="px-4 py-3">Combustion</th>
                <th className="px-4 py-3">Planetary War</th>
                <th className="px-4 py-3">Final Strength</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.planet} className="border-t border-white/10 text-slate-200 align-top">
                  <td className="px-4 py-3 font-semibold text-white">{term("planets", row.planet)}</td>
                  <td className="px-4 py-3">
                    <Score value={row.dignity_score.score} />
                    <div className="mt-1 text-xs text-slate-500">{row.sign_relationship}</div>
                  </td>
                  <td className="px-4 py-3"><Score value={row.shadbala_score.total} /></td>
                  <td className="px-4 py-3"><Score value={row.ashtakavarga_score.score} /></td>
                  <td className="px-4 py-3"><Score value={row.varga_support_score.score} /></td>
                  <td className="px-4 py-3"><Score value={row.aspect_quality_score.score} /></td>
                  <td className="px-4 py-3">
                    <StatusBadge tone={row.combustion_penalty > 0 ? "warn" : "good"}>{row.combustion_penalty > 0 ? "Combust" : "Clear"}</StatusBadge>
                    <div className="mt-1 text-xs text-slate-500">{row.combustion_status}</div>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge tone={row.planetary_war_penalty > 0 ? "warn" : "good"}>{row.planetary_war_penalty > 0 ? "Defeated" : "Clear"}</StatusBadge>
                    <div className="mt-1 text-xs text-slate-500">{row.planetary_war_status}</div>
                  </td>
                  <td className="px-4 py-3"><Score value={row.final_traditional_strength} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {rows.map((row) => (
          <PlanetEvidence key={`evidence-${row.planet}`} row={row} term={term} />
        ))}
      </div>
    </div>
  );
}

function Score({ value }: { value: number }) {
  return <StatusBadge tone={toneForScore(value)}>{formatMaybeNumber(value, 0)}/100</StatusBadge>;
}

function PlanetEvidence({
  row,
  term,
}: {
  row: TraditionalPlanetStrength;
  term: (layer: string, canonical: string) => string;
}) {
  return (
    <details className="rounded-2xl bg-black/20 p-4">
      <summary className="cursor-pointer list-none">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-semibold text-white">{term("planets", row.planet)} Evidence</p>
          <Score value={row.final_traditional_strength} />
        </div>
      </summary>
      <div className="mt-4 grid gap-3 text-sm text-slate-300">
        <EvidenceList title="Final Formula" items={row.evidence} />
        <EvidenceList title="Dignity Score" items={row.dignity_score.evidence} />
        <EvidenceList title="Shadbala Components" items={shadbalaEvidence(row)} />
        <EvidenceList title="Ashtakavarga Score" items={row.ashtakavarga_score.evidence} />
        <EvidenceList title="Varga Support Score" items={row.varga_support_score.evidence} />
        <EvidenceList title="Aspect Quality Score" items={row.aspect_quality_score.evidence} />
      </div>
    </details>
  );
}

function EvidenceList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-xl bg-white/[0.04] p-3">
      <p className="font-semibold text-white">{title}</p>
      <ul className="mt-2 space-y-1">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function shadbalaEvidence(row: TraditionalPlanetStrength) {
  const shadbala = row.shadbala_score;
  return [
    `Sthana Bala: ${formatMaybeNumber(shadbala.sthana_bala.score, 0)}/100 - ${shadbala.sthana_bala.evidence.join(" ")}`,
    `Dig Bala: ${formatMaybeNumber(shadbala.dig_bala.score, 0)}/100 - ${shadbala.dig_bala.evidence.join(" ")}`,
    `Kala Bala: ${formatMaybeNumber(shadbala.kala_bala.score, 0)}/100 - ${shadbala.kala_bala.evidence.join(" ")}`,
    `Chesta Bala: ${formatMaybeNumber(shadbala.chesta_bala.score, 0)}/100 - ${shadbala.chesta_bala.evidence.join(" ")}`,
    `Naisargika Bala: ${formatMaybeNumber(shadbala.naisargika_bala.score, 0)}/100 - ${shadbala.naisargika_bala.evidence.join(" ")}`,
    `Drik Bala: ${formatMaybeNumber(shadbala.drik_bala.score, 0)}/100 - ${shadbala.drik_bala.evidence.join(" ")}`,
  ];
}

function toneForScore(score: number) {
  if (score >= 75) return "good";
  if (score >= 55) return "info";
  if (score >= 35) return "warn";
  return "danger";
}
