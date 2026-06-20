"use client";

import type { ReactNode } from "react";

import { DashboardIcon, type DashboardIconName } from "./DashboardIcon";

type DashboardSectionProps = {
  id: string;
  title: string;
  subtitle: string;
  icon: DashboardIconName;
  children: ReactNode;
  expanded: boolean;
  onToggle: () => void;
  wide?: boolean;
};

export function DashboardSection({
  id,
  title,
  subtitle,
  icon,
  children,
  expanded,
  onToggle,
  wide = false,
}: DashboardSectionProps) {
  return (
    <section
      id={id}
      className={`rounded-3xl border border-white/10 bg-white/[0.04] shadow-2xl shadow-black/20 ${
        wide ? "lg:col-span-2" : ""
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
        aria-expanded={expanded}
      >
        <span className="flex min-w-0 items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-amber-200/15 text-amber-100">
            <DashboardIcon name={icon} />
          </span>
          <span className="min-w-0">
            <span className="block text-lg font-semibold text-white">{title}</span>
            <span className="mt-1 block text-sm text-slate-400">{subtitle}</span>
          </span>
        </span>
        <span className={`text-2xl text-amber-100 transition ${expanded ? "rotate-45" : ""}`}>+</span>
      </button>
      {expanded ? <div className="border-t border-white/10 p-5">{children}</div> : null}
    </section>
  );
}
