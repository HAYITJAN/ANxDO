"use client";

import { useLocale } from "@/components/i18n/LocaleContext";
import { genreLabelForLocale } from "@/lib/genreLabels";
import { pickMovieTitle } from "@/lib/movieDescription";
import { coerceGenres } from "@/lib/movies";

export function TitleDetailMeta({
  movie,
}: {
  movie: {
    title?: string;
    titleI18n?: { uz?: string; ru?: string; en?: string };
    genre?: string[];
  };
}) {
  const { locale } = useLocale();
  const displayTitle = pickMovieTitle(movie, locale) || "Kontent";
  const genres = coerceGenres(movie.genre);

  return (
    <>
      <h1 className="text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl">
        {displayTitle}
      </h1>

      {genres.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {genres.map((g, i) => (
            <span
              key={`${g}-${i}`}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-zinc-300"
            >
              {genreLabelForLocale(g, locale)}
            </span>
          ))}
        </div>
      ) : null}
    </>
  );
}
