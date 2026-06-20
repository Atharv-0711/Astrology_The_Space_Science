"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, type ReactNode, useState } from "react";

import { useI18n } from "@/lib/i18n";
import type { BirthData, ChartRequest } from "@/lib/types";

const STORAGE_KEY = "vedic-chart-request";

const defaultBirthData: BirthData = {
  name: "Test Native",
  gender: "-",
  birth_date: "1990-01-01",
  birth_time: "12:00:00",
  place_of_birth: "New Delhi",
  country: "India",
  latitude: 28.6139,
  longitude: 77.209,
  timezone: 5.5,
};

export function loadStoredChartRequest(): ChartRequest | null {
  if (typeof window === "undefined") {
    return null;
  }

  const value = window.localStorage.getItem(STORAGE_KEY);
  if (!value) {
    return null;
  }

  try {
    const request = JSON.parse(value) as ChartRequest;
    return {
      ...request,
      birth_data: normalizeBirthData(request.birth_data),
    };
  } catch {
    return null;
  }
}

function normalizeBirthData(birthData: Partial<BirthData>): BirthData {
  return {
    ...defaultBirthData,
    ...birthData,
  };
}

export function BirthDetailsForm() {
  const router = useRouter();
  const { t } = useI18n();
  const [birthData, setBirthData] = useState<BirthData>(() => {
    if (typeof window === "undefined") {
      return defaultBirthData;
    }
    return loadStoredChartRequest()?.birth_data ?? defaultBirthData;
  });
  const [includeOuterPlanets, setIncludeOuterPlanets] = useState(false);

  function updateField<TKey extends keyof BirthData>(key: TKey, value: BirthData[TKey]) {
    setBirthData((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const request: ChartRequest = {
      birth_data: birthData,
      settings: {
        include_outer_planets: includeOuterPlanets,
        enable_vedic_aspects: true,
        enable_western_aspects: false,
      },
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(request));
    router.push("/kundali");
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
      <div className="grid gap-5 md:grid-cols-2">
        <Field label={t("ui.name")}>
          <input
            value={birthData.name}
            onChange={(event) => updateField("name", event.target.value)}
            className="input"
            required
          />
        </Field>
        <Field label={t("ui.gender")}>
          <select
            value={birthData.gender}
            onChange={(event) => updateField("gender", event.target.value)}
            className="input"
            required
          >
            <option value="-">{t("ui.notSpecified")}</option>
            <option value="Female">{t("ui.female")}</option>
            <option value="Male">{t("ui.male")}</option>
            <option value="Other">{t("ui.other")}</option>
          </select>
        </Field>
        <Field label={t("ui.date")}>
          <input
            type="date"
            value={birthData.birth_date}
            onChange={(event) => updateField("birth_date", event.target.value)}
            className="input"
            required
          />
        </Field>
        <Field label={t("ui.time")}>
          <input
            type="time"
            step="1"
            value={birthData.birth_time}
            onChange={(event) => updateField("birth_time", event.target.value)}
            className="input"
            required
          />
        </Field>
        <Field label={t("ui.placeOfBirth")}>
          <input
            value={birthData.place_of_birth}
            onChange={(event) => updateField("place_of_birth", event.target.value)}
            className="input"
            required
          />
        </Field>
        <Field label={t("ui.country")}>
          <input
            value={birthData.country}
            onChange={(event) => updateField("country", event.target.value)}
            className="input"
            required
          />
        </Field>
        <Field label={t("ui.timezone")}>
          <input
            type="number"
            step="0.25"
            value={birthData.timezone}
            onChange={(event) => updateField("timezone", Number(event.target.value))}
            className="input"
            required
          />
        </Field>
        <Field label={t("ui.latitude")}>
          <input
            type="number"
            step="0.0001"
            value={birthData.latitude}
            onChange={(event) => updateField("latitude", Number(event.target.value))}
            className="input"
            required
          />
        </Field>
        <Field label={t("ui.longitude")}>
          <input
            type="number"
            step="0.0001"
            value={birthData.longitude}
            onChange={(event) => updateField("longitude", Number(event.target.value))}
            className="input"
            required
          />
        </Field>
      </div>

      <label className="mt-5 flex items-center gap-3 text-sm text-slate-300">
        <input
          type="checkbox"
          checked={includeOuterPlanets}
          onChange={(event) => setIncludeOuterPlanets(event.target.checked)}
          className="h-4 w-4 rounded border-white/20 bg-black"
        />
        {t("ui.includeOuterPlanets")}
      </label>

      <button
        type="submit"
        className="mt-8 rounded-full bg-amber-200 px-6 py-3 font-semibold text-slate-950 hover:bg-amber-100"
      >
        {t("ui.generateCharts")}
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-2 text-sm text-slate-300">
      {label}
      {children}
    </label>
  );
}
