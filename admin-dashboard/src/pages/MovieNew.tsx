import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { AUDIO_LANGUAGE_OPTIONS, labelForLang } from "../lib/audioLanguages";

type Genre = { _id: string; name: string };
type StreamRow = { part: number; lang: string; videoUrl: string; externalWatchUrl: string };

type LoadedMovie = {
  _id: string;
  title: string;
  description?: string;
  genre?: string[];
  year?: number;
  posterUrl?: string;
  bannerUrl?: string;
  type: "movie" | "anime" | "dorama";
  streams?: { lang: string; videoUrl?: string; externalWatchUrl?: string }[];
  videoUrl?: string;
  featured?: boolean;
  newRelease?: boolean;
};

function movieToStreamRows(m: LoadedMovie): StreamRow[] {
  if (m.type !== "movie") return [{ part: 1, lang: "uz", videoUrl: "", externalWatchUrl: "" }];
  if (m.streams?.length) {
    return m.streams.map((s) => ({
      part: 1,
      lang: s.lang,
      videoUrl: s.videoUrl ?? "",
      externalWatchUrl: s.externalWatchUrl ?? "",
    }));
  }
  if (m.videoUrl?.trim()) {
    return [{ part: 1, lang: "uz", videoUrl: m.videoUrl, externalWatchUrl: "" }];
  }
  return [{ part: 1, lang: "uz", videoUrl: "", externalWatchUrl: "" }];
}

export default function MovieNew() {
  const { movieId } = useParams<{ movieId: string }>();
  const isEdit = Boolean(movieId);
  const navigate = useNavigate();
  const [loaded, setLoaded] = useState<LoadedMovie | null>(null);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [loadingMovie, setLoadingMovie] = useState(isEdit);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loadingG, setLoadingG] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [contentType, setContentType] = useState<"movie" | "anime" | "dorama">("movie");
  const [streamRows, setStreamRows] = useState<StreamRow[]>([
    { part: 1, lang: "uz", videoUrl: "", externalWatchUrl: "" },
  ]);
  const [err, setErr] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let c = false;
    (async () => {
      const res = await apiFetch("/genres");
      if (res.ok) {
        const data = await res.json();
        if (!c) setGenres(Array.isArray(data) ? data : []);
      }
      if (!c) setLoadingG(false);
    })();
    return () => {
      c = true;
    };
  }, []);

  useEffect(() => {
    if (!movieId) return;
    let c = false;
    setLoadErr(null);
    setLoadingMovie(true);
    (async () => {
      try {
        const res = await apiFetch(`/movies/${movieId}?skipView=true`);
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || "Topilmadi");
        const m = data as LoadedMovie;
        if (c) return;
        setLoaded(m);
        setContentType(m.type);
        setSelected(new Set(m.genre ?? []));
        setStreamRows(movieToStreamRows(m));
      } catch (e) {
        if (!c) setLoadErr(e instanceof Error ? e.message : "Yuklashda xato");
      } finally {
        if (!c) setLoadingMovie(false);
      }
    })();
    return () => {
      c = true;
    };
  }, [movieId]);

  function toggle(name: string) {
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(name)) n.delete(name);
      else n.add(name);
      return n;
    });
  }

  function addStreamRow() {
    setStreamRows((rows) => {
      const last = rows[rows.length - 1];
      const part = last?.part ?? 1;
      return [...rows, { part, lang: "en", videoUrl: "", externalWatchUrl: "" }];
    });
  }

  function addNextPartRow() {
    setStreamRows((rows) => {
      const maxP = rows.reduce((m, r) => Math.max(m, r.part || 1), 1);
      return [...rows, { part: maxP + 1, lang: "uz", videoUrl: "", externalWatchUrl: "" }];
    });
  }

  function removeStreamRow(i: number) {
    setStreamRows((rows) => (rows.length <= 1 ? rows : rows.filter((_, j) => j !== i)));
  }

  function setStreamRow(i: number, patch: Partial<StreamRow>) {
    setStreamRows((rows) => rows.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  }

  const isSerial = contentType === "anime" || contentType === "dorama";

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const title = (fd.get("title") as string).trim();
    if (!title) {
      setErr("Sarlavha kerak");
      return;
    }
    const type = fd.get("type") as "movie" | "anime" | "dorama";

    if (type === "movie") {
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
      const body = {
        title,
        description: (fd.get("description") as string) || "",
        genre: Array.from(selected),
        year: fd.get("year") ? Number(fd.get("year")) : undefined,
        posterUrl: (fd.get("posterUrl") as string) || "",
        bannerUrl: (fd.get("bannerUrl") as string) || "",
        type,
        streams,
        featured: fd.get("featured") === "on",
        newRelease: fd.get("newRelease") === "on",
      };
      setSubmitting(true);
      setErr(null);
      try {
        const res = await apiFetch(isEdit && movieId ? `/movies/${movieId}` : "/movies", {
          method: isEdit ? "PUT" : "POST",
          body: JSON.stringify(body),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json.message || "Xato");
        if (!isEdit) {
          setContentType("movie");
          setStreamRows([{ part: 1, lang: "uz", videoUrl: "", externalWatchUrl: "" }]);
        }
        navigate("/movies");
      } catch (err) {
        setErr(err instanceof Error ? err.message : "Xato");
      } finally {
        setSubmitting(false);
      }
      return;
    }

    if (isEdit && movieId) {
      const movieBody = {
        title,
        description: (fd.get("description") as string) || "",
        genre: Array.from(selected),
        year: fd.get("year") ? Number(fd.get("year")) : undefined,
        posterUrl: (fd.get("posterUrl") as string) || "",
        bannerUrl: (fd.get("bannerUrl") as string) || "",
        type,
        streams: [] as { lang: string; label: string; videoUrl: string; externalWatchUrl: string }[],
        videoUrl: "",
        featured: fd.get("featured") === "on",
        newRelease: fd.get("newRelease") === "on",
      };
      setSubmitting(true);
      setErr(null);
      try {
        const res = await apiFetch(`/movies/${movieId}`, { method: "PUT", body: JSON.stringify(movieBody) });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json.message || "Saqlanmadi");
        navigate("/movies");
      } catch (err) {
        setErr(err instanceof Error ? err.message : "Xato");
      } finally {
        setSubmitting(false);
      }
      return;
    }

    const byPart = new Map<
      number,
      Map<string, { lang: string; label: string; videoUrl: string; externalWatchUrl: string }>
    >();
    for (const r of streamRows) {
      const u = r.videoUrl.trim();
      const ext = r.externalWatchUrl.trim();
      if (!r.lang || (!u && !ext)) continue;
      const part = Math.max(1, Math.floor(Number(r.part)) || 1);
      if (!byPart.has(part)) byPart.set(part, new Map());
      byPart
        .get(part)!
        .set(r.lang, { lang: r.lang, label: labelForLang(r.lang), videoUrl: u, externalWatchUrl: ext });
    }
    if (byPart.size === 0) {
      setErr("Har bir qism uchun kamida bitta tilga saytdagi video yoki tashqi havola kiriting");
      return;
    }

    const movieBody = {
      title,
      description: (fd.get("description") as string) || "",
      genre: Array.from(selected),
      year: fd.get("year") ? Number(fd.get("year")) : undefined,
      posterUrl: (fd.get("posterUrl") as string) || "",
      bannerUrl: (fd.get("bannerUrl") as string) || "",
      type,
      streams: [] as { lang: string; label: string; videoUrl: string; externalWatchUrl: string }[],
      videoUrl: "",
      featured: fd.get("featured") === "on",
      newRelease: fd.get("newRelease") === "on",
    };

    setSubmitting(true);
    setErr(null);
    try {
      const res = await apiFetch("/movies", { method: "POST", body: JSON.stringify(movieBody) });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.message || "Serial saqlanmadi");
      const movieId = json._id as string;
      const parts = Array.from(byPart.keys()).sort((a, b) => a - b);
      for (const part of parts) {
        const streams = Array.from(byPart.get(part)!.values());
        const epRes = await apiFetch("/episodes", {
          method: "POST",
          body: JSON.stringify({
            movieId,
            episodeNumber: part,
            title: "",
            streams,
          }),
        });
        const epJson = await epRes.json().catch(() => ({}));
        if (!epRes.ok) throw new Error(epJson.message || `${part}-qism saqlanmadi`);
      }
      setContentType("movie");
      setStreamRows([{ part: 1, lang: "uz", videoUrl: "", externalWatchUrl: "" }]);
      navigate("/movies");
    } catch (err) {
      setErr(err instanceof Error ? err.message : "Xato");
    } finally {
      setSubmitting(false);
    }
  }

  if (isEdit && loadingMovie) {
    return (
      <div className="mx-auto max-w-2xl py-16 text-center text-zinc-500">
        <span className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
        <p className="mt-4 text-sm">Kino yuklanmoqda…</p>
      </div>
    );
  }

  if (isEdit && loadErr) {
    return (
      <div className="mx-auto max-w-2xl">
        <Link to="/movies" className="mb-4 inline-block text-sm text-violet-400 hover:underline">
          ← Kinolar
        </Link>
        <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{loadErr}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link to="/movies" className="mb-4 inline-block text-sm text-violet-400 hover:underline">
        ← Kinolar
      </Link>
      <h2 className="font-display mb-6 text-lg font-semibold text-white">
        {isEdit ? "Kinoni tahrirlash" : "Yangi kino / seriya"}
      </h2>
      <form key={loaded?._id ?? "create"} onSubmit={onSubmit} className="space-y-5">
        {err && (
          <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-sm text-rose-200">{err}</p>
        )}
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-zinc-500">Sarlavha *</span>
          <input
            name="title"
            required
            defaultValue={loaded?.title ?? ""}
            className="w-full rounded-xl border border-white/[0.08] bg-[#0c0a12] px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-violet-500/40"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-zinc-500">Tavsif</span>
          <textarea
            name="description"
            rows={4}
            defaultValue={loaded?.description ?? ""}
            className="w-full resize-none rounded-xl border border-white/[0.08] bg-[#0c0a12] px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-violet-500/40"
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-zinc-500">Tur *</span>
            <select
              name="type"
              required
              value={contentType}
              onChange={(e) => setContentType(e.target.value as "movie" | "anime" | "dorama")}
              className="w-full rounded-xl border border-white/[0.08] bg-[#0c0a12] px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-violet-500/40"
            >
              <option value="movie">Film</option>
              <option value="anime">Anime</option>
              <option value="dorama">Dorama</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-zinc-500">Yil</span>
            <input
              name="year"
              type="number"
              min={1900}
              max={2100}
              defaultValue={loaded?.year != null ? String(loaded.year) : ""}
              className="w-full rounded-xl border border-white/[0.08] bg-[#0c0a12] px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-violet-500/40"
            />
          </label>
        </div>
        <div>
          <div className="mb-2 flex justify-between gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">Janrlar</span>
            <Link to="/genres" className="text-xs text-violet-400 hover:underline">
              Janr qo‘shish
            </Link>
          </div>
          {loadingG ? (
            <p className="text-sm text-zinc-500">Yuklanmoqda…</p>
          ) : (
            <div className="flex flex-wrap gap-2 rounded-xl border border-white/[0.08] bg-[#0c0a12]/80 p-3">
              {genres.map((g) => (
                <button
                  key={g._id}
                  type="button"
                  onClick={() => toggle(g.name)}
                  className={`rounded-lg border px-3 py-2 text-sm transition ${
                    selected.has(g.name)
                      ? "border-violet-500/50 bg-violet-600/25 text-white"
                      : "border-white/10 bg-[#07060b] text-zinc-300 hover:border-white/20"
                  }`}
                >
                  {g.name}
                </button>
              ))}
            </div>
          )}
        </div>
        <p className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-zinc-400">
          Reyting foydalanuvchi baholaridan avtomatik hisoblanadi.
        </p>
        {isSerial && isEdit && movieId ? (
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100/90">
            <span className="font-medium text-amber-200">Anime / Dorama:</span> video qismlarni{" "}
            <Link to={`/movies/${movieId}/episodes`} className="text-violet-300 underline hover:text-violet-200">
              Qismlar
            </Link>{" "}
            sahifasida tahrirlang. Bu yerda sarlavha, poster va boshqa ma’lumotlar saqlanadi.
          </div>
        ) : (
          <div className="space-y-3 rounded-xl border border-white/[0.08] bg-[#0c0a12]/60 p-4">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <span className="block text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Til: saytdagi video + tashqi tomosha{isSerial ? " (qism)" : ""}
                </span>
                <p className="mt-1 text-xs text-zinc-600">
                  {isSerial
                    ? "Har qatorda qism + til. Saytdagi video (treyler) va/yoki to‘liq qism uchun tashqi URL."
                    : "Har til uchun: treyler saytda, to‘liq film — boshqa sayt havolasi. Kamida bitta maydon."}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {isSerial ? (
                  <button
                    type="button"
                    onClick={addNextPartRow}
                    className="shrink-0 rounded-lg border border-amber-500/30 px-3 py-1.5 text-xs text-amber-200/90 hover:bg-amber-500/10"
                  >
                    + Keyingi qism
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={addStreamRow}
                  className="shrink-0 rounded-lg border border-white/15 px-3 py-1.5 text-xs text-violet-300 hover:bg-white/5"
                >
                  + Til qo‘shish
                </button>
              </div>
            </div>
            <div className="space-y-3">
              {streamRows.map((row, i) => (
                <div
                  key={i}
                  className="flex flex-col gap-3 rounded-lg border border-white/[0.06] bg-[#07060b]/80 p-3"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    {isSerial ? (
                      <input
                        type="number"
                        min={1}
                        value={row.part}
                        onChange={(e) =>
                          setStreamRow(i, { part: Math.max(1, Math.floor(Number(e.target.value)) || 1) })
                        }
                        title="Qism raqami"
                        className="w-full shrink-0 rounded-lg border border-white/10 bg-[#0c0a12] px-3 py-2.5 text-sm text-white sm:w-20"
                      />
                    ) : null}
                    <select
                      value={row.lang}
                      onChange={(e) => setStreamRow(i, { lang: e.target.value })}
                      className="w-full shrink-0 rounded-lg border border-white/10 bg-[#0c0a12] px-3 py-2.5 text-sm text-white sm:w-48"
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
                      className="shrink-0 rounded-lg border border-white/10 px-3 py-2 text-xs text-zinc-500 hover:border-rose-500/30 hover:text-rose-300 sm:ml-auto"
                    >
                      O‘chirish
                    </button>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="block min-w-0">
                      <span className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-zinc-500">
                        Saytdagi video (treyler)
                      </span>
                      <input
                        type="url"
                        value={row.videoUrl}
                        onChange={(e) => setStreamRow(i, { videoUrl: e.target.value })}
                        placeholder="https://..."
                        className="w-full rounded-lg border border-white/10 bg-[#0c0a12] px-3 py-2.5 text-sm text-white placeholder:text-zinc-600"
                      />
                    </label>
                    <label className="block min-w-0">
                      <span className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-zinc-500">
                        Tashqi tomosha URL
                      </span>
                      <input
                        type="url"
                        value={row.externalWatchUrl}
                        onChange={(e) => setStreamRow(i, { externalWatchUrl: e.target.value })}
                        placeholder="https://..."
                        className="w-full rounded-lg border border-fuchsia-500/20 bg-[#0c0a12] px-3 py-2.5 text-sm text-white placeholder:text-zinc-600"
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-zinc-500">Poster URL</span>
          <input
            name="posterUrl"
            type="url"
            defaultValue={loaded?.posterUrl ?? ""}
            className="w-full rounded-xl border border-white/[0.08] bg-[#0c0a12] px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-violet-500/40"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-zinc-500">Banner URL</span>
          <input
            name="bannerUrl"
            type="url"
            defaultValue={loaded?.bannerUrl ?? ""}
            className="w-full rounded-xl border border-white/[0.08] bg-[#0c0a12] px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-violet-500/40"
          />
        </label>
        <div className="flex flex-wrap gap-6">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-300">
            <input
              name="featured"
              type="checkbox"
              defaultChecked={loaded?.featured ?? false}
              className="rounded border-white/20 bg-[#0c0a12]"
            />
            Tavsiya etilgan
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-300">
            <input
              name="newRelease"
              type="checkbox"
              defaultChecked={loaded?.newRelease ?? false}
              className="rounded border-white/20 bg-[#0c0a12]"
            />
            Yangi chiqish
          </label>
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-xl bg-gradient-to-r from-rose-500 to-violet-600 px-10 py-3.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {submitting ? "Saqlanmoqda…" : isEdit ? "O‘zgarishlarni saqlash" : "Saqlash"}
        </button>
      </form>
    </div>
  );
}
