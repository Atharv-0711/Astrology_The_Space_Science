"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import englishFallbackCatalog from "@/public/locales/en/common.json";

type LocaleDirection = "ltr" | "rtl";

export type SupportedLocale = {
  code: string;
  name: string;
  nativeName: string;
  region: "india" | "global";
  direction: LocaleDirection;
};

type CatalogValue = string | Catalog | undefined;
type Catalog = { [key: string]: CatalogValue };
type InterpolationValues = Record<string, string | number>;

const LANGUAGE_STORAGE_KEY = "jyotish-language";
const LANGUAGE_COOKIE_NAME = "jyotish_language";
const DEFAULT_LOCALE = "en";
const RTL_LOCALES = new Set(["ar", "ur", "ks", "sd"]);

export const SUPPORTED_LOCALES: SupportedLocale[] = [
  { code: "en", name: "English", nativeName: "English", region: "india", direction: "ltr" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", region: "india", direction: "ltr" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা", region: "india", direction: "ltr" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు", region: "india", direction: "ltr" },
  { code: "mr", name: "Marathi", nativeName: "मराठी", region: "india", direction: "ltr" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்", region: "india", direction: "ltr" },
  { code: "ur", name: "Urdu", nativeName: "اردو", region: "india", direction: "rtl" },
  { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી", region: "india", direction: "ltr" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ", region: "india", direction: "ltr" },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളം", region: "india", direction: "ltr" },
  { code: "or", name: "Odia", nativeName: "ଓଡ଼ିଆ", region: "india", direction: "ltr" },
  { code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ", region: "india", direction: "ltr" },
  { code: "as", name: "Assamese", nativeName: "অসমীয়া", region: "india", direction: "ltr" },
  { code: "sa", name: "Sanskrit", nativeName: "संस्कृतम्", region: "india", direction: "ltr" },
  { code: "kok", name: "Konkani", nativeName: "कोंकणी", region: "india", direction: "ltr" },
  { code: "mni", name: "Manipuri", nativeName: "মৈতৈলোন্", region: "india", direction: "ltr" },
  { code: "brx", name: "Bodo", nativeName: "बड़ो", region: "india", direction: "ltr" },
  { code: "doi", name: "Dogri", nativeName: "डोगरी", region: "india", direction: "ltr" },
  { code: "mai", name: "Maithili", nativeName: "मैथिली", region: "india", direction: "ltr" },
  { code: "sat", name: "Santali", nativeName: "ᱥᱟᱱᱛᱟᱲᱤ", region: "india", direction: "ltr" },
  { code: "ks", name: "Kashmiri", nativeName: "کٲشُر", region: "india", direction: "rtl" },
  { code: "sd", name: "Sindhi", nativeName: "سنڌي", region: "india", direction: "rtl" },
  { code: "ne", name: "Nepali", nativeName: "नेपाली", region: "india", direction: "ltr" },
  { code: "fr", name: "French", nativeName: "Français", region: "global", direction: "ltr" },
  { code: "es", name: "Spanish", nativeName: "Español", region: "global", direction: "ltr" },
  { code: "de", name: "German", nativeName: "Deutsch", region: "global", direction: "ltr" },
  { code: "pt", name: "Portuguese", nativeName: "Português", region: "global", direction: "ltr" },
  { code: "ru", name: "Russian", nativeName: "Русский", region: "global", direction: "ltr" },
  { code: "ar", name: "Arabic", nativeName: "العربية", region: "global", direction: "rtl" },
  { code: "ja", name: "Japanese", nativeName: "日本語", region: "global", direction: "ltr" },
  { code: "ko", name: "Korean", nativeName: "한국어", region: "global", direction: "ltr" },
  { code: "zh-Hans", name: "Chinese Simplified", nativeName: "简体中文", region: "global", direction: "ltr" },
  { code: "zh-Hant", name: "Chinese Traditional", nativeName: "繁體中文", region: "global", direction: "ltr" },
  { code: "th", name: "Thai", nativeName: "ไทย", region: "global", direction: "ltr" },
  { code: "vi", name: "Vietnamese", nativeName: "Tiếng Việt", region: "global", direction: "ltr" },
  { code: "id", name: "Indonesian", nativeName: "Bahasa Indonesia", region: "global", direction: "ltr" },
  { code: "tr", name: "Turkish", nativeName: "Türkçe", region: "global", direction: "ltr" },
  { code: "it", name: "Italian", nativeName: "Italiano", region: "global", direction: "ltr" },
  { code: "nl", name: "Dutch", nativeName: "Nederlands", region: "global", direction: "ltr" },
];

const LOCALE_BY_CODE = new Map(SUPPORTED_LOCALES.map((locale) => [locale.code, locale]));

type I18nContextValue = {
  locale: SupportedLocale;
  locales: SupportedLocale[];
  setLocale: (code: string) => void;
  t: (key: string, values?: InterpolationValues) => string;
  term: (layer: string, canonical: string) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);
const ENGLISH_FALLBACK_CATALOG = englishFallbackCatalog as Catalog;
const ENABLE_I18N_DEBUG = process.env.NODE_ENV !== "production";

export function I18nProvider({ children }: { children: ReactNode }) {
  const [localeCode, setLocaleCode] = useState(DEFAULT_LOCALE);
  const [englishCatalog, setEnglishCatalog] = useState<Catalog>(ENGLISH_FALLBACK_CATALOG);
  const [activeCatalog, setActiveCatalog] = useState<Catalog>({});
  const missingKeysRef = useRef(new Set<string>());

  useEffect(() => {
    const storedLocale = normalizeLocaleCode(window.localStorage.getItem(LANGUAGE_STORAGE_KEY));
    const browserLocale = normalizeLocaleCode(window.navigator.language);
    setLocaleCode(storedLocale ?? browserLocale ?? DEFAULT_LOCALE);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadCatalogs() {
      const [english, active] = await Promise.all([
        fetchCatalog(DEFAULT_LOCALE),
        localeCode === DEFAULT_LOCALE ? Promise.resolve({}) : fetchCatalog(localeCode),
      ]);

      if (!cancelled) {
        const cleanEnglish = sanitizeCatalog(english);
        const cleanActive = sanitizeCatalog(active);
        setEnglishCatalog(Object.keys(cleanEnglish).length ? cleanEnglish : ENGLISH_FALLBACK_CATALOG);
        setActiveCatalog(cleanActive);
        logI18nDebug("catalogs-loaded", {
          currentLanguage: localeCode,
          loadedLocale: localeCode,
          englishPath: catalogPath(DEFAULT_LOCALE),
          activePath: localeCode === DEFAULT_LOCALE ? "(default locale)" : catalogPath(localeCode),
          englishKeysLoaded: countTranslationKeys(cleanEnglish),
          activeKeysLoaded: countTranslationKeys(cleanActive),
          missingKeysCount: missingKeysRef.current.size,
        });
      }
    }

    void loadCatalogs();
    return () => {
      cancelled = true;
    };
  }, [localeCode]);

  const locale = LOCALE_BY_CODE.get(localeCode) ?? LOCALE_BY_CODE.get(DEFAULT_LOCALE)!;
  const catalog = useMemo(() => deepMerge(englishCatalog, activeCatalog), [englishCatalog, activeCatalog]);

  useEffect(() => {
    document.documentElement.lang = locale.code;
    document.documentElement.dir = locale.direction;
    document.cookie = `${LANGUAGE_COOKIE_NAME}=${encodeURIComponent(locale.code)}; Path=/; Max-Age=31536000; SameSite=Lax`;
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, locale.code);
  }, [locale]);

  const setLocale = useCallback((code: string) => {
    const nextLocale = normalizeLocaleCode(code) ?? DEFAULT_LOCALE;
    logI18nDebug("language-change", {
      currentLanguage: nextLocale,
      loadedLocale: localeCode,
      translationFilePath: catalogPath(nextLocale),
      missingKeysCount: missingKeysRef.current.size,
    });
    setLocaleCode(nextLocale);
    missingKeysRef.current.clear();
  }, [localeCode]);

  const t = useCallback(
    (key: string, values?: InterpolationValues) => {
      const value = readCatalogValue(catalog, key);
      if (isUsableTranslation(value)) {
        return interpolate(value, values);
      }

      const fallback = readCatalogValue(ENGLISH_FALLBACK_CATALOG, key);
      if (isUsableTranslation(fallback)) {
        trackMissingKey(missingKeysRef.current, locale.code, key);
        return interpolate(fallback, values);
      }

      trackMissingKey(missingKeysRef.current, locale.code, key);
      return interpolate(lastKeySegment(key), values);
    },
    [catalog, locale.code],
  );

  const term = useCallback(
    (layer: string, canonical: string) => {
      const value = readCatalogValue(catalog, `astrology.${layer}.${canonical}`);
      if (isUsableTranslation(value)) {
        return value;
      }

      const key = `astrology.${layer}.${canonical}`;
      const fallback = readCatalogValue(ENGLISH_FALLBACK_CATALOG, key);
      if (isUsableTranslation(fallback)) {
        trackMissingKey(missingKeysRef.current, locale.code, key);
        return fallback;
      }

      trackMissingKey(missingKeysRef.current, locale.code, key);
      return canonical;
    },
    [catalog, locale.code],
  );

  const contextValue = useMemo<I18nContextValue>(
    () => ({ locale, locales: SUPPORTED_LOCALES, setLocale, t, term }),
    [locale, setLocale, t, term],
  );

  return <I18nContext.Provider value={contextValue}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const value = useContext(I18nContext);
  if (!value) {
    throw new Error("useI18n must be used inside I18nProvider");
  }
  return value;
}

export function getLocaleDirection(code: string): LocaleDirection {
  return RTL_LOCALES.has(code) ? "rtl" : "ltr";
}

function normalizeLocaleCode(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  const exact = LOCALE_BY_CODE.get(value);
  if (exact) {
    return exact.code;
  }

  const language = value.split("-")[0].toLowerCase();
  return LOCALE_BY_CODE.get(language)?.code ?? null;
}

async function fetchCatalog(code: string): Promise<Catalog> {
  const path = catalogPath(code);
  try {
    logI18nDebug("fetch-start", {
      currentLanguage: code,
      loadedLocale: code,
      translationFilePath: path,
    });

    const response = await fetch(path, { cache: "no-store" });
    if (!response.ok) {
      logI18nDebug("fetch-failed", {
        currentLanguage: code,
        loadedLocale: code,
        translationFilePath: path,
        status: response.status,
      });
      return {};
    }
    const catalog = (await response.json()) as Catalog;
    logI18nDebug("fetch-success", {
      currentLanguage: code,
      loadedLocale: code,
      translationFilePath: path,
      translationKeysLoaded: countTranslationKeys(catalog),
    });
    return catalog;
  } catch {
    logI18nDebug("fetch-error", {
      currentLanguage: code,
      loadedLocale: code,
      translationFilePath: path,
    });
    return {};
  }
}

function deepMerge(base: Catalog, override: Catalog): Catalog {
  const merged: Catalog = { ...base };

  for (const [key, value] of Object.entries(override)) {
    if (isCatalog(value) && isCatalog(base[key])) {
      merged[key] = deepMerge(base[key], value);
    } else if (value !== undefined) {
      merged[key] = value;
    }
  }

  return merged;
}

function readCatalogValue(catalog: Catalog, key: string): CatalogValue {
  return key.split(".").reduce<CatalogValue>((current, segment) => {
    if (!isCatalog(current)) {
      return undefined;
    }
    return current[segment];
  }, catalog);
}

function isCatalog(value: CatalogValue): value is Catalog {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isUsableTranslation(value: CatalogValue): value is string {
  return typeof value === "string" && value.trim() !== "" && !isQuestionMarkPlaceholder(value);
}

function isQuestionMarkPlaceholder(value: string) {
  return /^[?\s]+$/.test(value) || /\?{3,}/.test(value);
}

function sanitizeCatalog(catalog: Catalog): Catalog {
  const sanitized: Catalog = {};

  for (const [key, value] of Object.entries(catalog)) {
    if (typeof value === "string") {
      if (!isQuestionMarkPlaceholder(value)) {
        sanitized[key] = value;
      }
      continue;
    }

    if (isCatalog(value)) {
      const nested = sanitizeCatalog(value);
      if (Object.keys(nested).length > 0) {
        sanitized[key] = nested;
      }
    }
  }

  return sanitized;
}

function countTranslationKeys(catalog: Catalog): number {
  return Object.values(catalog).reduce((count, value) => {
    if (typeof value === "string") {
      return isQuestionMarkPlaceholder(value) ? count : count + 1;
    }
    return isCatalog(value) ? count + countTranslationKeys(value) : count;
  }, 0);
}

function catalogPath(code: string) {
  return `/locales/${code}/common.json`;
}

function lastKeySegment(key: string) {
  return key.split(".").at(-1) ?? key;
}

function trackMissingKey(missingKeys: Set<string>, localeCode: string, key: string) {
  if (!missingKeys.has(key)) {
    missingKeys.add(key);
    logI18nDebug("missing-key", {
      currentLanguage: localeCode,
      missingKey: key,
      missingKeysCount: missingKeys.size,
    });
  }
}

function logI18nDebug(event: string, payload: Record<string, unknown>) {
  if (!ENABLE_I18N_DEBUG) {
    return;
  }
  console.info(`[i18n:${event}]`, payload);
}

function interpolate(value: string, values?: InterpolationValues) {
  if (!values) {
    return value;
  }

  return value.replace(/\{(\w+)\}/g, (match, key: string) => String(values[key] ?? match));
}
