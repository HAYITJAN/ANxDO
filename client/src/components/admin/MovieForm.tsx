"use client";

import { apiFetch } from "@/lib/api";
import { AUDIO_LANGUAGE_OPTIONS, labelForLang } from "@/lib/audioLanguages";
import { uploadMovieShortVideo } from "@/lib/uploadMovieShort";
import type { Genre } from "@/lib/genres";
import { useAuthStore } from "@/store/authStore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type StreamRow = { part: number; lang: string; videoUrl: string; externalWatchUrl: string };

type LoadedMovie = {
  _id: string;
  title: string;
  titleI18n?: { uz?: string; ru?: string; en?: string };
  description?: string;
  descriptionI18n?: { uz?: string; ru?: string; en?: string };
  genre?: string[];
  year?: number;
  posterUrl?: string;
  bannerUrl?: string;
  trailerShortUrl?: string;
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

export function MovieForm({ movieId }: { movieId?: string }) {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const isEdit = Boolean(movieId);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [genresLoading, setGenresLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [contentType, setContentType] = useState<"movie" | "anime" | "dorama">("movie");
  const [streamRows, setStreamRows] = useState<StreamRow[]>([
    { part: 1, lang: "uz", videoUrl: "", externalWatchUrl: "" },
  ]);
  const [loaded, setLoaded] = useState<LoadedMovie | null>(null);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [loadingMovie, setLoadingMovie] = useState(isEdit);
  const [shortEditUrl, setShortEditUrl] = useState("");
  const [shortUploading, setShortUploading] = useState(false);
  const shortFileRef = useRef<HTMLInputElement>(null);

  function readTitles(fd: FormData) {
    const uz = ((fd.get("titleUz") as string) || "").trim();
    const ru = ((fd.get("titleRu") as string) || "").trim();
    const en = ((fd.get("titleEn") as string) || "").trim();
    const title = uz || ru || en;
    return { title, titleI18n: { uz, ru, en } };
  }

  function readDescriptions(fd: FormData) {
    const uz = ((fd.get("descriptionUz") as string) || "").trim();
    const ru = ((fd.get("descriptionRu") as string) || "").trim();
    const en = ((fd.get("descriptionEn") as string) || "").trim();
    return {
      description: uz || ru || en || "",
      descriptionI18n: { uz, ru, en },
    };
  }

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await apiFetch("/genres");
        if (res.ok) {
          const data = await res.json();
          if (!cancelled) setGenres(Array.isArray(data) ? data : []);
        }
      } finally {
        if (!cancelled) setGenresLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!movieId || !token) return;
    let cancelled = false;
    setLoadErr(null);
    setLoadingMovie(true);
    (async () => {
      try {
        const res = await apiFetch(`/movies/${movieId}?skipView=true`, { token });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.message || "Topilmadi");
        const m = data as LoadedMovie;
        if (cancelled) return;
        setLoaded(m);
        setContentType(m.type);
        setSelected(new Set(m.genre ?? []));
        setStreamRows(movieToStreamRows(m));
      } catch (e) {
        if (!cancelled) setLoadErr(e instanceof Error ? e.message : "Yuklashda xato");
      } finally {
        if (!cancelled) setLoadingMovie(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [movieId, token]);

  useEffect(() => {
    setShortEditUrl(loaded?.trailerShortUrl?.trim() ?? "");
  }, [loaded?._id, loaded?.trailerShortUrl]);

  function toggleGenre(name: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!token) return;
    const form = e.currentTarget;
    const fd = new FormData(form);
    const genre = Array.from(selected);

    const titles = readTitles(fd);
    if (!titles.title) {
      setError("Kamida bitta til uchun sarlavha kiriting (masalan O‘zbekcha).");
      return;
    }
    const { title, titleI18n } = titles;

    const type = fd.get("type") as "movie" | "anime" | "dorama";
    const trailerShortUrl = shortEditUrl.trim();

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
        setError("Kamida bitta til uchun saytdagi video yoki tashqi tomosha havolasi kiriting");
        return;
      }
      const desc = readDescriptions(fd);
      const body = {
        title,
        titleI18n,
        description: desc.description,
        descriptionI18n: desc.descriptionI18n,
        genre,
        year: fd.get("year") ? Number(fd.get("year")) : undefined,
        posterUrl: (fd.get("posterUrl") as string) || "",
        bannerUrl: (fd.get("bannerUrl") as string) || "",
        trailerShortUrl,
        type,
        streams,
        featured: fd.get("featured") === "on",
        newRelease: fd.get("newRelease") === "on",
      };
      setSubmitting(true);
      setError(null);
      try {
        const res = await apiFetch(isEdit && movieId ? `/movies/${movieId}` : "/movies", {
          method: isEdit ? "PUT" : "POST",
          token,
          body: JSON.stringify(body),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json.message || "Saqlashda xato");
        if (!isEdit) {
          form.reset();
          setSelected(new Set());
          setContentType("movie");
          setStreamRows([{ part: 1, lang: "uz", videoUrl: "", externalWatchUrl: "" }]);
        }
        router.push("/admin/movies");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Xato");
      } finally {
        setSubmitting(false);
      }
      return;
    }

    if (isEdit && movieId) {
      const desc = readDescriptions(fd);
      const movieBody = {
        title,
        titleI18n,
        description: desc.description,
        descriptionI18n: desc.descriptionI18n,
        genre,
        year: fd.get("year") ? Number(fd.get("year")) : undefined,
        posterUrl: (fd.get("posterUrl") as string) || "",
        bannerUrl: (fd.get("bannerUrl") as string) || "",
        trailerShortUrl,
        type,
        streams: [] as { lang: string; label: string; videoUrl: string }[],
        videoUrl: "",
        featured: fd.get("featured") === "on",
        newRelease: fd.get("newRelease") === "on",
      };
      setSubmitting(true);
      setError(null);
      try {
        const res = await apiFetch(`/movies/${movieId}`, {
          method: "PUT",
          token,
          body: JSON.stringify(movieBody),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json.message || "Saqlanmadi");
        router.push("/admin/movies");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Xato");
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
      setError("Har bir qism uchun kamida bitta tilga saytdagi video yoki tashqi havola kiriting");
      return;
    }

    const desc = readDescriptions(fd);
    const movieBody = {
      title,
      titleI18n,
      description: desc.description,
      descriptionI18n: desc.descriptionI18n,
      genre,
      year: fd.get("year") ? Number(fd.get("year")) : undefined,
      posterUrl: (fd.get("posterUrl") as string) || "",
      bannerUrl: (fd.get("bannerUrl") as string) || "",
      trailerShortUrl,
      type,
      streams: [] as { lang: string; label: string; videoUrl: string; externalWatchUrl: string }[],
      videoUrl: "",
      featured: fd.get("featured") === "on",
      newRelease: fd.get("newRelease") === "on",
    };

    setSubmitting(true);
    setError(null);
    try {
      const res = await apiFetch("/movies", {
        method: "POST",
        token,
        body: JSON.stringify(movieBody),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.message || "Serial saqlanmadi");
      const newId = json._id as string;
      const parts = Array.from(byPart.keys()).sort((a, b) => a - b);
      for (const part of parts) {
        const streams = Array.from(byPart.get(part)!.values());
        const epRes = await apiFetch("/episodes", {
          method: "POST",
          token,
          body: JSON.stringify({
            movieId: newId,
            episodeNumber: part,
            title: "",
            streams,
          }),
        });
        const epJson = await epRes.json().catch(() => ({}));
        if (!epRes.ok) {
          throw new Error(epJson.message || `${part}-qism saqlanmadi`);
        }
      }
      form.reset();
      setSelected(new Set());
      setContentType("movie");
      setStreamRows([{ part: 1, lang: "uz", videoUrl: "", externalWatchUrl: "" }]);
      router.push("/admin/movies");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Xato");
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
        <Link href="/admin/movies" className="mb-4 inline-block text-sm text-violet-400 hover:underline">
          ← Kinolar
        </Link>
        <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{loadErr}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/admin/movies" className="mb-4 inline-block text-sm text-violet-400 hover:underline">
        ← Kinolar
      </Link>
      <h2 className="font-[family-name:var(--font-syne)] mb-6 text-lg font-semibold text-white">
        {isEdit ? "Kinoni tahrirlash" : "Yangi kino / seriya"}
      </h2>
      <form key={loaded?._id ?? "create"} onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-sm text-rose-200">
            {error}
          </p>
        )}

        <p className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 text-xs leading-relaxed text-zinc-500">
          Saytda til almashganda sarlavha va tavsif ham almashadi. Faqat bitta tilni to‘ldirsangiz, boshqa tillarda ham
          shu matn chiqadi — har til uchun alohida yozing.
        </p>

        <label className="block">
          <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-zinc-500">
            Sarlavha (UZ) *
          </span>
          <input
            name="titleUz"
            defaultValue={loaded?.titleI18n?.uz ?? loaded?.title ?? ""}
            className="w-full rounded-xl border border-white/[0.08] bg-[#0c0a12] px-4 py-3 text-sm text-white outline-none ring-violet-500/30 placeholder:text-zinc-600 focus:ring-2"
            placeholder="Masalan: One Piece"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-zinc-500">Sarlavha (RU)</span>
          <input
            name="titleRu"
            defaultValue={loaded?.titleI18n?.ru ?? ""}
            className="w-full rounded-xl border border-white/[0.08] bg-[#0c0a12] px-4 py-3 text-sm text-white outline-none ring-violet-500/30 placeholder:text-zinc-600 focus:ring-2"
            placeholder="Например: Ван-Пис"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-zinc-500">Sarlavha (EN)</span>
          <input
            name="titleEn"
            defaultValue={loaded?.titleI18n?.en ?? ""}
            className="w-full rounded-xl border border-white/[0.08] bg-[#0c0a12] px-4 py-3 text-sm text-white outline-none ring-violet-500/30 placeholder:text-zinc-600 focus:ring-2"
            placeholder="e.g. One Piece"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-zinc-500">
            Tavsif (UZ)
          </span>
          <textarea
            name="descriptionUz"
            rows={4}
            defaultValue={loaded?.descriptionI18n?.uz ?? loaded?.description ?? ""}
            className="w-full resize-none rounded-xl border border-white/[0.08] bg-[#0c0a12] px-4 py-3 text-sm text-white outline-none ring-violet-500/30 placeholder:text-zinc-600 focus:ring-2"
            placeholder="Qisqa syujet (o‘zbekcha)..."
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-zinc-500">
            Tavsif (RU)
          </span>
          <textarea
            name="descriptionRu"
            rows={4}
            defaultValue={loaded?.descriptionI18n?.ru ?? ""}
            className="w-full resize-none rounded-xl border border-white/[0.08] bg-[#0c0a12] px-4 py-3 text-sm text-white outline-none ring-violet-500/30 placeholder:text-zinc-600 focus:ring-2"
            placeholder="Краткий сюжет (по-русски)..."
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-zinc-500">
            Tavsif (EN)
          </span>
          <textarea
            name="descriptionEn"
            rows={4}
            defaultValue={loaded?.descriptionI18n?.en ?? ""}
            className="w-full resize-none rounded-xl border border-white/[0.08] bg-[#0c0a12] px-4 py-3 text-sm text-white outline-none ring-violet-500/30 placeholder:text-zinc-600 focus:ring-2"
            placeholder="Short synopsis (English)..."
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-zinc-500">
              Tur *
            </span>
            <select
              name="type"
              required
              value={contentType}
              onChange={(e) => setContentType(e.target.value as "movie" | "anime" | "dorama")}
              className="w-full rounded-xl border border-white/[0.08] bg-[#0c0a12] px-4 py-3 text-sm text-white outline-none ring-violet-500/30 focus:ring-2"
            >
              <option value="movie">Film</option>
              <option value="anime">Anime</option>
              <option value="dorama">Dorama</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-zinc-500">
              Yil
            </span>
            <input
              name="year"
              type="number"
              min={1900}
              max={2100}
              defaultValue={loaded?.year != null ? String(loaded.year) : ""}
              className="w-full rounded-xl border border-white/[0.08] bg-[#0c0a12] px-4 py-3 text-sm text-white outline-none ring-violet-500/30 focus:ring-2"
            />
          </label>
        </div>

        <div className="block">
          <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">Janrlar</span>
            <Link href="/admin/genres" className="text-xs text-violet-400 hover:underline">
              Janr qo‘shish
            </Link>
          </div>
          {genresLoading ? (
            <p className="text-sm text-zinc-500">Janrlar yuklanmoqda…</p>
          ) : genres.length === 0 ? (
            <p className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-200/90">
              Avval{" "}
              <Link href="/admin/genres" className="font-medium text-violet-400 underline">
                Janrlar
              </Link>{" "}
              sahifasida kamida bitta janr yarating.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2 rounded-xl border border-white/[0.08] bg-[#0c0a12]/80 p-3">
              {genres.map((g) => (
                <label
                  key={g._id}
                  className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${
                    selected.has(g.name)
                      ? "border-violet-500/50 bg-violet-600/25 text-white"
                      : "border-white/10 bg-[#07060b] text-zinc-300 hover:border-white/20"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={selected.has(g.name)}
                    onChange={() => toggleGenre(g.name)}
                  />
                  {g.name}
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-zinc-400">
          <span className="font-medium text-zinc-300">Reyting</span> foydalanuvchilar tomonidan 1–10
          oralig‘ida beriladi; o‘rtacha qiymat avtomatik hisoblanadi.
        </div>

        {isSerial && isEdit && movieId ? (
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100/90">
            <span className="font-medium text-amber-200">Anime / Dorama:</span> video qismlarni{" "}
            <Link
              href={`/admin/movies/${movieId}/episodes`}
              className="text-violet-300 underline hover:text-violet-200"
            >
              Qismlar
            </Link>{" "}
            sahifasida tahrirlang. Bu yerda sarlavha, poster va boshqa ma’lumotlar saqlanadi.
          </div>
        ) : (
          <div className="space-y-3 rounded-xl border border-white/[0.08] bg-[#0c0a12]/60 p-4">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <span className="block text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Til bo‘yicha: saytdagi video va tashqi tomosha{isSerial ? " (qism raqami)" : ""}
                </span>
                <p className="mt-1 text-xs text-zinc-600">
                  {isSerial ? (
                    <>
                      <strong>Anime / Dorama:</strong> har qatorda qism + til. <strong>Saytdagi video</strong> — treyler
                      yoki tahrir; <strong>tashqi havola</strong> — to‘liq qism boshqa saytda. Ikkalasidan kamida bittasi
                      bo‘lishi kerak.
                    </>
                  ) : (
                    <>
                      Har til uchun: treyler/YouTube saytda ijro etiladi; to‘liq filmni boshqa saytda ochish uchun
                      tashqi URL. Kamida bitta maydon (sayt yoki tashqi) to‘ldiriladi.
                    </>
                  )}
                </p>
                <p className="mt-2 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-[11px] leading-relaxed text-zinc-500">
                  <strong className="text-zinc-400">Saytdagi video:</strong> YouTube, Vimeo yoki{" "}
                  <span className="font-mono">.mp4</span>. <strong className="text-zinc-400">Tashqi havola:</strong>{" "}
                  foydalanuvchi tanlagan tilda yangi oynada ochiladigan ruxsatli manba.
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
                      aria-label="Qatorni o‘chirish"
                    >
                      O‘chirish
                    </button>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="block min-w-0">
                      <span className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-zinc-500">
                        Saytdagi video (treyler / YouTube / .mp4) — ixtiyoriy
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
                        To‘liq tomosha — tashqi sayt havolasi — ixtiyoriy
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
          <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-zinc-500">
            Poster URL
          </span>
          <input
            name="posterUrl"
            type="url"
            defaultValue={loaded?.posterUrl ?? ""}
            className="w-full rounded-xl border border-white/[0.08] bg-[#0c0a12] px-4 py-3 text-sm text-white outline-none ring-violet-500/30 focus:ring-2"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-zinc-500">
            Banner URL
          </span>
          <input
            name="bannerUrl"
            type="url"
            defaultValue={loaded?.bannerUrl ?? ""}
            className="w-full rounded-xl border border-white/[0.08] bg-[#0c0a12] px-4 py-3 text-sm text-white outline-none ring-violet-500/30 focus:ring-2"
          />
        </label>

        <div className="block rounded-xl border border-fuchsia-500/20 bg-[#0c0a12]/80 p-4">
          <span className="mb-2 block text-xs font-medium uppercase tracking-wide text-fuchsia-200/90">
            Bosh sahifa: «Siz ko‘rishingiz kerak bo‘lgan filmlar» lentaligi
          </span>
          <p className="mb-3 text-[11px] leading-relaxed text-zinc-500">
            1–2 daqiqalik vertikal montaj (TikTok / Reels kabi). Kompyuterdan yuklang yoki tayyor havola
            qo‘ying (YouTube Shorts, to‘g‘ri MP4 URL).
          </p>
          <input
            ref={shortFileRef}
            type="file"
            accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
            className="sr-only"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f || !token) return;
              setShortUploading(true);
              setError(null);
              try {
                const { url } = await uploadMovieShortVideo(f, token);
                setShortEditUrl(url);
              } catch (err) {
                setError(err instanceof Error ? err.message : "Yuklashda xato");
              } finally {
                setShortUploading(false);
                e.target.value = "";
              }
            }}
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={!token || shortUploading}
              onClick={() => shortFileRef.current?.click()}
              className="rounded-xl border border-fuchsia-500/40 bg-fuchsia-950/40 px-4 py-2.5 text-sm font-medium text-fuchsia-100 transition hover:bg-fuchsia-900/50 disabled:opacity-50"
            >
              {shortUploading ? "Yuklanmoqda…" : "Kompyuterdan video yuklash"}
            </button>
          </div>
          <label className="mt-3 block">
            <span className="mb-1.5 block text-[10px] font-medium uppercase tracking-wide text-zinc-500">
              Yoki video havolasi (ixtiyoriy)
            </span>
            <input
              name="trailerShortUrl"
              type="url"
              value={shortEditUrl}
              onChange={(e) => setShortEditUrl(e.target.value)}
              className="w-full rounded-xl border border-white/[0.08] bg-[#07060b] px-4 py-3 text-sm text-white outline-none ring-violet-500/30 focus:ring-2"
              placeholder="https://... (yuklangandan keyin avto to‘ldiriladi)"
            />
          </label>
        </div>

        <div className="rounded-xl border border-violet-500/25 bg-violet-950/15 p-4">
          <span className="mb-2 block text-xs font-medium uppercase tracking-wide text-violet-200/90">
            Bosh sahifa va ko‘rinish
          </span>
          <p className="mb-4 text-[11px] leading-relaxed text-zinc-500">
            <span className="font-medium text-zinc-400">Yangi chiqan</span> — kartada NEW, bildirishnomalar, bosh sahifa
            bannerida 10 soniyada almashinuv (oxirgi 5 ta yangi).{" "}
            <span className="font-medium text-zinc-400">Tavsiya etilgan</span> — asosiy slot; bannerda faqat yangi
            chiqishlar bo‘lmasa ishlatiladi.
          </p>
          <div className="flex flex-wrap gap-6">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-300">
              <input
                name="newRelease"
                type="checkbox"
                defaultChecked={loaded?.newRelease ?? false}
                className="rounded border-white/20 bg-[#0c0a12]"
              />
              Yangi chiqan (NEW + banner)
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-300">
              <input
                name="featured"
                type="checkbox"
                defaultChecked={loaded?.featured ?? false}
                className="rounded border-white/20 bg-[#0c0a12]"
              />
              Tavsiya etilgan
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-gradient-to-r from-rose-500 to-violet-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-900/30 transition hover:opacity-95 disabled:opacity-50 sm:w-auto sm:px-10"
        >
          {submitting ? "Saqlanmoqda…" : isEdit ? "O‘zgarishlarni saqlash" : "Kinoni saqlash"}
        </button>
      </form>
    </div>
  );
}
