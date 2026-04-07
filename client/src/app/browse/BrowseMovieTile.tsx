"use client";

import type { MovieListItem } from "@/lib/movies";
import { pickMovieTitle } from "@/lib/movieDescription";
import { useLocale } from "@/components/i18n/LocaleContext";
import Link from "next/link";

export function BrowseMovieTile({ movie }: { movie: MovieListItem }) {
  const { locale } = useLocale();
  const title = pickMovieTitle(movie, locale) || movie.title || "Kontent";

  return (
    <Link href={`/title/${movie._id}`} className="group">
      <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-zinc-800 ring-1 ring-white/10 transition group-hover:ring-fuchsia-500/50">
        {movie.posterUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={movie.posterUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center p-2 text-center text-xs text-zinc-500">{title}</div>
        )}
      </div>
      <p className="mt-2 line-clamp-2 text-sm text-zinc-300 group-hover:text-white">{title}</p>
    </Link>
  );
}
