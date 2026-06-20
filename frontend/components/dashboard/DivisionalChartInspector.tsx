import type { ChartType, SupportedChart } from "@/lib/types";

const FOCUS_CHARTS = ["D1", "D9", "D10", "D60"];

export function DivisionalChartInspector({
  charts,
  activeChartType,
  onSelectChart,
  term,
}: {
  charts: SupportedChart[];
  activeChartType: ChartType;
  onSelectChart: (chartType: ChartType) => void;
  term: (layer: string, canonical: string) => string;
}) {
  const focus = FOCUS_CHARTS.map((code) => charts.find((chart) => chart.code === code)).filter(
    (chart): chart is SupportedChart => Boolean(chart),
  );

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {focus.map((chart) => (
        <button
          key={chart.code}
          type="button"
          onClick={() => onSelectChart(chart.code)}
          className={`rounded-2xl border p-4 text-left transition ${
            activeChartType === chart.code
              ? "border-amber-200 bg-amber-200 text-slate-950"
              : "border-white/10 bg-black/20 text-slate-200 hover:border-amber-200/50"
          }`}
        >
          <p className="text-2xl font-bold">{chart.code}</p>
          <p className="mt-1 text-sm opacity-80">{term("chartNames", chart.name)}</p>
          <p className="mt-3 text-xs opacity-70">Division {chart.division}</p>
        </button>
      ))}
    </div>
  );
}
