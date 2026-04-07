import { publicApiBase as apiBase } from "@/lib/publicApiBase";

export function coerceGenres(genre: unknown): string[] {
  if (genre == null) return [];
  if (Array.isArray(genre)) {
    return genre.map((x) => String(x != null ? x : "").trim()).filter(Boolean);
  }
  if (typeof genre === "string") {
    return genre.split(/[,;]/).map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

export type MovieListItem = {
  _id: string;
  title: string;
  description?: string;
  descriptionI18n?: { uz?: string; ru?: string; en?: string };
  genre?: string[];
  year?: number;
  rating?: number;
  /** Sharhlar soni */
  ratingCount?: number;
  posterUrl?: string;
  bannerUrl?: string;
  /** Qisqa vertikal treyler (YouTube Shorts, TikTok, mp4) */
  trailerShortUrl?: string;
  type: string;
  views?: number;
  featured?: boolean;
  newRelease?: boolean;
  /** API (Mongo) */
  createdAt?: string;
};

function movieTime(m: MovieListItem): number {
  if (!m.createdAt) return 0;
  const t = new Date(m.createdAt).getTime();
  return Number.isFinite(t) ? t : 0;
}

/** Bosh sahifa banner: oxirgi 5 ta yangi chiqish; bo‘lmasa tavsiya, so‘ng birinchi */
export function pickHeroMovies(movies: MovieListItem[]): MovieListItem[] {
  const fresh = [...movies]
    .filter((m) => m.newRelease)
    .sort((a, b) => movieTime(b) - movieTime(a))
    .slice(0, 5);
  if (fresh.length > 0) return fresh;
  const featured = movies.find((m) => m.featured);
  if (featured) return [featured];
  const sorted = [...movies].sort((a, b) => movieTime(b) - movieTime(a));
  return sorted[0] ? [sorted[0]] : [];
}

export async function fetchNewReleases(limit = 10): Promise<MovieListItem[]> {
  try {
    const res = await fetch(`${apiBase}/movies/new-releases?limit=${limit}`, {
      next: { revalidate: 15 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

/** Brauzerda (profil va h.k.) — keshsiz */
export async function fetchMoviesClient(): Promise<MovieListItem[]> {
  try {
    const res = await fetch(`${apiBase}/movies`, { cache: "no-store" });
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

export async function fetchMovies(): Promise<MovieListItem[]> {
  try {
    const res = await fetch(`${apiBase}/movies`, { next: { revalidate: 30 } });
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
