"use client";

import { useLocale } from "@/components/i18n/LocaleContext";
import { genreLabelForLocale } from "@/lib/genreLabels";
import { pickMovieDescription, pickMovieTitle } from "@/lib/movieDescription";
import type { MovieListItem } from "@/lib/movies";
import { pageShell } from "@/lib/pageShell";
import { isInWatchlist, toggleWatchlist } from "@/lib/watchlist";
import { useAuthStore } from "@/store/authStore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const ROTATE_MS = 10_000;

export function HomeHero({
  movies,
  reserveBottomAdBar = false,
}: {
  movies: MovieListItem[];
  reserveBottomAdBar?: boolean;
}) {
  const { t, locale } = useLocale();
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const [idx, setIdx] = useState(0);
  const [inList, setInList] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const safe = movies.length ? movies : [];
  const movie = safe[idx % safe.length] ?? safe[0];

  useEffect(() => {
    if (!movie?._id) return;
    setInList(isInWatchlist(movie._id));
  }, [movie?._id]);

  useEffect(() => {
    if (safe.length <= 1) return;
    const tmr = window.setInterval(() => {
      setIdx((i) => (i + 1) % safe.length);
    }, ROTATE_MS);
    return () => window.clearInterval(tmr);
  }, [safe.length]);

  if (!movie) return null;

  const bg = movie.bannerUrl || movie.posterUrl || "";
  const genres = movie.genre?.length ? movie.genre : [];
  const typeLabel =
    movie.type === "movie"
      ? t("hero.typeMovie")
      : movie.type === "anime"
        ? t("hero.typeAnime")
        : t("hero.typeDorama");

  const badgeLabel = movie.newRelease ? t("hero.newBadge") : t("hero.featured");

  function onMyList() {
    if (!token) {
      setToast(t("hero.myListNeedAuth"));
      router.push(`/register?next=${encodeURIComponent("/profile")}`);
      return;
    }
    const now = toggleWatchlist(movie._id);
    setInList(now);
    setToast(now ? t("hero.myListAdded") : t("hero.myListRemoved"));
    window.setTimeout(() => setToast(null), 2200);
  }

  const description = pickMovieDescription(movie, locale);
  const displayTitle = pickMovieTitle(movie, locale);

  return (
    <section className="relative w-full overflow-hidden bg-black">
      <div className="absolute inset-0 bg-black" />
      {bg ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={movie._id}
          src={bg}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-[center_22%] transition-opacity duration-500"
        />
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/88 to-black/35" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/25" />
      <div className="absolute inset-0 bg-black/20" />

      {safe.length > 1 ? (
        <div
          className={`absolute bottom-6 left-0 right-0 z-20 flex justify-center gap-2 md:bottom-10 ${pageShell}`}
          aria-hidden
        >
          {safe.map((m, i) => (
            <button
              key={m._id}
              type="button"
              onClick={() => setIdx(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === idx % safe.length ? "w-8 bg-accent-hover" : "w-1.5 bg-white/35 hover:bg-white/55"
              }`}
              aria-label={`${i + 1}`}
            />
          ))}
        </div>
      ) : null}

      <div
        className={`relative z-10 flex min-h-[min(76vh,820px)] flex-col justify-end pt-28 text-left sm:pt-32 md:min-h-[min(82vh,900px)] ${
          reserveBottomAdBar
            ? "pb-[calc(1.25rem+var(--home-ad-bar-height,5.5rem))] sm:pb-[calc(1.75rem+var(--home-ad-bar-height,5.5rem))] md:pb-[calc(2.25rem+var(--home-ad-bar-height,5.5rem))]"
            : "pb-12 sm:pb-16 md:pb-20"
        } ${pageShell}`}
      >
        {toast ? (
          <p className="absolute left-1/2 top-24 z-30 max-w-md -translate-x-1/2 rounded-xl border border-accent/45 bg-black/85 px-4 py-2 text-center text-sm text-violet-100 shadow-lg backdrop-blur-md">
            {toast}
          </p>
        ) : null}

        <div className="max-w-4xl xl:max-w-5xl">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
            <span
              className={`rounded-md px-2.5 py-1 text-[10px] font-bold tracking-normal text-white shadow-lg ${
                movie.newRelease ? "bg-amber-600 shadow-amber-950/35" : "bg-accent shadow-violet-950/35"
              }`}
            >
              {badgeLabel}
            </span>
            <span className="normal-case tracking-normal text-zinc-400">
              {movie.year ? `${movie.year}` : ""}
              {movie.year ? <span className="mx-2 text-zinc-600">•</span> : null}
              <span className="text-zinc-500">{typeLabel}</span>
            </span>
          </div>

          <h1 className="mt-5 text-5xl font-bold leading-[1.02] tracking-tight text-white drop-shadow-[0_4px_32px_rgba(0,0,0,0.65)] sm:text-6xl md:text-7xl lg:text-8xl lg:leading-[1.02]">
            {displayTitle}
          </h1>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            {typeof movie.rating === "number" && movie.rating > 0 ? (
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-black/55 px-3.5 py-2 text-sm font-semibold text-amber-300 ring-1 ring-white/10 backdrop-blur-md">
                <span className="text-amber-400" aria-hidden>
                  ★
                </span>
                {movie.rating.toFixed(1)}
              </span>
            ) : null}
            {genres.slice(0, 4).map((g) => (
              <span
                key={g}
                className="rounded-lg border border-white/10 bg-black/40 px-3 py-1.5 text-xs font-medium text-zinc-200 backdrop-blur-md"
              >
                {genreLabelForLocale(g, locale)}
              </span>
            ))}
          </div>

          {description ? (
            <p className="mt-6 max-w-3xl text-base leading-relaxed text-zinc-400 sm:text-lg line-clamp-3 md:line-clamp-4 xl:max-w-4xl">
              {description}
            </p>
          ) : null}

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link
              href={`/title/${movie._id}`}
              className="inline-flex min-h-[50px] items-center gap-2.5 rounded-2xl bg-accent px-8 py-3 text-sm font-semibold text-white shadow-xl shadow-violet-950/40 transition hover:bg-accent-hover active:scale-[0.98] active:bg-accent-muted"
            >
              <span className="text-lg leading-none" aria-hidden>
                ▶
              </span>
              {t("hero.watchNow")}
            </Link>
            <button
              type="button"
              onClick={onMyList}
              className={`inline-flex min-h-[50px] items-center gap-2 rounded-2xl border px-6 py-3 text-sm font-semibold backdrop-blur-md transition hover:bg-white/15 ${
                inList
                  ? "border-accent-hover/50 bg-accent-deep/35 text-violet-100"
                  : "border-white/20 bg-white/10 text-white"
              }`}
            >
              <span className="text-base">{inList ? "✓" : "+"}</span> {t("hero.myList")}
            </button>
            <Link
              href={`/title/${movie._id}`}
              className="inline-flex min-h-[50px] items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/15"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full border border-white/40 text-xs">
                i
              </span>
              {t("hero.info")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
