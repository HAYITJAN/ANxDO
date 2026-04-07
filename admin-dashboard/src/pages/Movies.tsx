import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../lib/api";

type Movie = {
  _id: string;
  title: string;
  type: string;
  year?: number;
  views?: number;
  genre?: string[];
  rating?: number;
  ratingCount?: number;
};

export default function Movies() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedSearch(searchInput.trim()), 400);
    return () => window.clearTimeout(t);
  }, [searchInput]);

  const load = useCallback(async () => {
    setLoading(true);
    const q = debouncedSearch;
    const path = q ? `/movies?search=${encodeURIComponent(q)}` : "/movies";
    const res = await apiFetch(path);
    if (res.ok) {
      const data = await res.json();
      setMovies(Array.isArray(data) ? data : []);
    } else {
      setMovies([]);
    }
    setLoading(false);
  }, [debouncedSearch]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  async function remove(id: string, title: string) {
    if (!confirm(`"${title}" o‘chirilsinmi? Saytdan ham yo‘qoladi.`)) return;
    const res = await apiFetch(`/movies/${id}`, { method: "DELETE" });
    if (res.ok) void load();
    else alert("O‘chirilmadi");
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-display text-lg font-semibold text-white">Kinolar</h2>
        <Link
          to="/movies/new"
          className="rounded-xl bg-gradient-to-r from-rose-500 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg"
        >
          + Yangi kino
        </Link>
      </div>

      <div className="mb-4">
        <label className="block text-xs font-medium uppercase tracking-wide text-zinc-500">
          Qidiruv (sarlavha yoki tavsif)
        </label>
        <input
          type="search"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Kino nomini yozing…"
          className="mt-1.5 w-full max-w-xl rounded-xl border border-white/[0.08] bg-[#0c0a12] px-4 py-2.5 text-sm text-white outline-none placeholder:text-zinc-600 focus:ring-2 focus:ring-violet-500/40"
          autoComplete="off"
        />
        {!loading && debouncedSearch ? (
          <p className="mt-2 text-xs text-zinc-500">
            «{debouncedSearch}» bo‘yicha {movies.length} ta natija
          </p>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0c0a12]/50">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/[0.06] text-xs uppercase tracking-wider text-zinc-500">
              <th className="px-4 py-3 font-medium">Sarlavha</th>
              <th className="px-4 py-3 font-medium">Tur</th>
              <th className="px-4 py-3 font-medium">Yil</th>
              <th className="px-4 py-3 font-medium">Ko‘rishlar</th>
              <th className="px-4 py-3 font-medium">Reyting</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-zinc-500">
                  <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
                </td>
              </tr>
            ) : movies.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-zinc-500">
                  {debouncedSearch ? "Hech narsa topilmadi" : "Ro‘yxat bo‘sh"}
                </td>
              </tr>
            ) : (
              movies.map((m) => (
                <tr key={m._id} className="border-b border-white/[0.04] last:border-0">
                  <td className="px-4 py-3 font-medium text-zinc-200">{m.title}</td>
                  <td className="px-4 py-3 text-zinc-400">{m.type}</td>
                  <td className="px-4 py-3 text-zinc-500">{m.year ?? "—"}</td>
                  <td className="px-4 py-3 text-zinc-500">{m.views ?? 0}</td>
                  <td className="px-4 py-3 text-zinc-400">
                    {typeof m.rating === "number" && m.rating > 0 ? (
                      <>
                        ★ {m.rating.toFixed(1)}
                        {m.ratingCount != null && m.ratingCount > 0 ? (
                          <span className="text-zinc-600"> ({m.ratingCount})</span>
                        ) : null}
                      </>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Link
                        to={`/movies/${m._id}/edit`}
                        className="text-xs text-emerald-400/90 hover:underline"
                      >
                        Tahrirlash
                      </Link>
                      <Link
                        to={`/movies/${m._id}/episodes`}
                        className="text-xs text-amber-400/90 hover:underline"
                      >
                        Qismlar
                      </Link>
                      <a
                        href={`${import.meta.env.VITE_PUBLIC_SITE_URL || "http://localhost:3000"}/title/${m._id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-violet-400 hover:underline"
                      >
                        Saytda
                      </a>
                      <button
                        type="button"
                        onClick={() => remove(m._id, m.title)}
                        className="text-xs text-rose-400 hover:underline"
                      >
                        O‘chirish
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
