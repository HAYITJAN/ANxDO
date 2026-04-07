"use client";

import {
  canGuestAccessMovie,
  GUEST_FREE_TITLE_LIMIT,
  guestUniqueTitleCount,
  recordGuestMovie,
} from "@/lib/guestMovieLimit";
import { flagEmojiForLang, labelForLang } from "@/lib/audioLanguages";
import { isIframeEmbedUrl, toEmbedUrl } from "@/lib/videoEmbed";
import { useAuthStore } from "@/store/authStore";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

export type TMovie = {
  _id: string;
  title?: string;
  description?: string;
  type: string;
  videoUrl?: string;
  streams?: {
    lang: string;
    label?: string;
    videoUrl?: string;
    externalWatchUrl?: string;
  }[];
  posterUrl?: string;
};

export type TEpisode = {
  _id: string;
  episodeNumber: number;
  title?: string;
  videoUrl?: string;
  streams?: {
    lang: string;
    label?: string;
    videoUrl?: string;
    externalWatchUrl?: string;
  }[];
};

type ResolvedTrack = {
  lang: string;
  label: string;
  videoUrl?: string;
  externalWatchUrl?: string;
};

function resolveFilmStreams(movie: TMovie): ResolvedTrack[] {
  if (movie.streams?.length) {
    return movie.streams.map((s) => ({
      lang: s.lang,
      label: (s.label && s.label.trim()) || labelForLang(s.lang),
      videoUrl: s.videoUrl?.trim() || undefined,
      externalWatchUrl: s.externalWatchUrl?.trim() || undefined,
    }));
  }
  if (movie.videoUrl?.trim()) {
    return [{ lang: "default", label: "Video", videoUrl: movie.videoUrl.trim() }];
  }
  return [];
}

function resolveEpisodeStreams(ep: TEpisode): ResolvedTrack[] {
  if (ep.streams?.length) {
    return ep.streams.map((s) => ({
      lang: s.lang,
      label: (s.label && s.label.trim()) || labelForLang(s.lang),
      videoUrl: s.videoUrl?.trim() || undefined,
      externalWatchUrl: s.externalWatchUrl?.trim() || undefined,
    }));
  }
  if (ep.videoUrl?.trim()) {
    return [{ lang: "default", label: "Video", videoUrl: ep.videoUrl.trim() }];
  }
  return [];
}

const CONTINUE_KEY = "streamflix-continue";

/** YouTube asosiy oyna: qora fon, 16:9, yumaloq burchaklar */
function TrailerBlock({ url, title }: { url: string | null; title: string }) {
  const raw = url?.trim() ?? "";
  const embed = raw ? toEmbedUrl(raw) : null;
  if (!embed) {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
        <div className="absolute inset-0 flex items-center justify-center bg-[#0f0f0f]">
          <p className="px-4 text-center text-sm text-[#aaaaaa]">Treyler hali qo‘shilmagan.</p>
        </div>
      </div>
    );
  }
  return (
    <div className="relative w-full overflow-hidden rounded-xl bg-black shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
      {isIframeEmbedUrl(embed) ? (
        <iframe
          title={title}
          src={embed}
          className="aspect-video h-auto w-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      ) : (
        <video src={embed} controls className="aspect-video w-full border-0 bg-black" playsInline />
      )}
    </div>
  );
}

/**
 * YouTube o‘ng ustun: kommentariya o‘rniga til bo‘yicha tashqi sayt havolalari
 * (suggested video qatori: kichik “thumb”, sarlavha, qizil Ko‘rish).
 */
function ExternalWatchColumn({ tracks }: { tracks: ResolvedTrack[] }) {
  const list = tracks.filter((t) => t.externalWatchUrl?.trim());
  return (
    <aside className="flex max-h-[min(70vh,560px)] flex-col overflow-hidden rounded-xl bg-[#0f0f0f] shadow-[0_0_0_1px_rgba(255,255,255,0.08)]">
      <div className="border-b border-white/[0.08] px-4 py-3">
        <h3 className="text-base font-semibold text-white">Tomosha tili</h3>
        <p className="mt-0.5 text-xs text-[#aaaaaa]">YouTubeda kommentariya bo‘lgan joyda — bizda til tugmalari</p>
      </div>
      {list.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 text-center">
          <p className="text-sm text-[#aaaaaa]">Tashqi sayt havolalari hali qo‘shilmagan.</p>
        </div>
      ) : (
        <ul className="flex flex-1 flex-col gap-0 overflow-y-auto overscroll-contain py-2 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.2)_transparent]">
          {list.map((t, i) => (
            <li key={`${t.lang}-${i}`}>
              <a
                href={t.externalWatchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex gap-3 px-3 py-2 transition-colors hover:bg-white/[0.06]"
              >
                <div className="relative h-[68px] w-[120px] shrink-0 overflow-hidden rounded-lg bg-[#272727]">
                  <span
                    className="absolute inset-0 flex items-center justify-center text-3xl leading-none"
                    aria-hidden
                  >
                    {flagEmojiForLang(t.lang)}
                  </span>
                </div>
                <div className="min-w-0 flex-1 py-0.5">
                  <p className="line-clamp-2 text-sm font-medium leading-snug text-white">{t.label}</p>
                  <p className="mt-1 text-xs text-[#aaaaaa]">Tashqi sayt · yangi oyna</p>
                </div>
                <div className="flex shrink-0 items-center">
                  <span className="rounded-sm bg-[#ff0000] px-3 py-1.5 text-xs font-medium text-white transition hover:bg-[#cc0000]">
                    Ko‘rish
                  </span>
                </div>
              </a>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}

export function TitleWatchClient({
  movie,
  episodes,
}: {
  movie: TMovie;
  episodes: TEpisode[];
}) {
  const { token, user } = useAuthStore();
  const isLoggedIn = !!(token && user);

  const isSeries = episodes.length > 0;
  const [selectedEp, setSelectedEp] = useState<TEpisode | null>(() =>
    episodes.length > 0 ? episodes[0] : null
  );
  const [blocked, setBlocked] = useState(false);
  const [guestCountHint, setGuestCountHint] = useState(0);

  const filmTracks = useMemo(() => resolveFilmStreams(movie), [movie]);

  const epTracks = useMemo(
    () => (selectedEp ? resolveEpisodeStreams(selectedEp) : []),
    [selectedEp]
  );

  /** Chap tomonda: birinchi treyler (saytdagi video) */
  const filmTrailerUrl = useMemo(
    () => filmTracks.find((t) => t.videoUrl?.trim())?.videoUrl?.trim() ?? null,
    [filmTracks]
  );

  const epTrailerUrl = useMemo(
    () => epTracks.find((t) => t.videoUrl?.trim())?.videoUrl?.trim() ?? null,
    [epTracks]
  );

  const syncContinue = useCallback(() => {
    if (blocked) return;
    try {
      const raw = localStorage.getItem(CONTINUE_KEY);
      const list: Array<{
        id: string;
        title: string;
        posterUrl: string;
        progress: number;
        episodeCurrent?: number;
        episodeTotal?: number;
      }> = raw ? JSON.parse(raw) : [];
      const prev = list.find((x) => x.id === movie._id);
      const progress = Math.min(92, (prev?.progress ?? 10) + (prev ? 12 : 8));
      const entry = {
        id: movie._id,
        title: movie.title || "Kontent",
        posterUrl: movie.posterUrl || "",
        progress,
        episodeCurrent:
          isSeries && selectedEp ? selectedEp.episodeNumber : undefined,
        episodeTotal: isSeries ? episodes.length : undefined,
      };
      const next = [entry, ...list.filter((x) => x.id !== movie._id)].slice(0, 12);
      localStorage.setItem(CONTINUE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }, [blocked, movie._id, movie.title, movie.posterUrl, isSeries, selectedEp, episodes.length]);

  useEffect(() => {
    if (isLoggedIn) return;
    if (!canGuestAccessMovie(movie._id, false)) {
      setBlocked(true);
      return;
    }
    setBlocked(false);
    recordGuestMovie(movie._id);
    setGuestCountHint(guestUniqueTitleCount());
  }, [movie._id, isLoggedIn]);

  useEffect(() => {
    syncContinue();
  }, [syncContinue]);

  function selectEpisode(ep: TEpisode) {
    setSelectedEp(ep);
  }

  return (
    <div className="space-y-10">
      {blocked && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="max-w-md rounded-2xl border border-white/10 bg-[#0c0a12] p-6 text-center shadow-2xl">
            <p className="text-lg font-semibold text-white">Ro‘yxatdan o‘tish</p>
            <p className="mt-2 text-sm text-zinc-400">
              Mehmon sifatida <strong className="text-zinc-200">{GUEST_FREE_TITLE_LIMIT} ta</strong> turli
              film/serial ochib bo‘ldingiz. Davom etish uchun akkaunt yarating yoki tizimga kiring.
            </p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <Link
                href="/register"
                className="rounded-xl bg-gradient-to-r from-rose-500 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white"
              >
                Ro‘yxatdan o‘tish
              </Link>
              <Link
                href="/login"
                className="rounded-xl border border-white/15 px-5 py-2.5 text-sm font-medium text-zinc-200 hover:bg-white/5"
              >
                Kirish
              </Link>
            </div>
            <button
              type="button"
              onClick={() => setBlocked(false)}
              className="mt-4 text-xs text-zinc-500 hover:text-zinc-300"
            >
              Yopish
            </button>
          </div>
        </div>
      )}

      {!isLoggedIn && !blocked && (
        <p className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 text-xs text-zinc-500">
          Mehmon: ochilgan turli film/serial{" "}
          <span className="font-medium text-zinc-300">
            {guestCountHint}/{GUEST_FREE_TITLE_LIMIT}
          </span>
          . Limitdan keyin ro‘yxatdan o‘tish kerak.
        </p>
      )}

      {!blocked && isSeries && (
        <section>
          <h2 className="mb-4 text-lg font-semibold text-white">Episodes</h2>
          <div className="flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {episodes.map((ep) => {
              const active = selectedEp?._id === ep._id;
              return (
                <button
                  key={ep._id}
                  type="button"
                  onClick={() => selectEpisode(ep)}
                  className={`relative flex min-h-[104px] w-[88px] shrink-0 flex-col overflow-hidden rounded-2xl ring-2 transition sm:min-h-[112px] sm:w-[96px] ${
                    active
                      ? "bg-fuchsia-950/50 ring-fuchsia-500/70 shadow-lg shadow-fuchsia-950/30"
                      : "bg-zinc-900/90 ring-white/10 hover:ring-fuchsia-500/40"
                  }`}
                >
                  <div className="relative flex flex-1 items-center justify-center bg-gradient-to-b from-zinc-800 to-zinc-950">
                    {movie.posterUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={movie.posterUrl}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover opacity-35"
                      />
                    ) : null}
                    <span className="relative text-2xl font-bold text-white drop-shadow">{ep.episodeNumber}</span>
                  </div>
                  <span className="line-clamp-2 px-1.5 py-1.5 text-center text-[10px] font-medium leading-tight text-zinc-400">
                    {ep.title || `Qism ${ep.episodeNumber}`}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {!blocked && isSeries && selectedEp && epTracks.length > 0 && (
        <section className="border-t border-white/[0.07] pt-10">
          <h2 className="mb-1 text-xl font-semibold text-white">Tomosha</h2>
          <p className="mb-6 text-sm text-[#aaaaaa]">
            Asosiy oyna — treyler; o‘ng tomonda YouTubedagi kabi ikkinchi ustun: til bo‘yicha tashqi saytga o‘tish.
          </p>
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:gap-4">
            <div className="min-w-0 flex-1">
              <TrailerBlock
                url={epTrailerUrl}
                title={
                  selectedEp.title
                    ? `Seriya ${selectedEp.episodeNumber}: ${selectedEp.title}`
                    : `Seriya ${selectedEp.episodeNumber}`
                }
              />
              <div className="mt-3 border-b border-white/[0.07] pb-4">
                <h3 className="text-lg font-semibold leading-snug text-white">
                  {selectedEp.title
                    ? `Qism ${selectedEp.episodeNumber}: ${selectedEp.title}`
                    : `${selectedEp.episodeNumber}-qism`}
                </h3>
                <p className="mt-1 text-sm text-[#aaaaaa]">Treyler</p>
              </div>
            </div>
            <div className="w-full shrink-0 xl:w-[402px]">
              <ExternalWatchColumn tracks={epTracks} />
            </div>
          </div>
        </section>
      )}

      {!blocked && !isSeries && filmTracks.length > 0 && (
        <section className="border-t border-white/[0.07] pt-10">
          <h2 className="mb-1 text-xl font-semibold text-white">Tomosha</h2>
          <p className="mb-6 text-sm text-[#aaaaaa]">
            Asosiy oyna — treyler; o‘ng tomonda YouTubedagi kabi ikkinchi ustun: til bo‘yicha tashqi saytga o‘tish.
          </p>
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:gap-4">
            <div className="min-w-0 flex-1">
              <TrailerBlock url={filmTrailerUrl} title={movie.title ?? "Treyler"} />
              <div className="mt-3 border-b border-white/[0.07] pb-4">
                <h3 className="text-lg font-semibold leading-snug text-white">{movie.title ?? "Film"}</h3>
                <p className="mt-1 text-sm text-[#aaaaaa]">Treyler</p>
              </div>
            </div>
            <div className="w-full shrink-0 xl:w-[402px]">
              <ExternalWatchColumn tracks={filmTracks} />
            </div>
          </div>
        </section>
      )}

      {!blocked && !isSeries && filmTracks.length === 0 && (
        <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-14 text-center">
          <p className="text-sm text-zinc-500">Bu kontent uchun video hali qo‘shilmagan.</p>
          <p className="mt-2 text-xs text-zinc-600">Admin panel orqali til bo‘yicha video havolalarini kiriting.</p>
        </div>
      )}
    </div>
  );
}
