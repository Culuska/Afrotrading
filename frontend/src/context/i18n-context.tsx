"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { LOCALE_INFO, DEFAULT_LOCALE, type Locale } from "@/lib/i18n/locales";
import type { Dictionary } from "@/lib/i18n/dictionary";
import { en } from "@/lib/i18n/dictionaries/en";
import { ar } from "@/lib/i18n/dictionaries/ar";
import { so } from "@/lib/i18n/dictionaries/so";

const DICTIONARIES: Record<Locale, Dictionary> = { en, ar, so };
const STORAGE_KEY = "afrotrading_locale";

interface I18nContextValue {
  locale: Locale;
  dict: Dictionary;
  dir: "ltr" | "rtl";
  setLocale: (locale: Locale) => void;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

function applyDocumentAttrs(locale: Locale) {
  if (typeof document === "undefined") return;
  document.documentElement.lang = locale;
  document.documentElement.dir = LOCALE_INFO[locale].dir;
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (stored && stored in LOCALE_INFO) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- initial locale hydration from localStorage on mount
      setLocaleState(stored);
      applyDocumentAttrs(stored);
    }
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
    applyDocumentAttrs(next);
  }, []);

  const value: I18nContextValue = {
    locale,
    dict: DICTIONARIES[locale],
    dir: LOCALE_INFO[locale].dir,
    setLocale,
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
