"use client";

import { useLocale } from "@/components/i18n/LocaleContext";
import { isInWatchlist, toggleWatchlist } from "@/lib/watchlist";
import { useAuthStore } from "@/store/authStore";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function TitleMyListButton({ movieId }: { movieId: string }) {
  const { t } = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const token = useAuthStore((s) => s.token);
  const [inList, setInList] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setInList(isInWatchlist(movieId));
  }, [movieId]);

  function onClick() {
    if (!token) {
      setToast(t("hero.myListNeedAuth"));
      const next = pathname || "/profile";
      router.push(`/register?next=${encodeURIComponent(next)}`);
      window.setTimeout(() => setToast(null), 2800);
      return;
    }
    const now = toggleWatchlist(movieId);
    setInList(now);
    setToast(now ? t("hero.myListAdded") : t("hero.myListRemoved"));
    window.setTimeout(() => setToast(null), 2200);
  }

  return (
    <div className="relative inline-flex flex-col items-stretch gap-1.5">
      {toast ? (
        <p
          className="absolute bottom-full left-0 right-0 z-10 mb-1 max-w-[min(100%,18rem)] rounded-lg border border-violet-500/35 bg-black/90 px-3 py-2 text-center text-xs text-violet-100 shadow-lg backdrop-blur-sm"
          role="status"
        >
          {toast}
        </p>
      ) : null}
      <button
        type="button"
        onClick={onClick}
        className={`inline-flex min-h-[46px] items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-medium transition ${
          inList
            ? "border-accent-hover/45 bg-accent-deep/30 text-violet-100 hover:bg-accent-deep/40"
            : "border-white/15 bg-white/5 text-white hover:bg-white/10"
        }`}
      >
        <span className="text-base leading-none" aria-hidden>
          {inList ? "✓" : "+"}
        </span>
        {t("hero.myList")}
      </button>
    </div>
  );
}
