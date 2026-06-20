import type { TajikaSection as TajikaSectionData, TajikaYoga } from "@/lib/types";
import { useI18n } from "@/lib/i18n";

const YOGA_GROUPS: Array<[keyof Omit<TajikaSectionData, "tajika_aspects">, string]> = [
  ["ithasala_yogas", "Ithasala"],
  ["isharafa_yogas", "Isharafa"],
  ["kamboola_yogas", "Kamboola"],
  ["nakta_yogas", "Nakta"],
  ["yamaya_yogas", "Yamaya"],
  ["manahoo_yogas", "Manahoo"],
  ["radda_yogas", "Radda"],
];

export function TajikaSection({ tajika }: { tajika: TajikaSectionData }) {
  const { t, term } = useI18n();

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
      <h2 className="text-lg font-semibold text-white">{term("varshphalTerms", "tajika")}</h2>
      <div className="mt-5 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-black/20 text-slate-400">
            <tr>
              <th className="px-4 py-3">{t("ui.source")}</th>
              <th className="px-4 py-3">{t("ui.target")}</th>
              <th className="px-4 py-3">{t("ui.aspect")}</th>
              <th className="px-4 py-3">{t("ui.orb")}</th>
              <th className="px-4 py-3">{t("ui.applying")}</th>
              <th className="px-4 py-3">{t("ui.strength")}</th>
            </tr>
          </thead>
          <tbody>
            {tajika.tajika_aspects.slice(0, 12).map((aspect) => (
              <tr
                key={`${aspect.source}-${aspect.target}-${aspect.aspect_type}`}
                className="border-t border-white/10 text-slate-200"
              >
                <td className="px-4 py-3">{term("planets", aspect.source)}</td>
                <td className="px-4 py-3">{term("planets", aspect.target)}</td>
                <td className="px-4 py-3">{term("aspectTypes", aspect.aspect_type)}</td>
                <td className="px-4 py-3">{aspect.orb.toFixed(2)}</td>
                <td className="px-4 py-3">{aspect.applying ? t("ui.yes") : t("ui.no")}</td>
                <td className="px-4 py-3">{aspect.strength.toFixed(0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {YOGA_GROUPS.map(([key, title]) => (
          <YogaGroup key={key} title={term("yogaNames", title)} yogas={tajika[key]} t={t} term={term} />
        ))}
      </div>
    </div>
  );
}

function YogaGroup({
  title,
  yogas,
  t,
  term,
}: {
  title: string;
  yogas: TajikaYoga[];
  t: (key: string) => string;
  term: (layer: string, canonical: string) => string;
}) {
  return (
    <div className="rounded-2xl bg-black/20 p-4">
      <h3 className="font-semibold text-white">{title}</h3>
      <div className="mt-3 space-y-2 text-sm text-slate-300">
        {yogas.length ? (
          yogas.slice(0, 4).map((yoga) => (
            <p key={`${yoga.name}-${yoga.planets.join("-")}-${yoga.strength}`}>
              {yoga.planets.map((planet) => term("planets", planet)).join(" / ")} · {yoga.strength.toFixed(0)}
            </p>
          ))
        ) : (
          <p>{t("ui.noMatchingYogas")}</p>
        )}
      </div>
    </div>
  );
}
