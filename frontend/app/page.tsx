"use client";

import Link from "next/link";

import { useI18n } from "@/lib/i18n";

export default function HomePage() {
  const { t } = useI18n();

  return (
    <section className="grid gap-10 lg:grid-cols-[1fr_28rem] lg:items-center">
      <div>
        <p className="text-sm uppercase tracking-[0.4em] text-amber-200/70">
          {t("ui.homeEyebrow")}
        </p>
        <h1 className="mt-4 max-w-4xl text-5xl font-bold tracking-tight text-white md:text-7xl">
          {t("ui.homeTitle")}
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
          {t("ui.homeDescription")}
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/birth-details"
            className="rounded-full bg-amber-200 px-6 py-3 font-semibold text-slate-950 hover:bg-amber-100"
          >
            {t("ui.startChart")}
          </Link>
          <Link
            href="/kundali"
            className="rounded-full border border-white/15 px-6 py-3 font-semibold text-white hover:border-amber-200/60"
          >
            {t("ui.navKundali")}
          </Link>
        </div>
      </div>
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
        <h2 className="text-xl font-semibold text-amber-100">{t("ui.coreMilestone")}</h2>
        <ul className="mt-5 space-y-3 text-sm text-slate-300">
          <li>{t("ui.milestoneD1")}</li>
          <li>{t("ui.milestoneD9")}</li>
          <li>{t("ui.milestoneD10")}</li>
          <li>{t("ui.milestoneVimshottari")}</li>
          <li>{t("ui.milestoneSvg")}</li>
        </ul>
      </div>
    </section>
  );
}
