"use client";

import { apiFetch } from "@/lib/api";
import { AUDIO_LANGUAGE_OPTIONS, labelForLang } from "@/lib/audioLanguages";
import { useAuthStore } from "@/store/authStore";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type Movie = { _id: string; title: string; type: string };
type Episode = {
  _id: string;
  movieId: string;
  episodeNumber: number;
  title?: string;
  videoUrl: string;
  streams?: { lang: string; label?: string; videoUrl?: string; externalWatchUrl?: string }[];
};

type StreamRow = { lang: string; videoUrl: string; externalWatchUrl: string };

const emptyMeta = { episodeNumber: 1, title: "" };
const defaultRows = (): StreamRow[] => [{ lang: "uz", videoUrl: "", externalWatchUrl: "" }];

export default function AdminSeriesEpisodesPage() {
  const params = useParams();
  const router = useRouter();
  const movieId = typeof params?.id === "string" ? params.id : "";
  const token = useAuthStore((s) => s.token);

  const [movie, setMovie] = useState<Movie | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState(emptyMeta);
  const [streamRows, setStreamRows] = useState<StreamRow[]>(defaultRows);
  const [editingId, setEditingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!movieId || !token) {
      setLoading(false);
      return;
    }
    setErr(null);
    try {
      const [mRes, eRes] = await Promise.all([
        apiFetch(`/movies/${movieId}`, { token }),
        apiFetch(`/episodes/${movieId}`, { token }),
      ]);
      if (!mRes.ok) {
        setMovie(null);
        setErr("Kontent topilmadi");
        return;
      }
      const m = await mRes.json();
      setMovie({ _id: m._id, title: m.title, type: m.type });
      if (eRes.ok) {
        const data = await eRes.json();
        setEpisodes(Array.isArray(data) ? data : []);
      } else {
        setEpisodes([]);
      }
    } catch {
      setErr("Yuklashda xato");
    } finally {
      setLoading(false);
    }
  }, [movieId, token]);

  useEffect(() => {
    void load();
  }, [load]);

  function addStreamRow() {
    setStreamRows((rows) => [...rows, { lang: "en", videoUrl: "", externalWatchUrl: "" }]);
  }

  function removeStreamRow(i: number) {
    setStreamRows((rows) => (rows.length <= 1 ? rows : rows.filter((_, j) => j !== i)));
  }

  function setStreamRow(i: number, patch: Partial<StreamRow>) {
    setStreamRows((rows) => rows.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  }

  function startEdit(ep: Episode) {
    setEditingId(ep._id);
    setForm({
      episodeNumber: ep.episodeNumber,
      title: ep.title ?? "",
    });
    if (ep.streams?.length) {
      setStreamRows(
        ep.streams.map((s) => ({
          lang: s.lang,
          videoUrl: s.videoUrl ?? "",
          externalWatchUrl: s.externalWatchUrl ?? "",
        }))
      );
    } else {
      setStreamRows([{ lang: "uz", videoUrl: ep.videoUrl ?? "", externalWatchUrl: "" }]);
    }
    setErr(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyMeta);
    setStreamRows(defaultRows());
    setErr(null);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !movieId) return;
    const num = Number(form.episodeNumber);
    if (!Number.isFinite(num) || num < 1) {
      setErr("Qism raqami 1 dan katta bo‘lsin");
      return;
    }
    const byLang = new Map<
      string,
      { lang: string; label: string; videoUrl: string; externalWatchUrl: string }
    >();
    for (const r of streamRows) {
      const u = r.videoUrl.trim();
      const ext = r.externalWatchUrl.trim();
      if (!r.lang || (!u && !ext)) continue;
      byLang.set(r.lang, {
        lang: r.lang,
        label: labelForLang(r.lang),
        videoUrl: u,
        externalWatchUrl: ext,
      });
    }
    const streams = Array.from(byLang.values());
    if (streams.length === 0) {
      setErr("Kamida bitta til uchun saytdagi video yoki tashqi havola kiriting");
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      if (editingId) {
        const res = await apiFetch(`/episodes/${editingId}`, {
          method: "PUT",
          token,
          body: JSON.stringify({
            episodeNumber: num,
            title: form.title.trim(),
            streams,
          }),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json.message || "Yangilanmadi");
        cancelEdit();
      } else {
        const res = await apiFetch("/episodes", {
          method: "POST",
          token,
          body: JSON.stringify({
            movieId,
            episodeNumber: num,
            title: form.title.trim(),
            streams,
          }),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json.message || "Qo‘shilmadi");
        cancelEdit();
      }
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Xato");
    } finally {
      setBusy(false);
    }
  }

  async function remove(epId: string) {
    if (!token || !confirm("Bu qism o‘chirilsinmi?")) return;
    setBusy(true);
    setErr(null);
    try {
      const res = await apiFetch(`/episodes/${epId}`, { method: "DELETE", token });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.message || "O‘chirilmadi");
      }
      if (editingId === epId) cancelEdit();
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Xato");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center text-zinc-500">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="text-zinc-400">
        <p>{err || "Topilmadi"}</p>
        <Link href="/admin/movies" className="mt-4 inline-block text-violet-400 hover:underline">
          ← Kinolar ro‘yxati
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href="/admin/movies"
            className="mb-2 inline-block text-xs text-violet-400 hover:underline"
          >
            ← Kinolar
          </Link>
          <h2 className="font-[family-name:var(--font-syne)] text-lg font-semibold text-white">
            Qismlar: {movie.title}
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Tur: <span className="text-zinc-400">{movie.type}</span> — har til uchun saytdagi treyler va/yoki tashqi
            tomosha havolasi.
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.push(`/title/${movieId}`)}
          className="rounded-xl border border-white/15 px-4 py-2 text-sm text-zinc-300 hover:bg-white/5"
        >
          Saytda ko‘rish
        </button>
      </div>

      {err && (
        <p className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-sm text-rose-200">
          {err}
        </p>
      )}

      <form
        onSubmit={save}
        className="mb-10 space-y-4 rounded-2xl border border-white/[0.08] bg-[#0c0a12]/60 p-5"
      >
        <p className="text-sm font-medium text-zinc-300">
          {editingId ? "Qismni tahrirlash" : "Yangi qism qo‘shish"}
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-500">
              Qism raqami *
            </span>
            <input
              type="number"
              min={1}
              required
              value={form.episodeNumber}
              onChange={(e) => setForm((f) => ({ ...f, episodeNumber: Number(e.target.value) }))}
              className="w-full rounded-xl border border-white/[0.08] bg-[#07060b] px-4 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-violet-500/40"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-500">
              Qism nomi (ixtiyoriy)
            </span>
            <input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="w-full rounded-xl border border-white/[0.08] bg-[#07060b] px-4 py-2.5 text-sm text-white outline-none focus:ring-2 focus:ring-violet-500/40"
              placeholder="Masalan: 1-qism — Boshlanish"
            />
          </label>
        </div>

        <div className="space-y-2 rounded-xl border border-white/[0.06] bg-[#07060b]/50 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Til: saytdagi + tashqi
            </span>
            <button
              type="button"
              onClick={addStreamRow}
              className="rounded-lg border border-white/15 px-3 py-1.5 text-xs text-violet-300 hover:bg-white/5"
            >
              + Til qo‘shish
            </button>
          </div>
          <p className="text-xs text-zinc-600">
            Kamida bitta maydon. Bir xil til ikki marta bo‘lsa, oxirgisi qabul qilinadi.
          </p>
          <div className="space-y-3">
            {streamRows.map((row, i) => (
              <div key={i} className="flex flex-col gap-2 rounded-lg border border-white/[0.06] bg-[#0c0a12] p-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <select
                    value={row.lang}
                    onChange={(e) => setStreamRow(i, { lang: e.target.value })}
                    className="w-full shrink-0 rounded-lg border border-white/10 bg-[#07060b] px-3 py-2 text-sm text-white sm:w-44"
                  >
                    {AUDIO_LANGUAGE_OPTIONS.map((o) => (
                      <option key={o.code} value={o.code}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => removeStreamRow(i)}
                    className="shrink-0 rounded-lg border border-white/10 px-2 py-1.5 text-xs text-zinc-500 hover:text-rose-300 sm:ml-auto"
                  >
                    O‘chirish
                  </button>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <label className="block min-w-0">
                    <span className="mb-0.5 block text-[10px] text-zinc-500">Saytdagi video</span>
                    <input
                      type="url"
                      value={row.videoUrl}
                      onChange={(e) => setStreamRow(i, { videoUrl: e.target.value })}
                      placeholder="https://..."
                      className="w-full rounded-lg border border-white/10 bg-[#07060b] px-3 py-2 text-sm text-white placeholder:text-zinc-600"
                    />
                  </label>
                  <label className="block min-w-0">
                    <span className="mb-0.5 block text-[10px] text-zinc-500">Tashqi tomosha</span>
                    <input
                      type="url"
                      value={row.externalWatchUrl}
                      onChange={(e) => setStreamRow(i, { externalWatchUrl: e.target.value })}
                      placeholder="https://..."
                      className="w-full rounded-lg border border-fuchsia-500/20 bg-[#07060b] px-3 py-2 text-sm text-white placeholder:text-zinc-600"
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={busy || !token}
            className="rounded-xl bg-gradient-to-r from-rose-500 to-violet-600 px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {busy ? "…" : editingId ? "Saqlash" : "Qo‘shish"}
          </button>
          {editingId ? (
            <button
              type="button"
              onClick={cancelEdit}
              className="rounded-xl border border-white/15 px-6 py-2.5 text-sm text-zinc-300 hover:bg-white/5"
            >
              Bekor qilish
            </button>
          ) : null}
        </div>
      </form>

      <h3 className="mb-3 text-sm font-semibold text-zinc-400">
        Mavjud qismlar ({episodes.length})
      </h3>
      <ul className="space-y-2">
        {episodes.length === 0 ? (
          <li className="rounded-xl border border-white/[0.06] bg-[#0c0a12]/40 px-4 py-6 text-center text-sm text-zinc-500">
            Hozircha qism yo‘q. Yuqoridan birinchi qismni qo‘shing.
          </li>
        ) : (
          episodes.map((ep) => (
            <li
              key={ep._id}
              className="flex flex-col gap-2 rounded-xl border border-white/[0.06] bg-[#0c0a12]/50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <span className="font-mono text-xs text-violet-400">#{ep.episodeNumber}</span>
                <span className="ml-2 text-sm text-white">
                  {ep.title?.trim() || `Qism ${ep.episodeNumber}`}
                </span>
                <p className="mt-1 text-xs text-zinc-500">
                  {ep.streams?.length
                    ? `${ep.streams.length} ta til: ${ep.streams.map((s) => labelForLang(s.lang)).join(", ")}`
                    : ep.videoUrl}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => startEdit(ep)}
                  className="rounded-lg border border-white/15 px-3 py-1.5 text-xs text-violet-300 hover:bg-white/5"
                >
                  Tahrirlash
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => remove(ep._id)}
                  className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-rose-300/90 hover:bg-rose-500/10"
                >
                  O‘chirish
                </button>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
