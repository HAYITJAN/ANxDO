import { coerceGenres, type MovieListItem } from "@/lib/movies";

/** Joriy filmdan boshqa — avvalo bir xil janr/tur bo‘yicha */
export function pickRelatedMovies(
  currentId: string,
  genres: unknown,
  type: string,
  all: MovieListItem[]
): MovieListItem[] {
  const others = all.filter((m) => m._id !== currentId);
  const gSet = new Set(coerceGenres(genres).map((x) => x.toLowerCase()));

  const scored = others.map((m) => {
    let score = 0;
    if (m.type === type) score += 2;
    for (const x of coerceGenres(m.genre)) {
      if (gSet.has(String(x).toLowerCase())) score += 3;
    }
    return { m, score };
  });

  scored.sort((a, b) => b.score - a.score || (b.m.views ?? 0) - (a.m.views ?? 0));
  return scored.map((x) => x.m).slice(0, 14);
}
