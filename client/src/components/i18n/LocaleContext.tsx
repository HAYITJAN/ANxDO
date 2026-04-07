"use client";

import type { Locale } from "@/lib/i18n/dictionaries";
import { translate } from "@/lib/i18n/dictionaries";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const STORAGE_KEY = "ando-locale";

type Ctx = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
};

const LocaleContext = createContext<Ctx | null>(null);

function readStoredLocale(): Locale {
  if (typeof window === "undefined") return "uz";
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    if (s === "uz" || s === "ru" || s === "en") return s;
  } catch {
    /* ignore */
  }
  return "uz";
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("uz");

  useEffect(() => {
    const next = readStoredLocale();
    setLocaleState(next);
    document.documentElement.lang = next;
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* ignore */
    }
    document.documentElement.lang = l;
  }, []);

  const t = useCallback((key: string) => translate(locale, key), [locale]);

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): Ctx {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}
