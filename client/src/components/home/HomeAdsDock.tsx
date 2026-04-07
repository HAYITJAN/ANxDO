"use client";

import type { AdItem } from "@/lib/ads";
import { AdMedia } from "@/components/home/AdMedia";
import { HomeAdPlaceholders } from "@/components/home/HomeAdPlaceholders";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

const AD_VAR = "--home-ad-bar-height";
const ENTRY_SESSION_KEY = "ando_home_entry_ad_seen";
/** Pastki lenta necha daqiqadan keyin qayta ochilishini belgilang */
const PERIODIC_EVERY_MINUTES = 5;
const PERIODIC_INTERVAL_MS = PERIODIC_EVERY_MINUTES * 60 * 1000;

function EntryAdModal({ ads, onClose }: { ads: AdItem[]; onClose: () => void }) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const ad = ads[0];
  if (!ad) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Reklama"
    >
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 shadow-2xl shadow-black/80 ring-1 ring-violet-500/20">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/70 text-lg font-light text-white ring-1 ring-white/20 backdrop-blur transition hover:bg-black/90"
          aria-label="Yopish"
        >
          ×
        </button>
        {ad.linkUrl?.trim() ? (
          <a
            href={ad.linkUrl.trim()}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <div className="relative aspect-video w-full bg-zinc-950">
              <AdMedia ad={ad} imgClassName="h-full w-full object-cover" />
            </div>
          </a>
        ) : (
          <div className="relative aspect-video w-full bg-zinc-950">
            <AdMedia ad={ad} imgClassName="h-full w-full object-cover" />
          </div>
        )}
        {(ad.title || ad.body) && (
          <div className="space-y-1 px-4 py-3">
            {ad.title ? <p className="text-sm font-semibold text-white">{ad.title}</p> : null}
            {ad.body ? <p className="text-xs leading-relaxed text-zinc-500">{ad.body}</p> : null}
          </div>
        )}
      </div>
    </div>
  );
}

function PeriodicAdsStrip({ ads, onClose }: { ads: AdItem[]; onClose: () => void }) {
  return (
    <div className="relative max-h-[42vh] border-b border-violet-500/25 bg-[#0a0710]/98 shadow-[0_-8px_32px_rgba(0,0,0,0.45)]">
      <button
        type="button"
        onClick={onClose}
        className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/65 text-base text-zinc-200 ring-1 ring-white/15 transition hover:bg-black/85"
        aria-label="Yopish"
      >
        ×
      </button>
      <div className="flex max-h-[inherit] gap-3 overflow-x-auto px-3 pb-3 pl-3 pr-10 pt-9 sm:px-4">
        {ads.map((ad) => {
          const card = (
            <div className="w-[min(85vw,20rem)] shrink-0 overflow-hidden rounded-xl border border-white/10 bg-zinc-900/80">
              <div className="relative aspect-[21/9] min-h-[72px] w-full bg-zinc-950 sm:aspect-video sm:min-h-[100px]">
                <AdMedia ad={ad} imgClassName="h-full w-full object-cover" />
              </div>
              {ad.title ? <p className="truncate px-2.5 py-1.5 text-[11px] font-medium text-zinc-200">{ad.title}</p> : null}
            </div>
          );
          if (ad.linkUrl?.trim()) {
            return (
              <a
                key={ad._id}
                href={ad.linkUrl.trim()}
                target="_blank"
                rel="noopener noreferrer"
                className="block shrink-0 transition hover:opacity-95"
              >
                {card}
              </a>
            );
          }
          return (
            <div key={ad._id} className="shrink-0">
              {card}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Pastdoim: doim placeholder lentasi; reklamalar kirishda modal va har N daqiqada pastki lenta.
 */
export function HomeAdsDock({ ads }: { ads: AdItem[] }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [entryOpen, setEntryOpen] = useState(false);
  const [periodicOpen, setPeriodicOpen] = useState(false);

  const publishHeight = useCallback(() => {
    const el = rootRef.current;
    const root = document.documentElement;
    if (!el) {
      root.style.removeProperty(AD_VAR);
      return;
    }
    root.style.setProperty(AD_VAR, `${el.offsetHeight}px`);
  }, []);

  useLayoutEffect(() => {
    publishHeight();
    const el = rootRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => publishHeight());
    ro.observe(el);
    window.addEventListener("resize", publishHeight);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", publishHeight);
      document.documentElement.style.removeProperty(AD_VAR);
    };
  }, [publishHeight]);

  useEffect(() => {
    publishHeight();
  }, [periodicOpen, publishHeight]);

  useEffect(() => {
    if (!ads.length) return;
    try {
      if (!sessionStorage.getItem(ENTRY_SESSION_KEY)) setEntryOpen(true);
    } catch {
      setEntryOpen(true);
    }
  }, [ads.length]);

  useEffect(() => {
    if (!ads.length) return;
    const t = setInterval(() => setPeriodicOpen(true), PERIODIC_INTERVAL_MS);
    return () => clearInterval(t);
  }, [ads.length]);

  const dismissEntry = useCallback(() => {
    setEntryOpen(false);
    try {
      sessionStorage.setItem(ENTRY_SESSION_KEY, "1");
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <>
      {entryOpen && ads.length > 0 ? <EntryAdModal ads={ads} onClose={dismissEntry} /> : null}

      <div
        ref={rootRef}
        className="fixed bottom-0 left-0 right-0 z-40 flex max-w-[100vw] flex-col overflow-x-hidden"
      >
        {periodicOpen && ads.length > 0 ? (
          <PeriodicAdsStrip ads={ads} onClose={() => setPeriodicOpen(false)} />
        ) : null}

        <div className="border-t border-violet-500/35 bg-[#06040a]/[0.97] pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-[0_-16px_48px_-10px_rgba(0,0,0,0.85)] backdrop-blur-xl">
          <HomeAdPlaceholders placement="footer" docked />
        </div>
      </div>
    </>
  );
}
