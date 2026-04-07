import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { apiFetch } from "../lib/api";

type Genre = { _id: string; name: string };

export default function Genres() {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const res = await apiFetch("/genres");
    if (res.ok) {
      const data = await res.json();
      setGenres(Array.isArray(data) ? data : []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function add(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    setErr(null);
    try {
      const res = await apiFetch("/genres", { method: "POST", body: JSON.stringify({ name: name.trim() }) });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.message || "Xato");
      setName("");
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Xato");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("O‘chirilsinmi?")) return;
    setBusy(true);
    const res = await apiFetch(`/genres/${id}`, { method: "DELETE" });
    if (res.ok) await load();
    setBusy(false);
  }

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <h2 className="font-display mb-6 text-lg font-semibold text-white">Janrlar</h2>
      <form onSubmit={add} className="mb-8 flex flex-wrap gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Yangi janr nomi"
          className="min-w-[200px] flex-1 rounded-xl border border-white/[0.08] bg-[#0c0a12] px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-violet-500/40"
        />
        <button
          type="submit"
          disabled={busy || !name.trim()}
          className="rounded-xl bg-gradient-to-r from-rose-500 to-violet-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          Qo‘shish
        </button>
      </form>
      {err && (
        <p className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-sm text-rose-200">{err}</p>
      )}
      <ul className="space-y-2 rounded-2xl border border-white/[0.06] bg-[#0c0a12]/50 p-3">
        {genres.map((g) => (
          <li key={g._id} className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm text-zinc-200">
            <span>{g.name}</span>
            <button
              type="button"
              disabled={busy}
              onClick={() => remove(g._id)}
              className="rounded-lg border border-white/10 px-3 py-1 text-xs text-rose-300 hover:bg-rose-500/10"
            >
              O‘chirish
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
