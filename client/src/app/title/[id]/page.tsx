import { MoreLikeThis } from "@/components/title/MoreLikeThis";
import { MovieDescriptionBlock } from "@/components/title/MovieDescriptionBlock";
import { TitleDetailMeta } from "@/components/title/TitleDetailMeta";
import { coerceGenres, fetchMovies } from "@/lib/movies";
import { publicApiBase as apiBase } from "@/lib/publicApiBase";
import { pageShell } from "@/lib/pageShell";
import { pickRelatedMovies } from "@/lib/relatedMovies";
import dynamic from "next/dynamic";
import Link from "next/link";

/** SSR paketida zustand vendor-chunk buzilishi — faqat clientda yuklanadi */
const MovieRatingPanel = dynamic(
  () => import("@/components/title/MovieRatingPanel").then((m) => m.MovieRatingPanel),
  { ssr: false, loading: () => <p className="text-sm text-zinc-500">Yuklanmoqda…</p> }
);

const TitleWatchClient = dynamic(
  () => import("@/components/watch/TitleWatchClient").then((m) => m.TitleWatchClient),
  { ssr: false, loading: () => <p className="text-sm text-zinc-500">Pleyer yuklanmoqda…</p> }
);

type MovieDetail = {
  _id: string;
  title?: string;
  titleI18n?: { uz?: string; ru?: string; en?: string };
  description?: string;
  descriptionI18n?: { uz?: string; ru?: string; en?: string };
  type: string;
  videoUrl?: string;
  streams?: {
    lang: string;
    label?: string;
    videoUrl?: string;
    externalWatchUrl?: string;
  }[];
  posterUrl?: string;
  bannerUrl?: string;
  genre?: string[];
  year?: number;
  rating?: number;
  ratingCount?: number;
};

async function getMovie(id: string): Promise<MovieDetail | null> {
  if (!id || id === "undefined") return null;
  try {
    const res = await fetch(`${apiBase}/movies/${encodeURIComponent(id)}`, {
      next: { revalidate: 0 },
    });
    if (!res.ok) return null;
    const text = await res.text();
    if (!text.trim()) return null;
    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      return null;
    }
    if (!data || typeof data !== "object") return null;
    const m = data as MovieDetail;
    if (typeof m._id !== "string" || !m._id.trim()) return null;
    return m;
  } catch {
    return null;
  }
}

async function getEpisodes(movieId: string) {
  if (!movieId || movieId === "undefined") return [];
  try {
    const res = await fetch(`${apiBase}/episodes/${encodeURIComponent(movieId)}`, {
      next: { revalidate: 0 },
    });
    if (!res.ok) return [];
    const text = await res.text();
    if (!text.trim()) return [];
    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      return [];
    }
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function typeLabel(t: string) {
  if (t === "movie") return "FILM";
  if (t === "anime") return "ANIME";
  return "DORAMA";
}

export default async function TitlePage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string } | undefined;
}) {
  const resolved = (await Promise.resolve(params)) as { id?: unknown } | null | undefined;
  const id = typeof resolved?.id === "string" ? resolved.id : "";
  if (!id.trim()) {
    return (
      <main className="min-h-screen bg-ink px-6 py-16 text-violet-100">
        <p className="text-zinc-400">{"Noto'g'ri havola."}</p>
        <Link href="/" className="mt-4 inline-block text-sm text-fuchsia-400 hover:underline">
          ← Bosh sahifa
        </Link>
      </main>
    );
  }
  const [movie, episodes, allMovies] = await Promise.all([
    getMovie(id),
    getEpisodes(id),
    fetchMovies(),
  ]);
  const epList = Array.isArray(episodes) ? episodes : [];

  if (!movie) {
    return (
      <main className="min-h-screen bg-ink px-6 py-16 text-violet-100">
        <p className="text-zinc-400">Kontent topilmadi yoki API ishlamayapti.</p>
        <p className="mt-2 text-xs text-zinc-600">
          Server <code className="text-zinc-500">npm run dev</code> (port 5000) va MongoDB ni tekshiring.
        </p>
        <Link href="/" className="mt-8 inline-block text-sm text-fuchsia-400 hover:underline">
          ← Bosh sahifa
        </Link>
      </main>
    );
  }

  const heroBg = movie.bannerUrl || movie.posterUrl || "";
  const genres = coerceGenres(movie.genre);
  const related = pickRelatedMovies(id, genres, movie.type ?? "movie", allMovies);

  return (
    <main className="min-h-screen bg-ink pb-20 text-violet-100">
      <div className="relative">
        <div className="relative h-[min(42vh,380px)] w-full overflow-hidden md:h-[min(48vh,440px)]">
          {heroBg ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={heroBg}
              alt=""
              className="absolute inset-0 h-full w-full scale-105 object-cover object-[center_15%] blur-[2px]"
            />
          ) : (
            <div className="absolute inset-0 bg-zinc-900" />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/85 to-ink" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink/90 via-transparent to-ink/50" />
        </div>

        <div className={`relative pb-12 pt-6 text-left ${pageShell}`}>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-zinc-400 transition hover:text-white"
          >
            <span aria-hidden>←</span> Bosh sahifa
          </Link>

          <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-end lg:gap-12">
            <div className="mx-auto w-full max-w-[200px] shrink-0 sm:max-w-[220px] lg:mx-0 lg:w-[240px]">
              <div className="overflow-hidden rounded-2xl bg-zinc-900 shadow-card ring-2 ring-white/10">
                {movie.posterUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={movie.posterUrl}
                    alt=""
                    className="aspect-[2/3] w-full object-cover"
                  />
                ) : (
                  <div className="flex aspect-[2/3] items-center justify-center bg-zinc-800 p-4 text-center text-sm text-zinc-500">
                    {movie.title ?? "Kontent"}
                  </div>
                )}
              </div>
            </div>

            <div className="min-w-0 flex-1 space-y-5 pb-2">
              <TitleDetailMeta movie={movie} />

              <div className="flex flex-wrap items-center gap-3 text-sm">
                {movie.year ? (
                  <span className="inline-flex items-center gap-1.5 text-zinc-400">
                    <span className="text-zinc-600">📅</span> {movie.year}
                  </span>
                ) : null}
                {epList.length > 0 ? (
                  <span className="text-zinc-400">{epList.length} qism</span>
                ) : null}
                <span className="rounded-md bg-violet-600/35 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-violet-100 ring-1 ring-violet-500/40">
                  {typeLabel(movie.type ?? "movie")}
                </span>
              </div>

              <MovieRatingPanel
                movieId={movie._id}
                initialRating={typeof movie.rating === "number" ? movie.rating : 0}
                initialCount={typeof movie.ratingCount === "number" ? movie.ratingCount : 0}
              />

              <div className="flex flex-wrap gap-3 pt-1">
                <Link
                  href={`#watch`}
                  className="inline-flex min-h-[46px] items-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 via-fuchsia-600 to-violet-700 px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:brightness-110"
                >
                  ▶ Tomosha qilish
                </Link>
                <button
                  type="button"
                  className="inline-flex min-h-[46px] items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-medium text-white hover:bg-white/10"
                >
                  + Mening ro‘yxatim
                </button>
              </div>
            </div>
          </div>

          <MovieDescriptionBlock movie={movie} />

          <div id="watch" className="mt-12 scroll-mt-28">
            <TitleWatchClient movie={movie} episodes={epList} />
          </div>

          <MoreLikeThis movies={related} />
        </div>
      </div>
    </main>
  );
}
