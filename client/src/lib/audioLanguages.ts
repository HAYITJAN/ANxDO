/** Audio/tillar ro‘yxati — admin va tomosha tanlovi uchun */
export const AUDIO_LANGUAGE_OPTIONS = [
  { code: "uz", label: "O‘zbek" },
  { code: "ru", label: "Rus" },
  { code: "en", label: "Ingliz" },
  { code: "fr", label: "Fransuz" },
  { code: "de", label: "Nemis" },
  { code: "es", label: "Ispan" },
  { code: "it", label: "Italyan" },
  { code: "tr", label: "Turk" },
  { code: "ja", label: "Yapon" },
  { code: "ko", label: "Koreys" },
  { code: "zh", label: "Xitoy" },
  { code: "hi", label: "Hind" },
  { code: "ar", label: "Arab" },
  { code: "multi", label: "Ko‘p tilli / boshqa" },
] as const;

export type AudioLangCode = (typeof AUDIO_LANGUAGE_OPTIONS)[number]["code"];

export function labelForLang(code: string): string {
  const f = AUDIO_LANGUAGE_OPTIONS.find((x) => x.code === code);
  return f?.label ?? code.toUpperCase();
}

/** Til kodi → bayroq (emoji) — UI da kichik ko‘rsatish uchun */
export function flagEmojiForLang(code: string): string {
  const c = String(code || "").toLowerCase().trim();
  const map: Record<string, string> = {
    uz: "🇺🇿",
    ru: "🇷🇺",
    en: "🇬🇧",
    fr: "🇫🇷",
    de: "🇩🇪",
    es: "🇪🇸",
    it: "🇮🇹",
    tr: "🇹🇷",
    ja: "🇯🇵",
    ko: "🇰🇷",
    zh: "🇨🇳",
    hi: "🇮🇳",
    ar: "🇸🇦",
    multi: "🌐",
    default: "🎬",
  };
  return map[c] ?? "🎬";
}
