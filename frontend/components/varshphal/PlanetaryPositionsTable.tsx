import type { PlanetaryPositionRow } from "@/lib/types";
import { useI18n } from "@/lib/i18n";

const PLANETS = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"];

export function PlanetaryPositionsTable({
  positions,
}: {
  positions: Record<string, PlanetaryPositionRow>;
}) {
  const { t, term } = useI18n();

  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04]">
      <div className="border-b border-white/10 px-5 py-4">
        <h2 className="text-lg font-semibold text-white">{t("ui.planetPositions")}</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-black/20 text-slate-400">
            <tr>
              <th className="px-5 py-3">{term("chartLabels", "planet")}</th>
              <th className="px-5 py-3">{t("ui.longitude")}</th>
              <th className="px-5 py-3">{term("chartLabels", "sign")}</th>
              <th className="px-5 py-3">{term("chartLabels", "degree")}</th>
              <th className="px-5 py-3">{term("chartLabels", "nakshatra")}</th>
              <th className="px-5 py-3">{term("chartLabels", "pada")}</th>
              <th className="px-5 py-3">{term("chartLabels", "house")}</th>
              <th className="px-5 py-3">{term("chartLabels", "retrograde")}</th>
              <th className="px-5 py-3">{t("ui.combust")}</th>
              <th className="px-5 py-3">{t("ui.aspects")}</th>
            </tr>
          </thead>
          <tbody>
            {PLANETS.map((planet) => {
              const row = positions[planet];
              if (!row) {
                return null;
              }
              return (
                <tr key={planet} className="border-t border-white/10 text-slate-200">
                  <td className="px-5 py-3 font-medium text-white">{term("planets", planet)}</td>
                  <td className="px-5 py-3">{row.longitude.toFixed(2)}</td>
                  <td className="px-5 py-3">{term("signs", row.sign)}</td>
                  <td className="px-5 py-3">{row.degree.toFixed(2)}</td>
                  <td className="px-5 py-3">{term("nakshatras", row.nakshatra)}</td>
                  <td className="px-5 py-3">{row.pada}</td>
                  <td className="px-5 py-3">{row.house ?? "-"}</td>
                  <td className="px-5 py-3">{row.retrograde_status ? t("ui.yes") : t("ui.no")}</td>
                  <td className="px-5 py-3">{row.combust_status ? t("ui.yes") : t("ui.no")}</td>
                  <td className="px-5 py-3">{row.aspect_count}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
