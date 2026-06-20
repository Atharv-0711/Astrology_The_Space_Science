"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";

import { NorthIndianChart } from "@/components/charts/NorthIndianChart";
import { loadStoredChartRequest } from "@/components/forms/BirthDetailsForm";
import { AnnualHoroscopeBlock } from "@/components/varshphal/AnnualHoroscopeBlock";
import {
  useVarshphal,
  useVarshphalAnnualHoroscope,
  useVarshphalSvgPayload,
} from "@/hooks/useChart";
import { useI18n } from "@/lib/i18n";
import type {
  MuddaDashaPeriod,
  Saham,
  TajikaYoga,
  ChartRequest,
  VarshphalPrediction,
  VarshphalRequest,
} from "@/lib/types";

export function VarshphalPageClient() {
  const { locale, t, term } = useI18n();
  const [baseRequest, setBaseRequest] = useState<ChartRequest | null>(null);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    setBaseRequest(loadStoredChartRequest());
  }, []);

  const request = useMemo<VarshphalRequest | null>(() => {
    if (!baseRequest) {
      return null;
    }
    return { ...baseRequest, year };
  }, [baseRequest, year]);

  const report = useVarshphal(request);
  const annualHoroscope = useVarshphalAnnualHoroscope(request);
  const svgPayload = useVarshphalSvgPayload(request);

  if (!baseRequest) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8">
        <h1 className="text-3xl font-bold text-white">{t("ui.noBirthDataTitle")}</h1>
        <p className="mt-3 text-slate-300">{t("ui.noBirthDataVarshphalMessage")}</p>
        <Link
          href="/birth-details"
          className="mt-6 inline-flex rounded-full bg-amber-200 px-5 py-3 font-semibold text-slate-950"
        >
          {t("ui.enterBirthDetails")}
        </Link>
      </div>
    );
  }

  const data = report.data;

  return (
    <section className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-amber-200/70">
            {t("ui.varshphalEyebrow")}
          </p>
          <h1 className="mt-3 text-4xl font-bold text-white">{term("varshphalTerms", "varshphal")}</h1>
          <p className="mt-2 text-slate-300">
            {baseRequest.birth_data.name} · {baseRequest.birth_data.birth_date}
          </p>
        </div>
        <label className="rounded-3xl border border-white/10 bg-black/20 px-5 py-4 text-sm text-slate-300">
          {t("ui.targetYear")}
          <input
            type="number"
            min={1}
            max={9999}
            value={year}
            onChange={(event) => setYear(Number(event.target.value))}
            className="ml-3 w-28 rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-white"
          />
        </label>
      </div>

      {report.isError || svgPayload.isError || annualHoroscope.isError ? (
        <Panel tone="error">{t("ui.varshphalLoadError")}</Panel>
      ) : null}

      {report.isLoading || svgPayload.isLoading || annualHoroscope.isLoading ? (
        <Panel>{t("ui.calculatingSolarReturn")}</Panel>
      ) : null}

      {data ? (
        <div className="grid gap-4 md:grid-cols-4">
          <Metric
            label={t("ui.varshPravesh")}
            value={new Date(data.varsh_pravesh.local_datetime).toLocaleString(locale.code)}
          />
          <Metric label={t("ui.varshaLagna")} value={term("signs", data.chart.ascendant.zodiac.sign_name)} />
          <Metric
            label={term("varshphalTerms", "muntha")}
            value={`${term("signs", data.muntha.muntha_sign)}, ${term("chartLabels", "house")} ${data.muntha.muntha_house}`}
          />
          <Metric
            label={t("ui.muddaCurrent")}
            value={term("planets", data.mudda_dasha.current?.planet ?? data.mudda_dasha.start_lord)}
          />
        </div>
      ) : null}

      {annualHoroscope.data ? <AnnualHoroscopeBlock block={annualHoroscope.data} /> : null}

      {data && svgPayload.data ? (
        <NorthIndianChart payload={svgPayload.data} chart={data.chart} />
      ) : null}

      {data ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_24rem]">
          <div className="space-y-6">
            <MuddaTable periods={data.mudda_dasha.periods} localeCode={locale.code} t={t} term={term} />
            <PredictionGrid predictions={data.predictions} t={t} term={term} />
          </div>
          <aside className="space-y-6">
            <MunthaPanel
              house={data.muntha.muntha_house}
              sign={data.muntha.muntha_sign}
              lord={data.muntha.munthesh}
              years={data.muntha.completed_years}
              t={t}
              term={term}
            />
            <YogaPanel yogas={data.tajika_yogas.slice(0, 8)} t={t} term={term} />
            <SahamPanel sahams={data.sahams} t={t} term={term} />
          </aside>
        </div>
      ) : null}
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
      <p className="text-xs uppercase tracking-[0.2em] text-amber-200/70">{label}</p>
      <p className="mt-2 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}

function MuddaTable({
  periods,
  localeCode,
  t,
  term,
}: {
  periods: MuddaDashaPeriod[];
  localeCode: string;
  t: (key: string) => string;
  term: (layer: string, canonical: string) => string;
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04]">
      <div className="border-b border-white/10 px-5 py-4">
        <h2 className="text-lg font-semibold text-white">{t("ui.muddaDasha")}</h2>
      </div>
      <table className="w-full text-left text-sm">
        <thead className="bg-black/20 text-slate-400">
          <tr>
            <th className="px-5 py-3">{term("chartLabels", "planet")}</th>
            <th className="px-5 py-3">{t("ui.start")}</th>
            <th className="px-5 py-3">{t("ui.end")}</th>
          </tr>
        </thead>
        <tbody>
          {periods.map((period) => (
            <tr key={`${period.planet}-${period.start_date}`} className="border-t border-white/10 text-slate-200">
              <td className="px-5 py-3 font-medium text-white">{term("planets", period.planet)}</td>
              <td className="px-5 py-3">{formatDate(period.start_date, localeCode)}</td>
              <td className="px-5 py-3">{formatDate(period.end_date, localeCode)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PredictionGrid({
  predictions,
  t,
  term,
}: {
  predictions: VarshphalPrediction[];
  t: (key: string, values?: Record<string, string | number>) => string;
  term: (layer: string, canonical: string) => string;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {predictions.map((prediction) => (
        <div key={prediction.area} className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
          <h3 className="text-lg font-semibold text-white">{term("predictionAreas", prediction.area)}</h3>
          <p className="mt-2 text-sm text-slate-300">{formatPredictionSummary(prediction, t, term)}</p>
        </div>
      ))}
    </div>
  );
}

function MunthaPanel({
  house,
  sign,
  lord,
  years,
  t,
  term,
}: {
  house: number;
  sign: string;
  lord: string;
  years: number;
  t: (key: string, values?: Record<string, string | number>) => string;
  term: (layer: string, canonical: string) => string;
}) {
  return (
    <Panel>
      <h2 className="text-lg font-semibold text-white">{term("varshphalTerms", "muntha")}</h2>
      <p className="mt-3 text-sm text-slate-300">
        {t("ui.munthaText", {
          sign: term("signs", sign),
          house,
          lord: term("planets", lord),
          years,
        })}
      </p>
    </Panel>
  );
}

function YogaPanel({
  yogas,
  t,
  term,
}: {
  yogas: TajikaYoga[];
  t: (key: string, values?: Record<string, string | number>) => string;
  term: (layer: string, canonical: string) => string;
}) {
  return (
    <Panel>
      <h2 className="text-lg font-semibold text-white">{t("ui.tajikaYogas")}</h2>
      <div className="mt-4 space-y-3">
        {yogas.length ? (
          yogas.map((yoga) => (
            <div key={`${yoga.name}-${yoga.planets.join("-")}`} className="rounded-2xl bg-black/20 p-3">
              <p className="font-semibold text-white">
                {term("yogaNames", yoga.name)} · {yoga.strength.toFixed(0)}
              </p>
              <p className="mt-1 text-xs text-slate-400">{yoga.planets.map((planet) => term("planets", planet)).join(" / ")}</p>
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-400">{t("ui.noTajikaYogas")}</p>
        )}
      </div>
    </Panel>
  );
}

function SahamPanel({
  sahams,
  t,
  term,
}: {
  sahams: Saham[];
  t: (key: string, values?: Record<string, string | number>) => string;
  term: (layer: string, canonical: string) => string;
}) {
  return (
    <Panel>
      <h2 className="text-lg font-semibold text-white">{t("ui.sahams")}</h2>
      <div className="mt-4 space-y-2 text-sm">
        {sahams.map((saham) => (
          <div key={saham.name} className="flex justify-between gap-4 border-b border-white/10 pb-2 text-slate-300">
            <span>{term("sahamNames", saham.name)}</span>
            <span className="text-white">
              {term("signs", saham.sign)} {t("ui.houseAbbreviation", { house: saham.house })}
            </span>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function Panel({ children, tone = "default" }: { children: ReactNode; tone?: "default" | "error" }) {
  return (
    <div
      className={`rounded-3xl border p-5 ${
        tone === "error"
          ? "border-red-400/30 bg-red-950/30 text-red-100"
          : "border-white/10 bg-white/[0.04] text-slate-300"
      }`}
    >
      {children}
    </div>
  );
}

function formatDate(value: string, localeCode = "en") {
  return new Date(value).toLocaleDateString(localeCode);
}

function formatPredictionSummary(
  prediction: VarshphalPrediction,
  t: (key: string, values?: Record<string, string | number>) => string,
  term: (layer: string, canonical: string) => string,
) {
  const match = prediction.summary.match(
    /through house (?<houses>.*), Muntha house (?<munthaHouse>\d+), and the active Mudda lord (?<lord>[A-Za-z]+)\./,
  );

  if (!match?.groups) {
    return prediction.summary;
  }

  const baseSummary = t("ui.varshphalPredictionSummary", {
    area: term("predictionAreas", prediction.area),
    houses: match.groups.houses,
    munthaHouse: match.groups.munthaHouse,
    lord: term("planets", match.groups.lord),
  });

  if (prediction.summary.includes("Strong applying Tajika yogas support visible results.")) {
    return `${baseSummary} ${t("ui.strongTajikaSupport")}`;
  }

  return baseSummary;
}
