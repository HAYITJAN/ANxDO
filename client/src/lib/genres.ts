import { publicApiBase as apiBase } from "@/lib/publicApiBase";

export type Genre = { _id: string; name: string };

export async function fetchGenres(): Promise<Genre[]> {
  try {
    const res = await fetch(`${apiBase}/genres`, { next: { revalidate: 30 } });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}
