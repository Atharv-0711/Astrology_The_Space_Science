import type { StrengthAnalysis } from "@/lib/types";
import { useI18n } from "@/lib/i18n";

export function StrengthSummarySvg({ analysis }: { analysis: StrengthAnalysis }) {
  const { t, term } = useI18n();

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
      <h2 className="text-lg font-semibold text-white">{t("ui.varshphalStrength")}</h2>
      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <StrengthGauge label={t("ui.beneficInfluence")} value={analysis.benefic_influence_score} />
        <StrengthGauge label={t("ui.maleficInfluence")} value={analysis.malefic_influence_score} />
      </div>
      <div className="mt-5 grid gap-3 text-sm md:grid-cols-2">
        <SummaryItem label={t("ui.strongestPlanet")} value={term("planets", analysis.strongest_planet)} />
        <SummaryItem label={t("ui.weakestPlanet")} value={term("planets", analysis.weakest_planet)} />
        <SummaryItem label={t("ui.strongestHouse")} value={t("ui.houseNumber", { house: analysis.strongest_house })} />
        <SummaryItem label={t("ui.weakestHouse")} value={t("ui.houseNumber", { house: analysis.weakest_house })} />
      </div>
    </div>
  );
}

function StrengthGauge({ label, value }: { label: string; value: number }) {
  const clamped = Math.max(0, Math.min(100, value));
  const circumference = 2 * Math.PI * 36;
  const dash = (clamped / 100) * circumference;
  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 90 90" className="h-20 w-20" role="img" aria-label={`${label} ${clamped}`}>
        <circle cx="45" cy="45" r="36" className="fill-none stroke-white/10" strokeWidth="8" />
        <circle
          cx="45"
          cy="45"
          r="36"
          className="fill-none stroke-amber-300"
          strokeDasharray={`${dash} ${circumference}`}
          strokeLinecap="round"
          strokeWidth="8"
          transform="rotate(-90 45 45)"
        />
        <text x="45" y="49" textAnchor="middle" className="fill-white text-base font-bold">
          {clamped.toFixed(0)}
        </text>
      </svg>
      <span className="font-medium text-slate-200">{label}</span>
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-black/20 p-3">
      <p className="text-xs uppercase tracking-[0.2em] text-amber-200/70">{label}</p>
      <p className="mt-1 font-semibold text-white">{value}</p>
    </div>
  );
}
