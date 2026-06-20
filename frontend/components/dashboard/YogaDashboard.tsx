import type { Chart } from "@/lib/types";

import { StatusBadge } from "./StatusBadge";

type YogaCategory =
  | "Raj Yoga"
  | "Dhana Yoga"
  | "Marriage Yoga"
  | "Career Yoga"
  | "Spiritual Yoga"
  | "Arishta Yoga";

type YogaModifier = {
  type: "positive" | "negative";
  text: string;
};

type YogaResult = {
  name: string;
  active: boolean;
  strength: number;
  category: YogaCategory;
  evidence: string[];
  modifiers: YogaModifier[];
  description: string;
};

export function YogaDashboard({
  chart,
  term,
}: {
  chart: Chart;
  term: (layer: string, canonical: string) => string;
}) {
  const yogas = detectNatalYogas(chart);
  return (
    <div className="space-y-5">
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/10">
        <div className="border-b border-white/10 px-4 py-3">
          <h3 className="font-semibold text-white">Yoga Ranking</h3>
          <p className="mt-1 text-xs text-slate-400">Strongest yogas first, with inactive yogas retained for auditability.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-black/20 text-slate-400">
              <tr>
                <th className="px-4 py-3">Yoga</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Condition Met</th>
                <th className="px-4 py-3">Strength</th>
                <th className="px-4 py-3">Interpretation</th>
              </tr>
            </thead>
            <tbody>
              {yogas.map((yoga) => (
                <tr key={yoga.name} className="border-t border-white/10 text-slate-200">
                  <td className="px-4 py-3 font-semibold text-white">{yoga.name}</td>
                  <td className="px-4 py-3">{yoga.category}</td>
                  <td className="px-4 py-3">
                    <StatusBadge tone={yoga.active ? "good" : "default"}>{yoga.active ? "Yes" : "No"}</StatusBadge>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge tone={toneForStrength(yoga.strength)}>{yoga.strength}/100</StatusBadge>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{yoga.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {yogas.map((yoga) => (
          <details key={yoga.name} className="rounded-2xl bg-black/20 p-4">
            <summary className="cursor-pointer list-none">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-white">{yoga.name}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.2em] text-amber-200/70">{yoga.category}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge tone={yoga.active ? "good" : "default"}>{yoga.active ? "Condition Met" : "Condition Not Met"}</StatusBadge>
                  <StatusBadge tone={toneForStrength(yoga.strength)}>{yoga.strength}/100</StatusBadge>
                </div>
              </div>
              <p className="mt-2 text-sm text-slate-400">{yoga.description}</p>
            </summary>

            <div className="mt-4 grid gap-3 text-sm">
              <DetailList title="Evidence" items={yoga.evidence} emptyText="No supporting evidence was found for this yoga." />
              <DetailList
                title="Positive Modifiers"
                items={yoga.modifiers.filter((modifier) => modifier.type === "positive").map((modifier) => modifier.text)}
                emptyText="No positive modifiers are currently strengthening this yoga."
              />
              <DetailList
                title="Negative Modifiers"
                items={yoga.modifiers.filter((modifier) => modifier.type === "negative").map((modifier) => modifier.text)}
                emptyText="No negative modifiers are currently weakening this yoga."
              />
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}

function detectNatalYogas(chart: Chart): YogaResult[] {
  const sun = chart.planets.Sun;
  const moon = chart.planets.Moon;
  const mars = chart.planets.Mars;
  const mercury = chart.planets.Mercury;
  const jupiter = chart.planets.Jupiter;
  const venus = chart.planets.Venus;
  const saturn = chart.planets.Saturn;
  const kendrasFromMoon = new Set([moon.house, ((moon.house ?? 1) + 3 - 1) % 12 + 1, ((moon.house ?? 1) + 6 - 1) % 12 + 1, ((moon.house ?? 1) + 9 - 1) % 12 + 1]);
  const beneficsInSixSevenEight = [mercury, venus, jupiter].some((planet) => [6, 7, 8].includes(relativeHouse(moon.house, planet.house)));
  const rules: YogaResult[] = [
    buildYoga({
      name: "Gaja Kesari Yoga",
      category: "Raj Yoga",
      active: Boolean(jupiter.house && kendrasFromMoon.has(jupiter.house)),
      baseStrength: 72,
      evidence: [`Jupiter is in house ${jupiter.house ?? "-"} and Moon is in house ${moon.house ?? "-"}.`, "Gaja Kesari requires Jupiter in a kendra from Moon."],
      modifiers: planetModifiers(jupiter, "Jupiter").concat(planetModifiers(moon, "Moon")),
      description: "Jupiter in a kendra from Moon can support wisdom, reputation, emotional steadiness, and protective counsel.",
    }),
    buildYoga({
      name: "Budha Aditya Yoga",
      category: "Career Yoga",
      active: sun.zodiac.sign_number === mercury.zodiac.sign_number,
      baseStrength: 68,
      evidence: [`Sun is in ${sun.zodiac.sign_name}.`, `Mercury is in ${mercury.zodiac.sign_name}.`, "Budha Aditya requires Sun and Mercury in the same sign."],
      modifiers: planetModifiers(sun, "Sun").concat(planetModifiers(mercury, "Mercury")),
      description: "Sun joined Mercury supports intelligence, administrative ability, communication, analysis, and professional visibility.",
    }),
    buildYoga({
      name: "Chandra Mangala Yoga",
      category: "Dhana Yoga",
      active: moon.zodiac.sign_number === mars.zodiac.sign_number || relativeHouse(moon.house, mars.house) === 7,
      baseStrength: 66,
      evidence: [`Moon is in house ${moon.house ?? "-"} and ${moon.zodiac.sign_name}.`, `Mars is in house ${mars.house ?? "-"} and ${mars.zodiac.sign_name}.`, "Chandra Mangala requires Moon and Mars conjunction or mutual 7th-house relationship."],
      modifiers: planetModifiers(moon, "Moon").concat(planetModifiers(mars, "Mars")),
      description: "Moon and Mars linked together can support enterprise, initiative, cash flow, and practical wealth-building activity.",
    }),
    buildYoga({
      name: "Adhi Yoga",
      category: "Raj Yoga",
      active: beneficsInSixSevenEight,
      baseStrength: 64,
      evidence: [relativeEvidence("Mercury", moon.house, mercury.house), relativeEvidence("Venus", moon.house, venus.house), relativeEvidence("Jupiter", moon.house, jupiter.house), "Adhi Yoga requires benefics in the 6th, 7th, or 8th from Moon."],
      modifiers: [mercury, venus, jupiter].flatMap((planet) => planetModifiers(planet, planet.name)),
      description: "Benefics around the Moon can support comfort, social grace, help from others, and capacity to handle pressure.",
    }),
    buildYoga({
      name: "Kemadruma Yoga",
      category: "Arishta Yoga",
      active: !Object.values(chart.planets).some((planet) => planet.name !== "Moon" && [2, 12].includes(relativeHouse(moon.house, planet.house))),
      baseStrength: 70,
      evidence: ["Kemadruma requires no planets in the 2nd or 12th from Moon.", `Moon is in house ${moon.house ?? "-"}.`],
      modifiers: planetModifiers(moon, "Moon").concat(hasKendraPlanets(chart, moon.house) ? [{ type: "negative", text: "Planets in kendras from Moon reduce the severity of Kemadruma." } as YogaModifier] : []),
      description: "Kemadruma is an Arishta yoga showing emotional isolation or support gaps unless cancelled by other stabilizing factors.",
    }),
    mahapurushaYoga("Ruchaka Yoga", "Raj Yoga", mars, "Mars", "Mars strong in a kendra gives courage, command, technical ability, and decisive action."),
    mahapurushaYoga("Bhadra Yoga", "Career Yoga", mercury, "Mercury", "Mercury strong in a kendra gives intellect, commerce, speech, analytics, and professional skill."),
    mahapurushaYoga("Hamsa Yoga", "Spiritual Yoga", jupiter, "Jupiter", "Jupiter strong in a kendra gives wisdom, ethics, protection, teaching ability, and spiritual merit."),
    mahapurushaYoga("Malavya Yoga", "Marriage Yoga", venus, "Venus", "Venus strong in a kendra gives charm, relationship harmony, refinement, comfort, and artistic grace."),
    mahapurushaYoga("Sasa Yoga", "Raj Yoga", saturn, "Saturn", "Saturn strong in a kendra gives endurance, authority over systems, discipline, and mass influence."),
    rajaYoga(chart),
    dhanaYoga(chart),
    lakshmiYoga(chart),
    vipareetaRajaYoga(chart),
    marriageYoga(chart),
  ];

  return rules.sort((first, second) => Number(second.active) - Number(first.active) || second.strength - first.strength || first.name.localeCompare(second.name));
}

function relativeHouse(from: number | null, to: number | null) {
  if (!from || !to) {
    return 0;
  }
  return ((to - from + 12) % 12) + 1;
}

function buildYoga({
  name,
  active,
  category,
  baseStrength,
  evidence,
  modifiers,
  description,
}: {
  name: string;
  active: boolean;
  category: YogaCategory;
  baseStrength: number;
  evidence: string[];
  modifiers: YogaModifier[];
  description: string;
}): YogaResult {
  const modifierStrength = modifiers.reduce((sum, modifier) => sum + (modifier.type === "positive" ? 6 : -6), 0);
  return {
    name,
    active,
    strength: active ? clampScore(baseStrength + modifierStrength) : 0,
    category,
    evidence,
    modifiers,
    description,
  };
}

function mahapurushaYoga(
  name: string,
  category: YogaCategory,
  planet: Chart["planets"][string],
  planetName: string,
  description: string,
) {
  const active = Boolean(planet.house && [1, 4, 7, 10].includes(planet.house) && (planet.dignity.own_sign || planet.dignity.exalted));
  return buildYoga({
    name,
    category,
    active,
    baseStrength: 78,
    evidence: [
      `${planetName} is in house ${planet.house ?? "-"} and ${planet.zodiac.sign_name}.`,
      `${name} requires ${planetName} in own sign or exaltation while placed in a kendra house: 1, 4, 7, or 10.`,
    ],
    modifiers: planetModifiers(planet, planetName),
    description,
  });
}

function rajaYoga(chart: Chart) {
  const kendraLords = [1, 4, 7, 10].map((house) => chart.houses[String(house)].lord);
  const trikonaLords = [1, 5, 9].map((house) => chart.houses[String(house)].lord);
  const linked = kendraLords.some((lord) => trikonaLords.includes(lord)) || kendraLords.some((lord) => trikonaLords.some((trikonaLord) => sameHouse(chart, lord, trikonaLord)));
  return buildYoga({
    name: "Kendra-Trikona Raja Yoga",
    category: "Raj Yoga",
    active: linked,
    baseStrength: 74,
    evidence: [`Kendra lords: ${kendraLords.join(", ")}.`, `Trikona lords: ${trikonaLords.join(", ")}.`, "Raja Yoga requires a connection between angular and trinal house lords."],
    modifiers: uniquePlanets([...kendraLords, ...trikonaLords]).flatMap((planet) => planetModifiers(chart.planets[planet], planet)),
    description: "A kendra-trikona lord connection supports authority, rise, recognition, and constructive life direction.",
  });
}

function dhanaYoga(chart: Chart) {
  const secondLord = chart.houses["2"].lord;
  const fifthLord = chart.houses["5"].lord;
  const ninthLord = chart.houses["9"].lord;
  const eleventhLord = chart.houses["11"].lord;
  const active = [fifthLord, ninthLord, eleventhLord].some((lord) => sameHouse(chart, secondLord, lord)) || sameHouse(chart, fifthLord, eleventhLord) || sameHouse(chart, ninthLord, eleventhLord);
  return buildYoga({
    name: "Dhana Yoga",
    category: "Dhana Yoga",
    active,
    baseStrength: 72,
    evidence: [`2nd lord: ${secondLord}.`, `5th lord: ${fifthLord}.`, `9th lord: ${ninthLord}.`, `11th lord: ${eleventhLord}.`, "Dhana Yoga requires wealth lords, gain lords, or trinal lords to connect."],
    modifiers: uniquePlanets([secondLord, fifthLord, ninthLord, eleventhLord]).flatMap((planet) => planetModifiers(chart.planets[planet], planet)),
    description: "Connections among wealth, fortune, intelligence, and gains can support earning capacity and accumulation.",
  });
}

function lakshmiYoga(chart: Chart) {
  const lagnaLord = chart.ascendant.lord;
  const ninthLord = chart.houses["9"].lord;
  const lagnaLordPlanet = chart.planets[lagnaLord];
  const ninthLordPlanet = chart.planets[ninthLord];
  const active = isStrong(lagnaLordPlanet) && isStrong(ninthLordPlanet);
  return buildYoga({
    name: "Lakshmi Yoga",
    category: "Dhana Yoga",
    active,
    baseStrength: 76,
    evidence: [`Ascendant lord: ${lagnaLord}.`, `9th lord: ${ninthLord}.`, "Lakshmi Yoga requires strength of the ascendant lord and 9th lord."],
    modifiers: planetModifiers(lagnaLordPlanet, lagnaLord).concat(planetModifiers(ninthLordPlanet, ninthLord)),
    description: "Strong ascendant and fortune lords support prosperity, grace, protection, and access to resources.",
  });
}

function vipareetaRajaYoga(chart: Chart) {
  const dusthanaLords = [6, 8, 12].map((house) => chart.houses[String(house)].lord);
  const active = dusthanaLords.some((lord) => {
    const planet = chart.planets[lord];
    return planet.house !== null && [6, 8, 12].includes(planet.house);
  });
  return buildYoga({
    name: "Vipareeta Raja Yoga",
    category: "Raj Yoga",
    active,
    baseStrength: 70,
    evidence: [`6th, 8th, and 12th lords: ${dusthanaLords.join(", ")}.`, "Vipareeta Raja Yoga requires dusthana lords placed in dusthana houses."],
    modifiers: uniquePlanets(dusthanaLords).flatMap((planet) => planetModifiers(chart.planets[planet], planet)),
    description: "Difficult-house lords turning inward can convert adversity into resilience, problem-solving power, and eventual rise.",
  });
}

function marriageYoga(chart: Chart) {
  const seventhLord = chart.houses["7"].lord;
  const seventhLordPlanet = chart.planets[seventhLord];
  const venus = chart.planets.Venus;
  const jupiter = chart.planets.Jupiter;
  const active = [1, 2, 5, 7, 9, 11].includes(seventhLordPlanet.house ?? 0) && (isStrong(venus) || isStrong(jupiter));
  return buildYoga({
    name: "Marriage Support Yoga",
    category: "Marriage Yoga",
    active,
    baseStrength: 68,
    evidence: [`7th lord ${seventhLord} is in house ${seventhLordPlanet.house ?? "-"}.`, `Venus is in ${venus.zodiac.sign_name}.`, `Jupiter is in ${jupiter.zodiac.sign_name}.`, "Marriage Support Yoga requires a well-placed 7th lord with benefic support from Venus or Jupiter."],
    modifiers: planetModifiers(seventhLordPlanet, seventhLord).concat(planetModifiers(venus, "Venus"), planetModifiers(jupiter, "Jupiter")),
    description: "A well-supported 7th lord with Venus or Jupiter strength can improve harmony, commitment, and family support in relationships.",
  });
}

function planetModifiers(planet: Chart["planets"][string], planetName: string): YogaModifier[] {
  const modifiers: YogaModifier[] = [];
  if (planet.dignity.exalted) modifiers.push({ type: "positive", text: `${planetName} is exalted, increasing yoga strength.` });
  if (planet.dignity.own_sign) modifiers.push({ type: "positive", text: `${planetName} is in own sign, stabilizing the yoga.` });
  if (planet.dignity.moolatrikona) modifiers.push({ type: "positive", text: `${planetName} is in moolatrikona, adding purposeful strength.` });
  if (planet.house && [1, 4, 5, 7, 9, 10, 11].includes(planet.house)) modifiers.push({ type: "positive", text: `${planetName} is in house ${planet.house}, a supportive placement for expression.` });
  if (planet.dignity.debilitated) modifiers.push({ type: "negative", text: `${planetName} is debilitated, reducing reliability of the yoga.` });
  if (planet.house && [6, 8, 12].includes(planet.house)) modifiers.push({ type: "negative", text: `${planetName} is in house ${planet.house}, adding delay, conflict, or hidden pressure.` });
  if (planet.retrograde) modifiers.push({ type: "negative", text: `${planetName} is retrograde, making results more irregular or revision-oriented.` });
  return modifiers;
}

function relativeEvidence(planet: string, moonHouse: number | null, planetHouse: number | null) {
  return `${planet} is ${relativeHouse(moonHouse, planetHouse)} houses from Moon.`;
}

function hasKendraPlanets(chart: Chart, moonHouse: number | null) {
  return Object.values(chart.planets).some((planet) => planet.name !== "Moon" && [1, 4, 7, 10].includes(relativeHouse(moonHouse, planet.house)));
}

function sameHouse(chart: Chart, first: string, second: string) {
  return chart.planets[first]?.house !== null && chart.planets[first]?.house === chart.planets[second]?.house;
}

function uniquePlanets(planets: string[]) {
  return Array.from(new Set(planets));
}

function isStrong(planet: Chart["planets"][string]) {
  return planet.dignity.exalted || planet.dignity.own_sign || planet.dignity.moolatrikona || [1, 4, 5, 7, 9, 10, 11].includes(planet.house ?? 0);
}

function DetailList({ title, items, emptyText }: { title: string; items: string[]; emptyText: string }) {
  return (
    <div className="rounded-xl bg-white/[0.04] p-3">
      <p className="font-semibold text-white">{title}</p>
      <ul className="mt-2 space-y-1 text-slate-300">
        {items.length ? items.map((item) => <li key={item}>{item}</li>) : <li className="text-slate-500">{emptyText}</li>}
      </ul>
    </div>
  );
}

function toneForStrength(strength: number) {
  if (strength >= 75) return "good";
  if (strength >= 55) return "info";
  if (strength > 0) return "warn";
  return "default";
}

function clampScore(score: number) {
  return Math.round(Math.max(0, Math.min(100, score)));
}
