"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { loadStoredChartRequest } from "@/components/forms/BirthDetailsForm";
import { useDasha } from "@/hooks/useChart";
import { useI18n } from "@/lib/i18n";
import type { ChartRequest, CurrentDashaResponse, DashaPeriod, DashaTimeline } from "@/lib/types";

const PLANET_COLORS: Record<string, string> = {
  Ketu: "bg-violet-300",
  Venus: "bg-pink-300",
  Sun: "bg-orange-300",
  Moon: "bg-slate-200",
  Mars: "bg-red-300",
  Rahu: "bg-indigo-300",
  Jupiter: "bg-yellow-300",
  Saturn: "bg-blue-300",
  Mercury: "bg-emerald-300",
};

export function DashaPageClient() {
  const { locale, t, term } = useI18n();
  const [request, setRequest] = useState<ChartRequest | null>(null);
  const [selectedMahadasha, setSelectedMahadasha] = useState<string | null>(null);
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const dasha = useDasha(request, today);

  useEffect(() => {
    setRequest(loadStoredChartRequest());
  }, []);

  useEffect(() => {
    if (!selectedMahadasha && dasha.data?.current.current_mahadasha) {
      setSelectedMahadasha(dasha.data.current.current_mahadasha);
    }
  }, [dasha.data, selectedMahadasha]);

  if (!request) {
    return (
      <EmptyState
        title={t("ui.noBirthDataTitle")}
        message={t("ui.noBirthDataDashaMessage")}
        actionLabel={t("ui.enterBirthDetails")}
      />
    );
  }

  if (dasha.isError) {
    return (
      <EmptyState
        title={t("ui.dashaLoadErrorTitle")}
        message={t("ui.backendErrorMessage")}
        actionLabel={t("ui.enterBirthDetails")}
      />
    );
  }

  return (
    <section className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-amber-200/70">{t("ui.vimshottariDasha")}</p>
          <h1 className="mt-3 text-4xl font-bold text-white">{request.birth_data.name}</h1>
          <p className="mt-2 text-slate-300">
            {t("ui.dashaDescription")}
          </p>
        </div>
        <Link
          href="/kundali"
          className="rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white hover:border-amber-200/60"
        >
          {t("ui.backToCharts")}
        </Link>
      </div>

      {dasha.isLoading ? (
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-slate-300">
          {t("ui.loadingVimshottari")}
        </div>
      ) : null}

      {dasha.data ? (
        <>
          <Overview timeline={dasha.data} t={t} term={term} />
          <CurrentPanel current={dasha.data.current} localeCode={locale.code} t={t} term={term} />
          <TimelinePanel
            timeline={dasha.data}
            selectedMahadasha={selectedMahadasha}
            onSelectMahadasha={setSelectedMahadasha}
            localeCode={locale.code}
            t={t}
            term={term}
          />
          <PeriodLists past={dasha.data.past} future={dasha.data.future} localeCode={locale.code} t={t} term={term} />
        </>
      ) : null}
    </section>
  );
}

function Overview({
  timeline,
  t,
  term,
}: {
  timeline: DashaTimeline;
  t: (key: string, values?: Record<string, string | number>) => string;
  term: (layer: string, canonical: string) => string;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <StatCard
        label={t("ui.moonNakshatra")}
        value={`${term("nakshatras", timeline.moon.nakshatra)} ${term("chartLabels", "pada")} ${timeline.moon.pada}`}
        detail={`${term("planets", timeline.moon.nakshatra_lord)} ${t("ui.ruled")}, ${t("ui.degreeValue", {
          degree: timeline.moon.longitude.toFixed(4),
        })}`}
      />
      <StatCard
        label={t("ui.birthBalance")}
        value={`${term("planets", timeline.birth_balance.planet)} ${timeline.birth_balance.remaining_years.toFixed(2)} ${t("ui.yearsShort")}`}
        detail={t("ui.dateRange", {
          start: formatDate(timeline.birth_balance.birth_date),
          end: formatDate(timeline.birth_balance.mahadasha_end_date),
        })}
      />
      <StatCard
        label={t("ui.cycle")}
        value={`${timeline.total_years} ${t("ui.years")}`}
        detail={`${timeline.zodiac}, ${timeline.ayanamsha}, ${timeline.nakshatra_system}`}
      />
    </div>
  );
}

function CurrentPanel({
  current,
  localeCode,
  t,
  term,
}: {
  current: CurrentDashaResponse;
  localeCode: string;
  t: (key: string) => string;
  term: (layer: string, canonical: string) => string;
}) {
  const periods: Array<[string, string | null]> = [
    ["mahadasha", current.current_mahadasha],
    ["antardasha", current.current_antardasha],
    ["pratyantar", current.current_pratyantar],
    ["sookshma", current.current_sookshma],
    ["prana", current.current_prana],
  ];

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
      <div className="flex flex-wrap justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">{t("ui.currentRunningDasha")}</h2>
          <p className="mt-2 text-sm text-slate-400">
            {current.start_date && current.end_date
              ? `${formatDate(current.start_date, localeCode)} - ${formatDate(current.end_date, localeCode)}`
              : t("ui.outsideRange")}
          </p>
        </div>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-5">
        {periods.map(([label, planet]) => (
          <div key={label} className="rounded-2xl bg-black/20 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-amber-200/70">{term("dashaTerms", label)}</p>
            <p className="mt-2 text-lg font-semibold text-white">{planet ? term("planets", planet) : "-"}</p>
          </div>
        ))}
      </div>
      {current.interpretations.length ? (
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {current.interpretations.map((item) => (
            <InterpretationCard key={`${item.planet ?? item.mahadasha}-${item.antardasha ?? "md"}`} item={item} term={term} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function TimelinePanel({
  timeline,
  selectedMahadasha,
  onSelectMahadasha,
  localeCode,
  t,
  term,
}: {
  timeline: DashaTimeline;
  selectedMahadasha: string | null;
  onSelectMahadasha: (planet: string) => void;
  localeCode: string;
  t: (key: string) => string;
  term: (layer: string, canonical: string) => string;
}) {
  const selected = timeline.mahadashas.find((period) => period.planet === selectedMahadasha) ?? timeline.mahadashas[0];
  const totalDays = timeline.mahadashas.reduce((sum, period) => sum + period.duration_days, 0);

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
      <h2 className="text-xl font-semibold text-white">{t("ui.timeline120")}</h2>
      <div className="mt-5 flex overflow-hidden rounded-full bg-black/30">
        {timeline.mahadashas.map((period) => (
          <button
            key={`${period.planet}-${period.start_date}`}
            type="button"
            onClick={() => onSelectMahadasha(period.planet)}
            className={`${PLANET_COLORS[period.planet] ?? "bg-slate-300"} h-5 min-w-[0.5rem]`}
            style={{ width: `${Math.max(1.5, (period.duration_days / totalDays) * 100)}%` }}
            title={`${term("planets", period.planet)}: ${formatDate(period.start_date, localeCode)} - ${formatDate(period.end_date, localeCode)}`}
          />
        ))}
      </div>
      <div className="mt-5 grid gap-4 lg:grid-cols-[18rem_1fr]">
        <div className="space-y-2">
          {timeline.mahadashas.map((period) => (
            <button
              key={`${period.planet}-${period.start_date}-row`}
              type="button"
              onClick={() => onSelectMahadasha(period.planet)}
              className={`w-full rounded-2xl px-4 py-3 text-left text-sm ${
                selected?.planet === period.planet
                  ? "bg-amber-200 text-slate-950"
                  : "bg-black/20 text-slate-200 hover:bg-white/10"
              }`}
            >
              <span className="font-semibold">{term("planets", period.planet)}</span>
              <span className="block text-xs opacity-75">
                {formatDate(period.start_date, localeCode)} - {formatDate(period.end_date, localeCode)}
              </span>
            </button>
          ))}
        </div>
        <div className="rounded-2xl bg-black/20 p-4">
          <h3 className="text-lg font-semibold text-white">
            {selected ? term("planets", selected.planet) : ""} {term("dashaTerms", "antardasha")}
          </h3>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {selected?.children.map((period) => (
              <PeriodRow key={`${period.planet}-${period.start_date}`} period={period} localeCode={localeCode} t={t} term={term} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function PeriodLists({
  past,
  future,
  localeCode,
  t,
  term,
}: {
  past: DashaPeriod[];
  future: DashaPeriod[];
  localeCode: string;
  t: (key: string) => string;
  term: (layer: string, canonical: string) => string;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <PeriodList title={t("ui.pastDashas")} periods={[...past].reverse()} localeCode={localeCode} t={t} term={term} />
      <PeriodList title={t("ui.upcomingDashas")} periods={future} localeCode={localeCode} t={t} term={term} />
    </div>
  );
}

function PeriodList({
  title,
  periods,
  localeCode,
  t,
  term,
}: {
  title: string;
  periods: DashaPeriod[];
  localeCode: string;
  t: (key: string) => string;
  term: (layer: string, canonical: string) => string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
      <h2 className="text-xl font-semibold text-white">{title}</h2>
      <div className="mt-4 space-y-3">
        {periods.slice(0, 12).map((period) => (
          <PeriodRow key={`${period.level}-${period.planet}-${period.start_date}`} period={period} localeCode={localeCode} t={t} term={term} />
        ))}
      </div>
    </div>
  );
}

function PeriodRow({
  period,
  localeCode,
  t,
  term,
}: {
  period: DashaPeriod;
  localeCode: string;
  t: (key: string) => string;
  term: (layer: string, canonical: string) => string;
}) {
  return (
    <div className="rounded-2xl bg-black/20 p-4 text-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="font-semibold text-white">
          {term("planets", period.planet)} {term("dashaTerms", period.level)}
        </p>
        <span className="rounded-full bg-white/10 px-2 py-1 text-xs text-slate-300">
          {(period.duration_days / 365.2425).toFixed(2)} {t("ui.yearsShort")}
        </span>
      </div>
      <p className="mt-1 text-slate-400">
        {formatDate(period.start_date, localeCode)} - {formatDate(period.end_date, localeCode)}
      </p>
    </div>
  );
}

function InterpretationCard({
  item,
  term,
}: {
  item: Record<string, string>;
  term: (layer: string, canonical: string) => string;
}) {
  return (
    <div className="rounded-2xl bg-black/20 p-4 text-sm text-slate-300">
      <p className="font-semibold text-white">
        {item.planet ? term("planets", item.planet) : `${item.mahadasha}-${item.antardasha}`}
      </p>
      {["career", "relationships", "wealth", "spiritual", "caution"].map((key) =>
        item[key] ? (
          <p key={key} className="mt-2">
            <span className="text-amber-100">{term("interpretationTerms", key)}:</span> {item[key]}
          </p>
        ) : null,
      )}
    </div>
  );
}

function StatCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
      <p className="text-xs uppercase tracking-[0.2em] text-amber-200/70">{label}</p>
      <p className="mt-2 text-xl font-semibold text-white">{value}</p>
      <p className="mt-1 text-sm text-slate-400">{detail}</p>
    </div>
  );
}

function EmptyState({ title, message, actionLabel }: { title: string; message: string; actionLabel: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8">
      <h1 className="text-3xl font-bold text-white">{title}</h1>
      <p className="mt-3 text-slate-300">{message}</p>
      <Link
        href="/birth-details"
        className="mt-6 inline-flex rounded-full bg-amber-200 px-5 py-3 font-semibold text-slate-950"
      >
        {actionLabel}
      </Link>
    </div>
  );
}

function formatDate(value: string, localeCode = "en") {
  return new Date(value).toLocaleDateString(localeCode);
}
