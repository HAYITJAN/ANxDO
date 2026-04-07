"use client";

import { useLocale } from "@/components/i18n/LocaleContext";
import type { MovieListItem } from "@/lib/movies";
import { isIframeEmbedUrl, toEmbedUrl } from "@/lib/videoEmbed";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

function shortEmbedSrc(url: string, autoplay: boolean): string {
  const embed = toEmbedUrl(url);
  if (!embed) return url;
  if (!isIframeEmbedUrl(embed)) return embed;
  try {
    const [base, query = ""] = embed.split("?");
    const p = new URLSearchParams(query);
    p.set("mute", "1");
    p.set("playsinline", "1");
    p.set("rel", "0");
    if (autoplay) p.set("autoplay", "1");
    else p.delete("autoplay");
    return `${base}?${p.toString()}`;
  } catch {
    return embed;
  }
}

function ShortVideo({
  url,
  active,
  posterUrl,
}: {
  url: string;
  active: boolean;
  posterUrl?: string;
}) {
  const embed = toEmbedUrl(url);
  const iframe = embed && isIframeEmbedUrl(embed);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || iframe) return;
    if (active) {
      void el.play().catch(() => {});
    } else {
      el.pause();
    }
  }, [active, iframe]);

  if (iframe && embed) {
    return (
      <iframe
        title="Treyler"
        src={shortEmbedSrc(embed, active)}
        className="absolute inset-0 h-full w-full border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowFullScreen
      />
    );
  }

  return (
    <video
      ref={videoRef}
      src={url.trim()}
      className="absolute inset-0 h-full w-full object-cover"
      poster={posterUrl || undefined}
      playsInline
      muted
      loop
      preload="metadata"
    />
  );
}

export function TrailerShortsFeed({ movies }: { movies: MovieListItem[] }) {
  const { t } = useLocale();
  const withShorts = movies.filter((m) => m.trailerShortUrl?.trim());
  const [activeId, setActiveId] = useState<string | null>(withShorts[0]?._id ?? null);
  const slideRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const shortIds = withShorts.map((m) => m._id).join("|");

  useEffect(() => {
    if (!shortIds) return;
    let io: IntersectionObserver | undefined;
    const tid = window.setTimeout(() => {
      const nodes = withShorts
        .map((m) => slideRefs.current.get(m._id))
        .filter((n): n is HTMLDivElement => Boolean(n));
      if (!nodes.length) return;
      io = new IntersectionObserver(
        (entries) => {
          const visible = entries
            .filter((e) => e.isIntersecting && e.intersectionRatio >= 0.45)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
          const id = (visible[0]?.target as HTMLElement | undefined)?.dataset.id;
          if (id) setActiveId(id);
        },
        { threshold: [0.35, 0.5, 0.65, 0.8] }
      );
      nodes.forEach((el) => io!.observe(el));
    }, 0);
    return () => {
      window.clearTimeout(tid);
      io?.disconnect();
    };
  }, [shortIds, withShorts]);

  if (withShorts.length === 0) {
    return (
      <section className="mb-6 w-full md:mb-10">
        <div className="mb-2 px-1">
          <h2 className="text-xl font-bold text-white sm:text-2xl">{t("shorts.title")}</h2>
          <p className="mt-1 text-sm text-zinc-500">{t("shorts.empty")}</p>
        </div>
      </section>
    );
  }

  const railH = "min(82dvh, 780px)";

  return (
    <section className="mb-6 w-full md:mb-10">
      <div className="mb-2 px-1">
        <h2 className="text-xl font-bold text-white sm:text-2xl">{t("shorts.title")}</h2>
        <p className="mt-1 text-sm text-zinc-500">{t("shorts.subtitle")}</p>
        <p className="mt-0.5 text-[11px] text-zinc-600">{t("shorts.hint")}</p>
      </div>

      <div className="mx-auto w-full max-w-md lg:max-w-lg">
        <div
          className="snap-y snap-mandatory overflow-y-auto overscroll-y-contain rounded-2xl border border-white/10 bg-zinc-950 shadow-[0_0_40px_-10px_rgba(88,28,135,0.35)] [-ms-overflow-style:none] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-fuchsia-900/60"
          style={{ height: railH }}
        >
          {withShorts.map((m) => {
            const active = activeId === m._id;
            const url = m.trailerShortUrl!.trim();
            return (
              <div
                key={m._id}
                data-id={m._id}
                ref={(el) => {
                  if (el) slideRefs.current.set(m._id, el);
                  else slideRefs.current.delete(m._id);
                }}
                className="relative flex h-[min(82dvh,780px)] w-full shrink-0 snap-start snap-always flex-col bg-black"
                style={{ height: railH }}
              >
                <div className="relative min-h-0 flex-1 bg-zinc-950">
                  <ShortVideo url={url} active={active} posterUrl={m.posterUrl} />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black via-black/70 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 z-10 p-4 pt-16">
                    <p className="line-clamp-2 text-lg font-bold leading-tight text-white drop-shadow-md sm:text-xl">
                      {m.title}
                    </p>
                    {m.year ? (
                      <p className="mt-1 text-xs font-medium text-zinc-400">{m.year}</p>
                    ) : null}
                    <Link
                      href={`/title/${m._id}`}
                      className="pointer-events-auto mt-4 inline-flex w-full max-w-sm items-center justify-center rounded-xl bg-gradient-to-r from-rose-600 via-fuchsia-600 to-violet-700 py-3.5 text-sm font-semibold text-white shadow-lg shadow-black/40 transition hover:brightness-110"
                    >
                      {t("shorts.watchMovie")}
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
