import type { AnnualSummary } from "@/lib/types";
import { useI18n } from "@/lib/i18n";

const SCORE_LABELS: Array<[keyof AnnualSummary, string]> = [
  ["career_score", "career"],
  ["wealth_score", "wealth"],
  ["marriage_score", "marriage"],
  ["health_score", "health"],
  ["education_score", "education"],
  ["travel_score", "travel"],
  ["spiritual_score", "spiritual"],
];

export function AnnualScoreSvg({ summary }: { summary: AnnualSummary }) {
  const { t, term } = useI18n();

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
      <h2 className="text-lg font-semibold text-white">{t("ui.annualPredictionSummary")}</h2>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {SCORE_LABELS.map(([key, label]) => (
          <ScoreBar key={key} label={term("interpretationTerms", label)} scoreLabel={t("ui.score")} value={summary[key]} />
        ))}
      </div>
    </div>
  );
}

function ScoreBar({ label, scoreLabel, value }: { label: string; scoreLabel: string; value: number }) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="text-slate-300">{label}</span>
        <span className="font-semibold text-amber-100">{clamped.toFixed(0)}</span>
      </div>
      <svg viewBox="0 0 100 10" role="img" aria-label={`${label} ${scoreLabel} ${clamped.toFixed(0)}`}>
        <rect x="0" y="0" width="100" height="10" rx="5" className="fill-white/10" />
        <rect x="0" y="0" width={clamped} height="10" rx="5" className="fill-amber-300" />
      </svg>
    </div>
  );
}
