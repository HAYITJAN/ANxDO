"use client";

import Link from "next/link";
import { useLocale } from "@/components/i18n/LocaleContext";
import { genreLabelForLocale } from "@/lib/genreLabels";
import { pickMovieTitle } from "@/lib/movieDescription";
import { coerceGenres, type MovieListItem } from "@/lib/movies";

type Props = {
  movie: MovieListItem;
  /** true bo‘lsa va `movie.newRelease` bo‘lsa — NEW belgisi */
  showNewBadge?: boolean;
  /** Qator kengligi: `row` — bosh sahifa qatorlari, `featured` — kengroq */
  size?: "row" | "featured";
};

/**
 * Poster: nom pastda emas, faqat sichqoncha/banner ustida hover qilganda overlay.
 */
export function MoviePosterCard({ movie, showNewBadge, size = "row" }: Props) {
  const { locale } = useLocale();
  const genres = coerceGenres(movie.genre).slice(0, 2);
  const title = pickMovieTitle(movie, locale) || "Kontent";
  const showNew = Boolean(showNewBadge && movie.newRelease);

  const wrap =
    size === "featured"
      ? "w-[198px] shrink-0 sm:w-[222px] md:w-[238px] lg:w-[246px]"
      : "w-[148px] shrink-0 sm:w-[164px] md:w-[178px] lg:w-[186px]";

  return (
    <Link
      href={`/title/${movie._id}`}
      aria-label={title}
      title={title}
      className={`group relative z-0 isolate transform-gpu rounded-2xl bg-zinc-900 shadow-card ring-1 ring-white/[0.08] transition duration-300 ease-out hover:z-30 hover:scale-[1.07] hover:shadow-card-hover hover:ring-2 hover:ring-fuchsia-500/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/50 focus-within:z-30 focus-within:scale-[1.07] ${wrap}`}
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-2xl">
        {movie.posterUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={movie.posterUrl}
            alt=""
            className="h-full w-full object-cover transition duration-500 ease-out group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-zinc-800 p-2 text-center text-xs text-zinc-500">
            {title}
          </div>
        )}

        {showNew ? (
          <span
            className={`absolute right-2 top-2 z-20 rounded-md bg-gradient-to-r from-rose-600 to-red-600 font-bold uppercase tracking-wide text-white shadow-md ring-1 ring-white/25 ${
              size === "featured"
                ? "px-2 py-0.5 text-[10px]"
                : "px-1.5 py-0.5 text-[9px]"
            }`}
          >
            NEW
          </span>
        ) : null}

        <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-end opacity-0 translate-y-1 transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100">
          <div
            className={`bg-gradient-to-t from-black via-black/90 to-transparent ${
              size === "featured"
                ? "px-2.5 pb-2.5 pt-12 sm:px-3 sm:pb-3 sm:pt-14"
                : "px-2 pb-2 pt-10 sm:px-2.5 sm:pb-2.5 sm:pt-12"
            }`}
          >
            <h3
              className={`line-clamp-2 text-left font-bold leading-snug tracking-tight text-white drop-shadow-md ${
                size === "featured"
                  ? "text-[14px] sm:text-[15px] md:text-base"
                  : "text-[12px] sm:text-[13px] md:text-[14px]"
              }`}
            >
              {title}
            </h3>

            <div
              className={`mt-1 flex flex-wrap items-center gap-x-1.5 text-white ${
                size === "featured" ? "text-[11px] sm:text-[12px]" : "text-[10px] sm:text-[11px]"
              }`}
            >
              {typeof movie.rating === "number" && movie.rating > 0 ? (
                <span className="inline-flex items-center gap-0.5 font-medium">
                  <span className="text-amber-400" aria-hidden>
                    ★
                  </span>
                  {movie.rating.toFixed(1)}
                </span>
              ) : null}
              {movie.year ? (
                <>
                  {typeof movie.rating === "number" && movie.rating > 0 ? (
                    <span className="text-zinc-500" aria-hidden>
                      ·
                    </span>
                  ) : null}
                  <span className="font-medium text-zinc-100">{movie.year}</span>
                </>
              ) : null}
            </div>

            {genres.length > 0 ? (
              <div className="mt-1.5 flex flex-wrap gap-1">
                {genres.map((g) => (
                  <span
                    key={g}
                    className={`rounded-md bg-zinc-900/90 px-1.5 py-0.5 font-medium text-white ring-1 ring-white/10 ${
                      size === "featured" ? "text-[9px] sm:text-[10px]" : "text-[8px] sm:text-[9px]"
                    }`}
                  >
                    {genreLabelForLocale(g, locale)}
                  </span>
                ))}
              </div>
            ) : null}

            <div className="mt-2 flex gap-1.5">
              <span
                className={`flex flex-1 items-center justify-center gap-1 rounded-lg bg-white font-bold text-black shadow-md ${
                  size === "featured"
                    ? "min-h-[32px] px-1.5 text-[11px] sm:min-h-[34px] sm:text-[12px]"
                    : "min-h-[28px] px-1 text-[10px] sm:min-h-[30px] sm:text-[11px]"
                }`}
              >
                <span className="text-xs leading-none text-black" aria-hidden>
                  ▶
                </span>
                Play
              </span>
              <span
                className={`flex shrink-0 items-center justify-center rounded-lg bg-zinc-800 font-light leading-none text-white ring-1 ring-white/15 ${
                  size === "featured"
                    ? "h-8 w-8 text-base sm:h-[34px] sm:w-[34px]"
                    : "h-7 w-7 text-sm sm:h-8 sm:w-8"
                }`}
                aria-hidden
              >
                +
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
