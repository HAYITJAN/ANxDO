"use client";

import type { Locale } from "@/lib/i18n/dictionaries";
import { localeLabels, locales } from "@/lib/i18n/dictionaries";
import { useLocale } from "@/components/i18n/LocaleContext";

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useLocale();

  return (
    <div className="flex items-center gap-0.5 rounded-lg border border-white/10 bg-[#0c0a12]/90 p-0.5">
      <span className="sr-only">{t("header.lang")}</span>
      {locales.map((code: Locale) => (
        <button
          key={code}
          type="button"
          onClick={() => setLocale(code)}
          className={`rounded-md px-2 py-1 text-[11px] font-semibold uppercase tracking-wide transition sm:px-2.5 sm:text-xs ${
            locale === code
              ? "bg-gradient-to-r from-fuchsia-600/90 to-violet-600/90 text-white shadow-sm"
              : "text-zinc-500 hover:text-zinc-200"
          }`}
        >
          {code === "uz" ? "UZ" : code === "ru" ? "RU" : "EN"}
        </button>
      ))}
      <span className="hidden px-1 text-[10px] text-zinc-600 lg:inline" title="">
        {localeLabels[locale]}
      </span>
    </div>
  );
}
