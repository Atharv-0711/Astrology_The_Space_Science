"use client";

import { BirthDetailsForm } from "@/components/forms/BirthDetailsForm";
import { useI18n } from "@/lib/i18n";

export default function BirthDetailsPage() {
  const { t } = useI18n();

  return (
    <section>
      <p className="text-sm uppercase tracking-[0.3em] text-amber-200/70">
        {t("ui.birthDetailsEyebrow")}
      </p>
      <h1 className="mt-3 text-4xl font-bold text-white">{t("ui.createChartTitle")}</h1>
      <p className="mt-4 max-w-2xl text-slate-300">
        {t("ui.birthDetailsHelp")}
      </p>
      <div className="mt-8">
        <BirthDetailsForm />
      </div>
    </section>
  );
}
