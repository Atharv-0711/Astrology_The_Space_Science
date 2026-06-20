import type { AnnualSummary } from "@/lib/types";

const AREAS: Array<[keyof AnnualSummary, string]> = [
  ["career_score", "Career"],
  ["wealth_score", "Wealth"],
  ["marriage_score", "Marriage"],
  ["health_score", "Health"],
  ["education_score", "Education"],
  ["travel_score", "Travel"],
  ["spiritual_score", "Spiritual"],
];

export function LifeAreasDashboard({ summary }: { summary: AnnualSummary }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {AREAS.map(([key, label]) => (
        <ScoreRow key={key} label={label} value={summary[key]} />
      ))}
    </div>
  );
}

function ScoreRow({ label, value }: { label: string; value: number }) {
  const score = Math.max(0, Math.min(100, value));
  return (
    <div className="rounded-2xl bg-black/20 p-4">
      <div className="mb-3 flex items-center justify-between text-sm">
        <span className="font-medium text-slate-200">{label}</span>
        <span className="font-semibold text-amber-100">{score.toFixed(0)}/100</span>
      </div>
      <svg viewBox="0 0 100 10" role="img" aria-label={`${label} ${score.toFixed(0)}`}>
        <rect x="0" y="0" width="100" height="10" rx="5" className="fill-white/10" />
        <rect x="0" y="0" width={score} height="10" rx="5" className="fill-amber-300" />
      </svg>
    </div>
  );
}
