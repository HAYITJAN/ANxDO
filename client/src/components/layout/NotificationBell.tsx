"use client";

import { useLocale } from "@/components/i18n/LocaleContext";
import { getLastNotificationsViewedAt, hasUnreadNewReleases, markNotificationsViewed } from "@/lib/notifications";
import type { MovieListItem } from "@/lib/movies";
import { publicApiBase as apiBase } from "@/lib/publicApiBase";
import { useAuthStore } from "@/store/authStore";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

export function NotificationBell() {
  const { t } = useLocale();
  const token = useAuthStore((s) => s.token);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<MovieListItem[]>([]);
  const [unread, setUnread] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const refresh = useCallback(async () => {
    if (!token) {
      setItems([]);
      setUnread(false);
      return;
    }
    try {
      const res = await fetch(`${apiBase}/movies/new-releases?limit=12`, { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as MovieListItem[];
      if (!Array.isArray(data)) return;
      setItems(data);
      const last = getLastNotificationsViewedAt();
      setUnread(hasUnreadNewReleases(data, last));
    } catch {
      /* ignore */
    }
  }, [token]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  function onOpen() {
    setOpen((o) => {
      const next = !o;
      if (next && token) {
        markNotificationsViewed();
        setUnread(false);
      }
      return next;
    });
  }

  if (!token) {
    return (
      <span
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.07] bg-zinc-900/50 text-zinc-500"
        aria-hidden
        title={t("header.notifications")}
      >
        <svg className="h-[22px] w-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
      </span>
    );
  }

  return (
    <div className="relative" ref={wrapRef}>
      <button
        type="button"
        onClick={onOpen}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-zinc-800/80 text-zinc-100 transition hover:border-white/15 hover:bg-zinc-800"
        aria-expanded={open}
        aria-label={t("header.notifications")}
      >
        <svg className="h-[22px] w-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unread ? (
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-zinc-900" />
        ) : null}
      </button>
      {open ? (
        <div className="absolute right-0 top-full z-50 mt-2 w-[min(100vw-1.5rem,20rem)] rounded-xl border border-white/10 bg-[#16141f] py-2 shadow-2xl shadow-black/60">
          <p className="border-b border-white/[0.06] px-3 pb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
            {t("header.notificationsNew")}
          </p>
          {items.length === 0 ? (
            <p className="px-3 py-4 text-sm text-zinc-500">{t("header.notificationsEmpty")}</p>
          ) : (
            <ul className="max-h-72 overflow-y-auto py-1">
              {items.map((m) => (
                <li key={m._id}>
                  <Link
                    href={`/title/${m._id}`}
                    className="block px-3 py-2.5 text-sm text-violet-100 hover:bg-white/[0.06]"
                    onClick={() => setOpen(false)}
                  >
                    <span className="line-clamp-2 font-medium">{m.title}</span>
                    {m.newRelease ? (
                      <span className="mt-0.5 block text-[10px] uppercase tracking-wide text-fuchsia-400/90">NEW</span>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
