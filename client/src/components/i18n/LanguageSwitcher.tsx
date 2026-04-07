"use client";

import { useLocale } from "@/components/i18n/LocaleContext";
import type { Locale } from "@/lib/i18n/dictionaries";
import { localeLabels, locales } from "@/lib/i18n/dictionaries";
import { useEffect, useRef, useState } from "react";

function localeCode(code: Locale) {
  return code === "uz" ? "UZ" : code === "ru" ? "RU" : "EN";
}

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useLocale();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  return (
    <div className="relative shrink-0" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-10 min-h-[44px] items-center gap-1 rounded-xl border border-white/10 bg-[#0c0a12]/90 px-2.5 pr-2 text-xs font-semibold uppercase tracking-wide text-white shadow-sm transition hover:border-white/15 hover:bg-[#12101a] sm:min-h-0 md:h-9 md:min-h-[36px] md:px-3"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={t("header.lang")}
      >
        <span>{localeCode(locale)}</span>
        <svg
          className={`h-3.5 w-3.5 shrink-0 text-zinc-400 transition ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open ? (
        <ul
          className="absolute right-0 top-full z-[60] mt-1.5 min-w-[10.5rem] rounded-xl border border-white/10 bg-[#12101a] py-1 shadow-xl shadow-black/50"
          role="listbox"
          aria-label={t("header.lang")}
        >
          {locales.map((code) => {
            const active = locale === code;
            return (
              <li key={code} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => {
                    setLocale(code);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-sm transition sm:py-2 ${
                    active
                      ? "bg-white/[0.08] text-white"
                      : "text-zinc-300 hover:bg-white/[0.06] hover:text-white"
                  }`}
                >
                  <span className="font-semibold tabular-nums">{localeCode(code)}</span>
                  <span className="truncate text-xs text-zinc-400">{localeLabels[code]}</span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
