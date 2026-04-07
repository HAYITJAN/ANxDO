const KEY = "ando-watchlist";

function readIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const p = JSON.parse(raw) as unknown;
    if (!Array.isArray(p)) return [];
    return p.map((x) => String(x)).filter(Boolean);
  } catch {
    return [];
  }
}

function writeIds(ids: string[]) {
  localStorage.setItem(KEY, JSON.stringify(Array.from(new Set(ids))));
}

export function getWatchlistIds(): string[] {
  return readIds();
}

export function isInWatchlist(movieId: string): boolean {
  return readIds().includes(movieId);
}

export function addToWatchlist(movieId: string): void {
  const ids = readIds();
  if (!ids.includes(movieId)) writeIds([...ids, movieId]);
}

export function removeFromWatchlist(movieId: string): void {
  writeIds(readIds().filter((id) => id !== movieId));
}

export function toggleWatchlist(movieId: string): boolean {
  if (isInWatchlist(movieId)) {
    removeFromWatchlist(movieId);
    return false;
  }
  addToWatchlist(movieId);
  return true;
}
