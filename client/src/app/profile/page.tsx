"use client";

import { MoviePosterCard } from "@/components/ui/MoviePosterCard";
import { useLocale } from "@/components/i18n/LocaleContext";
import { fetchMoviesClient, type MovieListItem } from "@/lib/movies";
import { getWatchlistIds } from "@/lib/watchlist";
import { useAuthStore } from "@/store/authStore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function ProfilePage() {
  const { t } = useLocale();
  const router = useRouter();
  const { user, logout, token } = useAuthStore();
  const [movies, setMovies] = useState<MovieListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [ids, setIds] = useState<string[]>([]);

  function refreshIds() {
    setIds(getWatchlistIds());
  }

  useEffect(() => {
    refreshIds();
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const all = await fetchMoviesClient();
        if (!cancelled) setMovies(Array.isArray(all) ? all : []);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    function onVis() {
      if (document.visibilityState === "visible") refreshIds();
    }
    window.addEventListener("focus", refreshIds);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.removeEventListener("focus", refreshIds);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  const list = useMemo(() => {
    const set = new Set(ids);
    return movies.filter((m) => set.has(m._id));
  }, [movies, ids]);

  return (
    <main className="mx-auto max-w-6xl py-10 pl-4 pr-[calc(1rem+var(--ad-slot-right))] sm:pl-6 sm:pr-[calc(1.5rem+var(--ad-slot-right))] md:pl-8 md:pr-[calc(2rem+var(--ad-slot-right))]">
      <h1 className="text-xl font-semibold text-violet-100 sm:text-2xl">Profil</h1>
      {user && (
        <p className="mt-2 text-sm text-zinc-400">
          {user.name} · {user.email}
        </p>
      )}

      <section className="mt-10 border-t border-white/[0.08] pt-10">
        <h2 className="text-lg font-semibold text-violet-100">{t("profile.myListTitle")}</h2>

        {!token ? (
          <div className="mt-4 rounded-2xl border border-fuchsia-500/25 bg-fuchsia-950/20 px-5 py-6 text-sm text-violet-100/90">
            <p>{t("profile.myListLogin")}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/register?next=%2Fprofile"
                className="inline-flex rounded-xl bg-gradient-to-r from-fuchsia-600 to-violet-700 px-5 py-2.5 text-sm font-semibold text-white shadow-lg"
              >
                {t("profile.myListLoginCta")}
              </Link>
              <Link href="/login?next=%2Fprofile" className="inline-flex rounded-xl border border-white/15 px-5 py-2.5 text-sm text-zinc-200 hover:bg-white/5">
                {t("auth.login")}
              </Link>
            </div>
          </div>
        ) : loading ? (
          <p className="mt-6 text-sm text-zinc-500">Yuklanmoqda…</p>
        ) : list.length === 0 ? (
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-zinc-500">{t("profile.myListEmpty")}</p>
        ) : (
          <div className="mt-6 flex flex-wrap gap-4">
            {list.map((m) => (
              <MoviePosterCard key={m._id} movie={m} size="row" />
            ))}
          </div>
        )}
      </section>

      {token ? (
        <div className="mt-10 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => {
              logout();
              router.push("/");
            }}
            className="rounded-lg border border-white/15 px-4 py-2 text-sm text-zinc-300 hover:bg-white/[0.05]"
          >
            {t("auth.logout")}
          </button>
          <Link href="/" className="rounded-lg px-4 py-2 text-sm text-violet-400 hover:underline">
            Bosh sahifa
          </Link>
        </div>
      ) : null}
    </main>
  );
}
