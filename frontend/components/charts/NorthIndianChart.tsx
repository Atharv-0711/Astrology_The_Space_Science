"use client";

import { useMemo, useState } from "react";

import { useI18n } from "@/lib/i18n";
import type { Chart, NorthIndianChartPayload } from "@/lib/types";

type NorthIndianChartProps = {
  payload: NorthIndianChartPayload;
  chart?: Chart;
};

const PLANET_FONT_SIZE = 3.1;
const SIGN_FONT_SIZE = 2.55;
const HOUSE_FONT_SIZE = 2.35;
const CHART_STROKE = "#ff914d";

const PLANET_COLORS: Record<string, string> = {
  Ascendant: "#f97316",
  Jupiter: "#d946ef",
  Sun: "#ef2727",
  Mercury: "#3b82c4",
  Mars: "#22592d",
  Uranus: "#ff1f1f",
  Moon: "#c7c5ff",
  Saturn: "#2d163f",
  Neptune: "#241442",
  Rahu: "#d32016",
  Pluto: "#181429",
  Venus: "#168234",
  Ketu: "#c47a2c",
};

const SIGN_COLORS = [
  "#1f3b73",
  "#ff1f1f",
  "#9ca3ff",
  "#27682f",
  "#3b82c4",
  "#d946ef",
  "#168234",
  "#c2410c",
  "#ff1f1f",
  "#c47a2c",
  "#ff1f1f",
  "#2d163f",
];

const HOUSE_LABEL_OVERRIDES: Record<number, { x: number; y: number }> = {
  6: { x: 29, y: 76.5 },
  8: { x: 71, y: 76.5 },
};

const PLANET_LABEL_SLOTS: Record<number, Array<{ x: number; y: number }>> = {
  1: [
    { x: 50, y: 23 },
    { x: 50, y: 25.4 },
    { x: 50, y: 27.8 },
    { x: 50, y: 30.2 },
    { x: 50, y: 32.6 },
    { x: 50, y: 35 },
    { x: 50, y: 37.4 },
  ],
  2: [
    { x: 30, y: 15.8 },
    { x: 30, y: 18 },
    { x: 30, y: 20.2 },
    { x: 30, y: 22.4 },
    { x: 30, y: 24.6 },
    { x: 30, y: 26.8 },
    { x: 30, y: 29 },
  ],
  3: [
    { x: 15.5, y: 30 },
    { x: 17.8, y: 27.8 },
    { x: 17.8, y: 32.2 },
    { x: 20.1, y: 25.6 },
    { x: 20.1, y: 34.4 },
  ],
  4: [
    { x: 28, y: 50 },
    { x: 30.5, y: 47.5 },
    { x: 30.5, y: 52.5 },
    { x: 33, y: 45 },
    { x: 33, y: 55 },
  ],
  5: [
    { x: 15.5, y: 70 },
    { x: 17.8, y: 67.8 },
    { x: 17.8, y: 72.2 },
    { x: 20.1, y: 65.6 },
    { x: 20.1, y: 74.4 },
  ],
  6: [
    { x: 30, y: 82 },
    { x: 30, y: 84.2 },
    { x: 30, y: 86.4 },
    { x: 26, y: 84.6 },
    { x: 34, y: 84.6 },
  ],
  7: [
    { x: 50, y: 77 },
    { x: 50, y: 74.6 },
    { x: 50, y: 72.2 },
    { x: 50, y: 69.8 },
    { x: 50, y: 67.4 },
    { x: 50, y: 65 },
    { x: 50, y: 62.6 },
  ],
  8: [
    { x: 70, y: 82 },
    { x: 70, y: 84.2 },
    { x: 70, y: 86.4 },
    { x: 66, y: 84.6 },
    { x: 74, y: 84.6 },
  ],
  9: [
    { x: 84.5, y: 70 },
    { x: 82.2, y: 67.8 },
    { x: 82.2, y: 72.2 },
    { x: 79.9, y: 65.6 },
    { x: 79.9, y: 74.4 },
  ],
  10: [
    { x: 72, y: 50 },
    { x: 69.5, y: 47.5 },
    { x: 69.5, y: 52.5 },
    { x: 67, y: 45 },
    { x: 67, y: 55 },
  ],
  11: [
    { x: 84.5, y: 30 },
    { x: 82.2, y: 27.8 },
    { x: 82.2, y: 32.2 },
    { x: 79.9, y: 25.6 },
    { x: 79.9, y: 34.4 },
  ],
  12: [
    { x: 70, y: 15.8 },
    { x: 70, y: 18 },
    { x: 70, y: 20.2 },
    { x: 70, y: 22.4 },
    { x: 70, y: 24.6 },
    { x: 70, y: 26.8 },
    { x: 70, y: 29 },
  ],
};

function getLabelFontSize(kind: NorthIndianChartPayload["labels"][number]["kind"]) {
  if (kind === "planet") {
    return PLANET_FONT_SIZE;
  }
  if (kind === "sign") {
    return SIGN_FONT_SIZE;
  }
  return HOUSE_FONT_SIZE;
}

function getDisplayText(
  label: NorthIndianChartPayload["labels"][number],
  term: (layer: string, canonical: string) => string,
) {
  if (label.kind === "planet") {
    return label.planet ? term("planetAbbreviations", label.planet) : label.text.split(" ")[0];
  }

  if (label.kind === "house") {
    return "";
  }

  if (label.kind === "ascendant") {
    return term("planetAbbreviations", "Ascendant");
  }

  return label.text;
}

function getLabelFill(label: NorthIndianChartPayload["labels"][number]) {
  if (label.kind === "planet" || label.kind === "ascendant") {
    return PLANET_COLORS[label.planet ?? "Ascendant"] ?? "#111827";
  }

  if (label.kind === "sign") {
    return SIGN_COLORS[(Number(label.text) - 1 + SIGN_COLORS.length) % SIGN_COLORS.length];
  }

  return "#253043";
}

export function NorthIndianChart({ payload, chart }: NorthIndianChartProps) {
  const { t, term } = useI18n();
  const [activePlanet, setActivePlanet] = useState<string | null>(null);
  const [hoveredLabel, setHoveredLabel] = useState<string | null>(null);

  const selectedPlanet = activePlanet && chart ? chart.planets[activePlanet] : null;
  const chartName =
    payload.chart_type === "Varshphal" ? term("varshphalTerms", "varshphal") : payload.chart_type;
  const title = `${chartName} ${term("chartLabels", "northIndianChart")}`;

  const labels = useMemo(
    () => {
      const planetIndexesByHouse = new Map<number, number>();

      return payload.labels.filter((label) => label.kind !== "house").map((label, index) => {
        let x = label.x;
        let y = label.y;

        if (label.kind === "planet") {
          const planetIndex = planetIndexesByHouse.get(label.house) ?? 0;
          planetIndexesByHouse.set(label.house, planetIndex + 1);
          const slot = PLANET_LABEL_SLOTS[label.house]?.[planetIndex];

          if (slot) {
            x = slot.x;
            y = slot.y;
          }
        }

        if (label.kind === "house") {
          const override = HOUSE_LABEL_OVERRIDES[label.house];

          if (override) {
            x = override.x;
            y = override.y;
          }
        }

        return {
          ...label,
          x,
          y,
          key: `${label.kind}-${label.house}-${label.planet ?? label.text}-${index}`,
        };
      });
    },
    [payload.labels],
  );

  return (
    <div className="rounded-3xl border border-amber-200/20 bg-cosmic-900/80 p-4 shadow-2xl shadow-black/30">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-amber-200/70">{payload.chart_type}</p>
          <h2 className="text-2xl font-semibold text-amber-100">{title}</h2>
        </div>
        <p className="rounded-full border border-amber-200/20 px-3 py-1 text-xs text-slate-300">
          {t("ui.svgReady")}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <svg
          role="img"
          aria-label={title}
          viewBox={payload.view_box}
          className="aspect-[1.25/1] w-full rounded-sm bg-white"
        >
          {payload.lines.map((line, index) => (
            <line
              key={`${line.start.x}-${line.start.y}-${line.end.x}-${line.end.y}-${index}`}
              x1={line.start.x}
              y1={line.start.y}
              x2={line.end.x}
              y2={line.end.y}
              stroke={CHART_STROKE}
              strokeWidth="2.25"
              vectorEffect="non-scaling-stroke"
            />
          ))}

          {labels.map((label) => {
            const isPlanet = label.kind === "planet";
            const isActive = isPlanet && activePlanet === label.planet;
            return (
              <g key={label.key}>
                {formatLabelTooltip(label, chart, term, t) ? (
                  <title>{formatLabelTooltip(label, chart, term, t)}</title>
                ) : null}
                <text
                  x={label.x}
                  y={label.y}
                  fontSize={getLabelFontSize(label.kind)}
                  fill={isActive ? "#f59e0b" : getLabelFill(label)}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  tabIndex={isPlanet ? 0 : undefined}
                  role={isPlanet ? "button" : undefined}
                  onMouseEnter={() => setHoveredLabel(formatLabelTooltip(label, chart, term, t))}
                  onMouseLeave={() => setHoveredLabel(null)}
                  onClick={() => {
                    if (label.planet) {
                      setActivePlanet(label.planet);
                    }
                  }}
                  onKeyDown={(event) => {
                    if (label.planet && (event.key === "Enter" || event.key === " ")) {
                      setActivePlanet(label.planet);
                    }
                  }}
                  className={`font-bold outline-none transition ${
                    isPlanet ? "cursor-pointer hover:opacity-75" : ""
                  }`}
                >
                  {getDisplayText(label, term)}
                </text>
              </g>
            );
          })}
        </svg>

        <aside className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-100">
            {t("ui.selection")}
          </h3>
          {selectedPlanet ? (
            <div className="mt-4 space-y-3 text-sm text-slate-200">
              <p className="text-xl font-semibold text-white">{term("planets", selectedPlanet.name)}</p>
              <Detail label={term("chartLabels", "sign")} value={term("signs", selectedPlanet.zodiac.sign_name)} />
              <Detail label={term("chartLabels", "house")} value={String(selectedPlanet.house ?? "-")} />
              <Detail
                label={term("chartLabels", "degree")}
                value={t("ui.degreeValue", { degree: selectedPlanet.zodiac.degree.toFixed(2) })}
              />
              <Detail
                label={term("chartLabels", "nakshatra")}
                value={term("nakshatras", selectedPlanet.zodiac.nakshatra)}
              />
              <Detail label={term("chartLabels", "pada")} value={String(selectedPlanet.zodiac.pada)} />
              <Detail label={term("chartLabels", "speed")} value={selectedPlanet.speed.toFixed(4)} />
              <Detail label={term("chartLabels", "retrograde")} value={selectedPlanet.retrograde ? t("ui.yes") : t("ui.no")} />
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-300">
              {t("ui.chartHint")}
            </p>
          )}
          {hoveredLabel ? (
            <p className="mt-6 rounded-xl bg-white/5 p-3 text-xs text-slate-300">{hoveredLabel}</p>
          ) : null}
        </aside>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-2">
      <span className="text-slate-400">{label}</span>
      <span className="font-medium text-slate-100">{value}</span>
    </div>
  );
}

function formatLabelTooltip(
  label: NorthIndianChartPayload["labels"][number],
  chart: Chart | undefined,
  term: (layer: string, canonical: string) => string,
  t: (key: string, values?: Record<string, string | number>) => string,
) {
  if (label.kind === "planet" && label.planet && chart?.planets[label.planet]) {
    const planet = chart.planets[label.planet];
    return t("ui.chartPlanetTooltip", {
      planet: term("planets", planet.name),
      sign: term("signs", planet.zodiac.sign_name),
      nakshatra: term("nakshatras", planet.zodiac.nakshatra),
      pada: planet.zodiac.pada,
      house: planet.house ?? "-",
    });
  }

  if (label.kind === "ascendant" && chart) {
    return t("ui.chartAscendantTooltip", {
      sign: term("signs", chart.ascendant.zodiac.sign_name),
      nakshatra: term("nakshatras", chart.ascendant.zodiac.nakshatra),
      pada: chart.ascendant.zodiac.pada,
    });
  }

  return label.tooltip;
}
