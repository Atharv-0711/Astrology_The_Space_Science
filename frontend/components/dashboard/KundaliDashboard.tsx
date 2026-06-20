"use client";

import { useState } from "react";

import { useDasha } from "@/hooks/useChart";
import type { Chart, ChartRequest, ChartType, SupportedChart } from "@/lib/types";

import { CareerAnalysisModule } from "./CareerAnalysisModule";
import { DashboardSection } from "./DashboardSection";
import { DivisionalChartInspector } from "./DivisionalChartInspector";
import { HouseAnalysisTable } from "./HouseAnalysisTable";
import { InteractiveVimshottariTimeline } from "./InteractiveVimshottariTimeline";
import { MarriageAnalysisModule } from "./MarriageAnalysisModule";
import { PanchangaCard } from "./PanchangaCard";
import { PlanetStrengthRankings } from "./PlanetStrengthRankings";
import { PlanetaryAspectsPanel } from "./PlanetaryAspectsPanel";
import { PredictionSummary } from "./PredictionSummary";
import { TraditionalStrengthDashboard } from "./TraditionalStrengthDashboard";
import { TransitDashboard } from "./TransitDashboard";
import { YogaDashboard } from "./YogaDashboard";

type SectionId =
  | "panchanga"
  | "houses"
  | "yoga"
  | "strength"
  | "traditionalStrength"
  | "timeline"
  | "marriage"
  | "career"
  | "divisional"
  | "aspects"
  | "transit"
  | "prediction";

const DEFAULT_OPEN: SectionId[] = ["houses", "strength", "aspects"];

export function KundaliDashboard({
  request,
  chart,
  charts,
  activeChartType,
  onSelectChart,
  localeCode,
  kundaliLabel,
  term,
}: {
  request: ChartRequest;
  chart: Chart;
  charts: SupportedChart[];
  activeChartType: ChartType;
  onSelectChart: (chartType: ChartType) => void;
  localeCode: string;
  kundaliLabel: string;
  term: (layer: string, canonical: string) => string;
}) {
  const [openSections, setOpenSections] = useState<Set<SectionId>>(() => new Set(DEFAULT_OPEN));
  const needsDasha = openSections.has("timeline");
  const needsMarriage = openSections.has("marriage");
  const needsCareer = openSections.has("career");
  const needsTraditionalStrength = openSections.has("traditionalStrength");
  const needsTransits = openSections.has("transit");
  const dasha = useDasha(request, undefined, needsDasha);

  function toggle(section: SectionId) {
    setOpenSections((current) => {
      const next = new Set(current);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-amber-200/70">{kundaliLabel} Analysis Dashboard</p>
        <h2 className="mt-2 text-3xl font-bold text-white">Natal Astrology Analysis</h2>
        <p className="mt-2 max-w-3xl text-sm text-slate-400">
          Expand sections as needed. Vimshottari Dasha loads only when the Dasha section is opened.
        </p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {SECTION_NAV.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className="whitespace-nowrap rounded-full border border-white/10 bg-black/20 px-3 py-2 text-xs font-semibold text-slate-300 hover:border-amber-200/60 hover:text-white"
          >
            {item.label}
          </a>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <DashboardSection
          id="panchanga"
          title="Panchanga Card"
          subtitle="Nakshatra, yoga, karana, sunrise, sunset, and ayanamsha."
          icon="panchanga"
          expanded={openSections.has("panchanga")}
          onToggle={() => toggle("panchanga")}
        >
          <PanchangaCard chart={chart} term={term} />
        </DashboardSection>

        <DashboardSection
          id="houses"
          title="House Analysis Table"
          subtitle="Whole-sign houses with lord condition, influences, scores, and explanations."
          icon="houses"
          expanded={openSections.has("houses")}
          onToggle={() => toggle("houses")}
          wide
        >
          <HouseAnalysisTable chart={chart} term={term} />
        </DashboardSection>

        <DashboardSection
          id="yoga"
          title="Yoga Dashboard"
          subtitle="Detected natal yogas from chart relationships."
          icon="yoga"
          expanded={openSections.has("yoga")}
          onToggle={() => toggle("yoga")}
        >
          <YogaDashboard chart={chart} term={term} />
        </DashboardSection>

        <DashboardSection
          id="strength"
          title="Planet Power Index"
          subtitle="Quick client-side ranking from dignity, house placement, motion, and aspects."
          icon="strength"
          expanded={openSections.has("strength")}
          onToggle={() => toggle("strength")}
        >
          <PlanetStrengthRankings chart={chart} term={term} />
        </DashboardSection>

        <DashboardSection
          id="traditionalStrength"
          title="Traditional Strength Dashboard"
          subtitle="Authentic Jyotish-style strength using Shadbala, Ashtakavarga, varga support, combustion, and planetary war."
          icon="strength"
          expanded={openSections.has("traditionalStrength")}
          onToggle={() => toggle("traditionalStrength")}
          wide
        >
          <TraditionalStrengthDashboard request={request} enabled={needsTraditionalStrength} term={term} />
        </DashboardSection>

        <DashboardSection
          id="timeline"
          title="Dasha Dashboard"
          subtitle="Mahadasha and antardasha periods with running status."
          icon="timeline"
          expanded={openSections.has("timeline")}
          onToggle={() => toggle("timeline")}
          wide
        >
          {dasha.isLoading ? <LoadingText /> : dasha.data ? (
            <InteractiveVimshottariTimeline timeline={dasha.data} localeCode={localeCode} term={term} />
          ) : (
            <p className="text-sm text-slate-400">Open this section to load Vimshottari timeline.</p>
          )}
        </DashboardSection>

        <DashboardSection
          id="marriage"
          title="Marriage Analysis Module"
          subtitle="7th house, Venus/Jupiter indicators, and D9 guidance."
          icon="marriage"
          expanded={openSections.has("marriage")}
          onToggle={() => toggle("marriage")}
          wide
        >
          <MarriageAnalysisModule chart={chart} request={request} enabled={needsMarriage} term={term} />
        </DashboardSection>

        <DashboardSection
          id="career"
          title="Career Analysis Module"
          subtitle="10th house, work planets, and D10 guidance."
          icon="career"
          expanded={openSections.has("career")}
          onToggle={() => toggle("career")}
          wide
        >
          <CareerAnalysisModule chart={chart} request={request} enabled={needsCareer} term={term} />
        </DashboardSection>

        <DashboardSection
          id="divisional"
          title="Divisional Chart Inspector"
          subtitle="Quick access to core vargas while preserving the main chart picker."
          icon="divisional"
          expanded={openSections.has("divisional")}
          onToggle={() => toggle("divisional")}
        >
          <DivisionalChartInspector charts={charts} activeChartType={activeChartType} onSelectChart={onSelectChart} term={term} />
        </DashboardSection>

        <DashboardSection
          id="aspects"
          title="Planetary Aspects Panel"
          subtitle="Vedic and optional western aspects from the active chart."
          icon="aspects"
          expanded={openSections.has("aspects")}
          onToggle={() => toggle("aspects")}
          wide
        >
          <PlanetaryAspectsPanel chart={chart} term={term} />
        </DashboardSection>

        <DashboardSection
          id="transit"
          title="Transit Summary"
          subtitle="Daily, monthly, and yearly transit module state."
          icon="transit"
          expanded={openSections.has("transit")}
          onToggle={() => toggle("transit")}
        >
          <TransitDashboard request={request} enabled={needsTransits} term={term} />
        </DashboardSection>

        <DashboardSection
          id="prediction"
          title="Prediction Summary"
          subtitle="Natal chart summary for career, marriage, finance, health, and education."
          icon="life"
          expanded={openSections.has("prediction")}
          onToggle={() => toggle("prediction")}
          wide
        >
          <PredictionSummary chart={chart} term={term} />
        </DashboardSection>
      </div>
    </div>
  );
}

const SECTION_NAV: Array<{ id: SectionId; label: string }> = [
  { id: "panchanga", label: "Panchanga" },
  { id: "houses", label: "Houses" },
  { id: "yoga", label: "Yogas" },
  { id: "strength", label: "Power Index" },
  { id: "traditionalStrength", label: "Traditional Strength" },
  { id: "timeline", label: "Dasha" },
  { id: "marriage", label: "Marriage" },
  { id: "career", label: "Career" },
  { id: "divisional", label: "Vargas" },
  { id: "aspects", label: "Aspects" },
  { id: "transit", label: "Transits" },
  { id: "prediction", label: "Predictions" },
];

function LoadingText() {
  return <p className="text-sm text-slate-400">Loading calculation...</p>;
}
