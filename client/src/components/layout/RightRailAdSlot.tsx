"use client";

import { AdMedia } from "@/components/home/AdMedia";
import { AD_INQUIRY_HREF, AD_PLACEMENT_SIDEBAR, fetchAdsClient, type AdItem } from "@/lib/ads";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * O‘ng tomonda `--ad-slot-right` kenglikda joy — faqat lg+.
 * Admin: `/admin/ads` → Joylashuv: `sidebar`, faol reklama.
 */
export function RightRailAdSlot() {
  const pathname = usePathname();
  const [ads, setAds] = useState<AdItem[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchAdsClient(AD_PLACEMENT_SIDEBAR);
        if (!cancelled) setAds(data);
      } catch {
        if (!cancelled) setAds([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (pathname?.startsWith("/admin")) return null;

  return (
    <aside
      className="pointer-events-auto fixed right-0 top-14 z-[35] hidden h-[calc(100dvh-3.5rem)] w-[var(--ad-slot-right)] min-w-0 flex-col border-l border-white/[0.08] bg-[#0a0a0e]/96 shadow-[inset_1px_0_0_rgba(255,255,255,0.04)] backdrop-blur-sm sm:top-16 sm:h-[calc(100dvh-4rem)] lg:flex"
      aria-label="Reklama — o‘ng panel"
    >
      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto overflow-x-hidden p-1.5 [scrollbar-width:thin] [scrollbar-color:rgba(139,92,246,0.35)_transparent]">
        {ads === null ? (
          <div className="flex flex-1 items-center justify-center px-1 py-6">
            <span className="text-[10px] uppercase tracking-wider text-zinc-600">…</span>
          </div>
        ) : ads.length === 0 ? (
          <Link
            href={AD_INQUIRY_HREF}
            className="flex flex-1 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-white/10 bg-white/[0.02] p-2 text-center transition hover:border-violet-500/25 hover:bg-white/[0.04]"
          >
            <span className="text-[9px] font-medium uppercase tracking-widest text-zinc-500">Reklama</span>
            <span className="text-[9px] leading-tight text-zinc-600">150×vertikal joy</span>
          </Link>
        ) : (
          ads.map((ad) => {
            const inner = (
              <div className="w-full overflow-hidden rounded-lg border border-white/[0.08] bg-zinc-950/80 ring-1 ring-white/[0.04]">
                <div className="relative aspect-[2/5] w-full max-h-[min(52vh,420px)] min-h-[120px]">
                  <AdMedia
                    ad={ad}
                    className="!rounded-none"
                    imgClassName="h-full w-full object-cover object-center"
                  />
                </div>
                {ad.title ? (
                  <p className="line-clamp-2 px-1.5 py-1 text-[9px] font-medium leading-snug text-zinc-300">
                    {ad.title}
                  </p>
                ) : null}
              </div>
            );
            if (ad.linkUrl?.trim()) {
              return (
                <a
                  key={ad._id}
                  href={ad.linkUrl.trim()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50"
                >
                  {inner}
                </a>
              );
            }
            return (
              <div key={ad._id} className="shrink-0">
                {inner}
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}
