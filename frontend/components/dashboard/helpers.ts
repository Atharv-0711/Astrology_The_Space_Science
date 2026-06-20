import type { Chart, PlanetPosition } from "@/lib/types";

export function formatMaybeNumber(value: number | null | undefined, digits = 2) {
  if (value === null || value === undefined) {
    return "-";
  }
  return value.toFixed(digits);
}

export function aspectCountByPlanet(chart: Chart) {
  const counts = new Map<string, number>();
  Object.keys(chart.planets).forEach((planet) => counts.set(planet, 0));
  chart.aspects.forEach((aspect) => {
    counts.set(aspect.source, (counts.get(aspect.source) ?? 0) + 1);
    counts.set(aspect.target, (counts.get(aspect.target) ?? 0) + 1);
  });
  return counts;
}

export function planetScore(planet: PlanetPosition, aspectCount: number) {
  let score = 50;
  if (planet.dignity.exalted) score += 24;
  if (planet.dignity.own_sign) score += 16;
  if (planet.dignity.moolatrikona) score += 14;
  if (planet.dignity.debilitated) score -= 24;
  if (planet.house && [1, 4, 5, 7, 9, 10, 11].includes(planet.house)) score += 8;
  if (planet.house && [6, 8, 12].includes(planet.house)) score -= 8;
  if (planet.retrograde) score -= 5;
  score += Math.min(12, aspectCount * 3);
  return Math.max(0, Math.min(100, score));
}

export function dignityLabels(planet: PlanetPosition) {
  const labels: string[] = [];
  if (planet.dignity.exalted) labels.push("Exalted");
  if (planet.dignity.own_sign) labels.push("Own Sign");
  if (planet.dignity.moolatrikona) labels.push("Moolatrikona");
  if (planet.dignity.debilitated) labels.push("Debilitated");
  if (!labels.length) labels.push("Neutral");
  return labels;
}

export function dateRange(start: string, end: string, localeCode: string) {
  return `${new Date(start).toLocaleDateString(localeCode)} - ${new Date(end).toLocaleDateString(localeCode)}`;
}
