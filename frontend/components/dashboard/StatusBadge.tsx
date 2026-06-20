import type { ReactNode } from "react";

type StatusTone = "default" | "good" | "warn" | "danger" | "info";

export function StatusBadge({ children, tone = "default" }: { children: ReactNode; tone?: StatusTone }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${TONE_CLASSES[tone]}`}>
      {children}
    </span>
  );
}

const TONE_CLASSES: Record<StatusTone, string> = {
  default: "bg-white/10 text-slate-200",
  good: "bg-emerald-300/15 text-emerald-100",
  warn: "bg-amber-300/15 text-amber-100",
  danger: "bg-red-300/15 text-red-100",
  info: "bg-sky-300/15 text-sky-100",
};
