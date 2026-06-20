import type { Chart } from "@/lib/types";

export function PanchangaCard({
  chart,
  term,
}: {
  chart: Chart;
  term: (layer: string, canonical: string) => string;
}) {
  const panchanga = calculatePanchanga(chart);
  const moon = chart.planets.Moon;
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Row label="Tithi" value={panchanga.tithi} />
      <Row label="Paksha" value={panchanga.paksha} />
      <Row label="Nakshatra" value={`${term("nakshatras", moon.zodiac.nakshatra)} Pada ${moon.zodiac.pada}`} />
      <Row label="Pada" value={String(moon.zodiac.pada)} />
      <Row label="Yoga" value={panchanga.yoga} />
      <Row label="Karana" value={panchanga.karana} />
      <Row label="Vaar" value={panchanga.vaar} />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-black/20 p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-amber-200/70">{label}</p>
      <p className="mt-2 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

const TITHI_NAMES = [
  "Pratipada",
  "Dwitiya",
  "Tritiya",
  "Chaturthi",
  "Panchami",
  "Shashthi",
  "Saptami",
  "Ashtami",
  "Navami",
  "Dashami",
  "Ekadashi",
  "Dwadashi",
  "Trayodashi",
  "Chaturdashi",
  "Purnima",
  "Pratipada",
  "Dwitiya",
  "Tritiya",
  "Chaturthi",
  "Panchami",
  "Shashthi",
  "Saptami",
  "Ashtami",
  "Navami",
  "Dashami",
  "Ekadashi",
  "Dwadashi",
  "Trayodashi",
  "Chaturdashi",
  "Amavasya",
];

const YOGA_NAMES = [
  "Vishkambha",
  "Priti",
  "Ayushman",
  "Saubhagya",
  "Shobhana",
  "Atiganda",
  "Sukarma",
  "Dhriti",
  "Shoola",
  "Ganda",
  "Vriddhi",
  "Dhruva",
  "Vyaghata",
  "Harshana",
  "Vajra",
  "Siddhi",
  "Vyatipata",
  "Variyana",
  "Parigha",
  "Shiva",
  "Siddha",
  "Sadhya",
  "Shubha",
  "Shukla",
  "Brahma",
  "Indra",
  "Vaidhriti",
];

const MOVABLE_KARANAS = ["Bava", "Balava", "Kaulava", "Taitila", "Garaja", "Vanija", "Vishti"];
const FIXED_KARANAS: Record<number, string> = {
  0: "Kimstughna",
  57: "Shakuni",
  58: "Chatushpada",
  59: "Naga",
};

function calculatePanchanga(chart: Chart) {
  const sun = chart.planets.Sun.longitude;
  const moon = chart.planets.Moon.longitude;
  const lunarDistance = normalize(moon - sun);
  const tithiIndex = Math.min(29, Math.floor(lunarDistance / 12));
  const halfTithiIndex = Math.min(59, Math.floor(lunarDistance / 6));
  const yogaIndex = Math.min(26, Math.floor(normalize(sun + moon) / (360 / 27)));
  return {
    tithi: TITHI_NAMES[tithiIndex],
    paksha: tithiIndex < 15 ? "Shukla Paksha" : "Krishna Paksha",
    yoga: YOGA_NAMES[yogaIndex],
    karana: FIXED_KARANAS[halfTithiIndex] ?? MOVABLE_KARANAS[(halfTithiIndex - 1) % MOVABLE_KARANAS.length],
    vaar: new Date(chart.birth_data.birth_date).toLocaleDateString(undefined, { weekday: "long" }),
  };
}

function normalize(value: number) {
  return ((value % 360) + 360) % 360;
}
