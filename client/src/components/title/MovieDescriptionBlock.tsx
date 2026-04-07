"use client";

import { useLocale } from "@/components/i18n/LocaleContext";
import { pickMovieDescription } from "@/lib/movieDescription";

export function MovieDescriptionBlock({
  movie,
}: {
  movie: { description?: string; descriptionI18n?: { uz?: string; ru?: string; en?: string } };
}) {
  const { locale } = useLocale();
  const description = pickMovieDescription(movie, locale);
  if (!description) return null;

  return (
    <section className="mt-12 max-w-3xl border-t border-white/[0.07] pt-10">
      <h2 className="text-lg font-semibold text-white">Synopsis</h2>
      <p className="mt-3 text-base leading-relaxed text-zinc-400">{description}</p>
    </section>
  );
}
