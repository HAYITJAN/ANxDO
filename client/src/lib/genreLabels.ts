import type { Locale } from "@/lib/i18n/dictionaries";

/** Bazada saqlangan janr nomlari (default) — boshqa tillardagi ko‘rinish */
const GENRE_UZ_TO_LOCALE: Record<string, Record<Locale, string>> = {
  Dorama: { uz: "Dorama", ru: "Дорама", en: "Dorama" },
  Kamediya: { uz: "Kamediya", ru: "Комедия", en: "Comedy" },
  Romantika: { uz: "Romantika", ru: "Романтика", en: "Romance" },
  Triller: { uz: "Triller", ru: "Триллер", en: "Thriller" },
  Fantastika: { uz: "Fantastika", ru: "Фантастика", en: "Fantasy" },
  Jangari: { uz: "Jangari", ru: "Боевик", en: "Action" },
  Detektiv: { uz: "Detektiv", ru: "Детектив", en: "Detective" },
  Drama: { uz: "Drama", ru: "Драма", en: "Drama" },
};

export function genreLabelForLocale(storedName: string, locale: Locale): string {
  const key = storedName.trim();
  const row = GENRE_UZ_TO_LOCALE[key];
  if (row) return row[locale] ?? row.uz;
  return storedName;
}
