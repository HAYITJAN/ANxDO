import Link from "next/link";
import { Suspense } from "react";
import { pageShell } from "@/lib/pageShell";
import { fetchMovies, type MovieListItem } from "@/lib/movies";
import { BrowseSearch } from "./BrowseSearch";

function filterMovies(
  movies: MovieListItem[],
  type: string | null,
  sort: string | null,
  q: string | null,
  genre: string | null
): MovieListItem[] {
  let list = [...movies];
  if (type && ["movie", "anime", "dorama"].includes(type)) {
    list = list.filter((m) => m.type === type);
  }
  if (sort === "trending") {
    list.sort((a, b) => (b.views ?? 0) - (a.views ?? 0));
  }
  if (genre && genre.trim()) {
    const g = genre.trim().toLowerCase();
    list = list.filter((m) =>
      (m.genre || []).some((x) => x.toLowerCase().includes(g))
    );
  }
  if (q && q.trim()) {
    const needle = q.trim().toLowerCase();
    list = list.filter(
      (m) =>
        m.title.toLowerCase().includes(needle) ||
        (m.description && m.description.toLowerCase().includes(needle))
    );
  }
  return list;
}

function titleFor(type: string | null, sort: string | null, genre: string | null): string {
  if (genre) return genre;
  if (sort === "trending") return "Trending";
  if (type === "movie") return "Movies";
  if (type === "anime") return "Anime";
  if (type === "dorama") return "Doramas";
  return "Browse";
}

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const type = typeof searchParams.type === "string" ? searchParams.type : null;
  const sort = typeof searchParams.sort === "string" ? searchParams.sort : null;
  const q = typeof searchParams.q === "string" ? searchParams.q : null;
  const genre = typeof searchParams.genre === "string" ? searchParams.genre : null;

  const movies = await fetchMovies();
  const list = filterMovies(movies, type, sort, q, genre);
  const heading = titleFor(type, sort, genre);

  return (
    <main className="min-h-screen bg-background pb-20 pt-10 text-left">
      <div className={pageShell}>
        <Suspense fallback={<div className="h-12 animate-pulse rounded-xl bg-white/5" />}>
          <BrowseSearch initialQ={q || ""} />
        </Suspense>
        <h1 className="mt-6 text-2xl font-bold text-white">{heading}</h1>
        <p className="mt-1 text-sm text-zinc-500">
          {list.length} ta natija
          {q ? ` — “${q}”` : ""}
        </p>

        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {list.map((m) => (
            <Link key={m._id} href={`/title/${m._id}`} className="group">
              <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-zinc-800 ring-1 ring-white/10 transition group-hover:ring-fuchsia-500/50">
                {m.posterUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.posterUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center p-2 text-center text-xs text-zinc-500">
                    {m.title}
                  </div>
                )}
              </div>
              <p className="mt-2 line-clamp-2 text-sm text-zinc-300 group-hover:text-white">{m.title}</p>
            </Link>
          ))}
        </div>

        {list.length === 0 ? (
          <p className="mt-12 text-center text-zinc-500">Hech narsa topilmadi.</p>
        ) : null}

        <Link href="/" className="mt-12 inline-block text-sm text-fuchsia-400 hover:underline">
          ← Bosh sahifa
        </Link>
      </div>
    </main>
  );
}
