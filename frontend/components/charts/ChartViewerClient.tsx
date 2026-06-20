"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { NorthIndianChart } from "@/components/charts/NorthIndianChart";
import { KundaliDashboard } from "@/components/dashboard/KundaliDashboard";
import { loadStoredChartRequest } from "@/components/forms/BirthDetailsForm";
import { useChart, useChartSvgPayload, useSupportedCharts } from "@/hooks/useChart";
import { useI18n } from "@/lib/i18n";
import type {
  ChartRequest,
  ChartType,
  PlanetPosition,
  SupportedChart,
} from "@/lib/types";

const fallbackCharts: SupportedChart[] = [
  { code: "D1", division: 1, name: "Rasi" },
  { code: "D2", division: 2, name: "Hora" },
  { code: "D3", division: 3, name: "Drekkana" },
  { code: "D4", division: 4, name: "Chaturthamsa" },
  { code: "D5", division: 5, name: "Panchamsa" },
  { code: "D6", division: 6, name: "Shashtamsa" },
  { code: "D7", division: 7, name: "Saptamsa" },
  { code: "D8", division: 8, name: "Ashtamsa" },
  { code: "D9", division: 9, name: "Navamsa" },
  { code: "D10", division: 10, name: "Dashamsa" },
  { code: "D11", division: 11, name: "Rudramsa" },
  { code: "D12", division: 12, name: "Dwadasamsa" },
  { code: "D16", division: 16, name: "Shodasamsa" },
  { code: "D20", division: 20, name: "Vimsamsa" },
  { code: "D24", division: 24, name: "Siddhamsa" },
  { code: "D27", division: 27, name: "Bhamsa" },
  { code: "D30", division: 30, name: "Trimshamsa" },
  { code: "D40", division: 40, name: "Khavedamsa" },
  { code: "D45", division: 45, name: "Akshavedamsa" },
  { code: "D60", division: 60, name: "Shastiamsa" },
];

const KUNDALI_CHART_CODES = new Set([
  "D1",
  "D2",
  "D3",
  "D4",
  "D7",
  "D9",
  "D10",
  "D12",
  "D16",
  "D20",
  "D24",
  "D27",
  "D30",
  "D40",
  "D45",
  "D60",
]);

export function ChartViewerClient() {
  const { locale, t, term } = useI18n();
  const [request, setRequest] = useState<ChartRequest | null>(null);
  const [chartType, setChartType] = useState<ChartType>("D1");

  useEffect(() => {
    setRequest(loadStoredChartRequest());
  }, []);

  const chart = useChart(chartType, request);
  const svgPayload = useChartSvgPayload(chartType, request);
  const supportedCharts = useSupportedCharts();
  const charts = (supportedCharts.data?.charts.length ? supportedCharts.data.charts : fallbackCharts).filter(
    (chartOption) => KUNDALI_CHART_CODES.has(chartOption.code),
  );

  const activeChart = chart.data;
  const activePayload = svgPayload.data;
  const planetRows = useMemo(
    () => (activeChart ? Object.values(activeChart.planets) : []),
    [activeChart],
  );

  if (!request) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8">
        <h1 className="text-3xl font-bold text-white">{t("ui.noBirthDataTitle")}</h1>
        <p className="mt-3 text-slate-300">{t("ui.noBirthDataChartMessage")}</p>
        <Link
          href="/birth-details"
          className="mt-6 inline-flex rounded-full bg-amber-200 px-5 py-3 font-semibold text-slate-950"
        >
          {t("ui.enterBirthDetails")}
        </Link>
      </div>
    );
  }

  return (
    <section className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-amber-200/70">{t("ui.navKundali")}</p>
          <h1 className="mt-3 text-4xl font-bold text-white">{request.birth_data.name}</h1>
          <p className="mt-2 text-slate-300">
            {t("ui.dateTimeAt", {
              date: request.birth_data.birth_date,
              time: request.birth_data.birth_time,
            })}
          </p>
        </div>
        <div className="flex max-w-3xl flex-wrap gap-2 rounded-3xl border border-white/10 bg-black/20 p-2">
          {charts.map((chartOption) => (
            <button
              key={chartOption.code}
              type="button"
              title={term("chartNames", chartOption.name)}
              onClick={() => setChartType(chartOption.code)}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                chartType === chartOption.code
                  ? "bg-amber-200 text-slate-950"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              {chartOption.code}
            </button>
          ))}
        </div>
      </div>

      {chart.isError || svgPayload.isError ? (
        <ErrorPanel message={t("ui.chartLoadError")} />
      ) : null}

      {chart.isLoading || svgPayload.isLoading ? (
        <LoadingPanel label={t("ui.loadingChart", { chartType })} />
      ) : null}

      <BirthSummary request={request} />

      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-amber-200/70">Main {t("ui.navKundali")} Charts</p>
        <h2 className="mt-2 text-2xl font-bold text-white">{chartType} Chart</h2>
      </div>

      {activeChart && activePayload ? (
        <NorthIndianChart payload={activePayload} chart={activeChart} />
      ) : null}

      {activeChart ? (
        <div className="space-y-8">
          <PlanetTable planets={planetRows} t={t} term={term} />
          <KundaliDashboard
            request={request}
            chart={activeChart}
            charts={charts}
            activeChartType={chartType}
            onSelectChart={setChartType}
            localeCode={locale.code}
            kundaliLabel={t("ui.navKundali")}
            term={term}
          />
        </div>
      ) : null}
    </section>
  );
}

function BirthSummary({ request }: { request: ChartRequest }) {
  const birth = request.birth_data;
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
      <h2 className="text-lg font-semibold text-white">Birth Summary</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <SummaryItem label="Name" value={birth.name} />
        <SummaryItem label="DOB" value={birth.birth_date} />
        <SummaryItem label="TOB" value={birth.birth_time} />
        <SummaryItem label="Place" value={birth.place_of_birth} />
        <SummaryItem label="Latitude" value={birth.latitude.toFixed(4)} />
        <SummaryItem label="Longitude" value={birth.longitude.toFixed(4)} />
      </div>
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-black/20 p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-amber-200/70">{label}</p>
      <p className="mt-2 font-semibold text-white">{value}</p>
    </div>
  );
}

function PlanetTable({
  planets,
  t,
  term,
}: {
  planets: PlanetPosition[];
  t: (key: string) => string;
  term: (layer: string, canonical: string) => string;
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04]">
      <div className="border-b border-white/10 px-5 py-4">
        <h2 className="text-lg font-semibold text-white">{t("ui.planetPositions")}</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-black/20 text-slate-400">
            <tr>
              <th className="px-5 py-3">{term("chartLabels", "planet")}</th>
              <th className="px-5 py-3">{term("chartLabels", "sign")}</th>
              <th className="px-5 py-3">{term("chartLabels", "degree")}</th>
              <th className="px-5 py-3">{term("chartLabels", "house")}</th>
              <th className="px-5 py-3">{term("chartLabels", "nakshatra")}</th>
              <th className="px-5 py-3">{term("chartLabels", "pada")}</th>
              <th className="px-5 py-3">{term("chartLabels", "motion")}</th>
            </tr>
          </thead>
          <tbody>
            {planets.map((planet) => (
              <tr key={planet.name} className="border-t border-white/10 text-slate-200">
                <td className="px-5 py-3 font-medium text-white">{term("planets", planet.name)}</td>
                <td className="px-5 py-3">{term("signs", planet.zodiac.sign_name)}</td>
                <td className="px-5 py-3">{planet.zodiac.degree.toFixed(2)}</td>
                <td className="px-5 py-3">{planet.house ?? "-"}</td>
                <td className="px-5 py-3">{term("nakshatras", planet.zodiac.nakshatra)}</td>
                <td className="px-5 py-3">{planet.zodiac.pada}</td>
                <td className="px-5 py-3">
                  {planet.retrograde ? term("chartLabels", "retrograde") : term("chartLabels", "direct")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function LoadingPanel({ label }: { label: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-slate-300">
      {label}...
    </div>
  );
}

function ErrorPanel({ message }: { message: string }) {
  return (
    <div className="rounded-3xl border border-red-400/30 bg-red-950/30 p-5 text-red-100">
      {message}
    </div>
  );
}
