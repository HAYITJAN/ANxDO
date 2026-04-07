import type { Locale } from "@/lib/i18n/dictionaries";

type DescriptionShape = {
  description?: string;
  descriptionI18n?: {
    uz?: string;
    ru?: string;
    en?: string;
  };
};

function clean(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

export function pickMovieDescription(movie: DescriptionShape, locale: Locale): string {
  const i18n = movie.descriptionI18n || {};
  const localized = clean(i18n[locale]);
  if (localized) return localized;
  return clean(movie.description);
}
