const apiBase =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:5000/api";

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
