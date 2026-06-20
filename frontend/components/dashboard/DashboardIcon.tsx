export type DashboardIconName =
  | "panchanga"
  | "houses"
  | "yoga"
  | "strength"
  | "timeline"
  | "marriage"
  | "career"
  | "divisional"
  | "aspects"
  | "transit"
  | "varshphal"
  | "life";

export function DashboardIcon({ name }: { name: DashboardIconName }) {
  const path = ICON_PATHS[name];
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-none stroke-current stroke-2">
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  );
}

const ICON_PATHS: Record<DashboardIconName, string> = {
  panchanga: "M12 3v3m0 12v3m9-9h-3M6 12H3m15.36-6.36-2.12 2.12M7.76 16.24l-2.12 2.12m12.72 0-2.12-2.12M7.76 7.76 5.64 5.64M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z",
  houses: "M3 10.5 12 3l9 7.5V21H3V10.5Zm6 10.5v-6h6v6",
  yoga: "M12 3 9.5 9.5 3 12l6.5 2.5L12 21l2.5-6.5L21 12l-6.5-2.5L12 3Z",
  strength: "M4 20V10m5 10V4m5 16v-7m5 7V8",
  timeline: "M4 6h16M4 12h16M4 18h16M8 6v12m8-12v12",
  marriage: "M8.5 7.5a3.5 3.5 0 0 1 5 0l.5.5.5-.5a3.5 3.5 0 1 1 5 5L12 20 4.5 12.5a3.5 3.5 0 0 1 4-5Z",
  career: "M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2m-9 0h12v13H3V7h3Zm0 5h12",
  divisional: "M4 4h7v7H4V4Zm9 0h7v7h-7V4ZM4 13h7v7H4v-7Zm9 0h7v7h-7v-7Z",
  aspects: "M5 12h14M12 5v14M7 7l10 10M17 7 7 17",
  transit: "M3 12a9 9 0 0 1 15.36-6.36M21 12a9 9 0 0 1-15.36 6.36M18 3v5h-5M6 21v-5h5",
  varshphal: "M12 3a9 9 0 1 0 9 9h-9V3Z",
  life: "M12 21s-7-4.35-7-11a7 7 0 0 1 14 0c0 6.65-7 11-7 11Z",
};
