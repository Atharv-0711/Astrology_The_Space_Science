"use client";

import { useI18n } from "@/lib/i18n";

export function LanguageSwitcher() {
  const { locale, locales, setLocale, t } = useI18n();

  return (
    <label className="flex items-center gap-2 text-xs text-slate-300">
      <span className="sr-only">{t("ui.selectLanguage")}</span>
      <span aria-hidden="true">{t("ui.language")}</span>
      <select
        value={locale.code}
        onChange={(event) => setLocale(event.target.value)}
        className="rounded-full border border-white/10 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-amber-200/60"
        aria-label={t("ui.selectLanguage")}
      >
        <optgroup label={t("ui.indianLanguages")}>
          {locales
            .filter((item) => item.region === "india")
            .map((item) => (
              <option key={item.code} value={item.code}>
                {item.nativeName}
              </option>
            ))}
        </optgroup>
        <optgroup label={t("ui.globalLanguages")}>
          {locales
            .filter((item) => item.region === "global")
            .map((item) => (
              <option key={item.code} value={item.code}>
                {item.nativeName}
              </option>
            ))}
        </optgroup>
      </select>
    </label>
  );
}
