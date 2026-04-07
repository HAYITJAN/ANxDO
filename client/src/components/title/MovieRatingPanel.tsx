"use client";

import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type Props = {
  movieId: string;
  initialRating: number;
  initialCount: number;
};

export function MovieRatingPanel({ movieId, initialRating, initialCount }: Props) {
  const token = useAuthStore((s) => s.token);
  const [rating, setRating] = useState(initialRating);
  const [count, setCount] = useState(initialCount);
  const [mine, setMine] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [hover, setHover] = useState<number | null>(null);

  const loadMine = useCallback(async () => {
    if (!token) {
      setMine(null);
      return;
    }
    try {
      const res = await apiFetch(`/movies/${movieId}/reviews/me`, { token });
      if (res.ok) {
        const data = await res.json();
        setMine(data?.rating ?? null);
      }
    } catch {
      setMine(null);
    }
  }, [movieId, token]);

  useEffect(() => {
    void loadMine();
  }, [loadMine]);

  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(null), 3500);
    return () => clearTimeout(t);
  }, [msg]);

  async function submit(next: number) {
    if (!token || mine != null) return;
    setSaving(true);
    setMsg(null);
    setErr(null);
    try {
      const res = await apiFetch(`/movies/${movieId}/reviews`, {
        method: "POST",
        token,
        body: JSON.stringify({ rating: next }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Saqlanmadi");
      if (data.movie) {
        setRating(Number(data.movie.rating) || 0);
        setCount(Number(data.movie.ratingCount) || 0);
      }
      setMine(next);
      setMsg("Saqlandi");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Xato");
    } finally {
      setSaving(false);
    }
  }

  const showAvg = count > 0 && rating > 0;
  const locked = mine != null;
  /** Hoverda oldindan ko‘rish (faqat hali baholamagan) */
  const highlight = locked ? mine! : hover ?? mine ?? 0;

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-gradient-to-br from-zinc-900/80 to-black/40 p-4 shadow-inner shadow-black/20 ring-1 ring-white/[0.04] backdrop-blur-sm sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="min-w-0 space-y-1">
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-500">Reyting</p>
          {showAvg ? (
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="font-display text-3xl font-bold tabular-nums text-white">{rating.toFixed(1)}</span>
              <span className="text-amber-400/90" aria-hidden>
                ★
              </span>
              <span className="text-sm text-zinc-500">/ 10 · {count} baho</span>
            </div>
          ) : (
            <p className="text-sm text-zinc-500">Hali baho yo‘q</p>
          )}
        </div>

        {token ? (
          <div className="w-full max-w-md flex-1 space-y-3 border-t border-white/[0.06] pt-4 sm:border-t-0 sm:pt-0 md:max-w-lg">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-zinc-300">
                {locked ? "Sizning bahongiz" : "Bahoyingiz"}
              </span>
              <span className="text-xs tabular-nums text-zinc-500">
                {highlight > 0 ? (
                  <>
                    <span className="text-amber-400/90">{highlight}</span>
                    <span className="text-zinc-600">/10</span>
                  </>
                ) : (
                  "tanlang"
                )}
              </span>
            </div>

            {locked ? (
              <p className="text-xs text-zinc-500">Bahoni bir marta qo‘yish mumkin; keyin o‘zgartirilmaydi.</p>
            ) : null}

            <div
              className="flex items-center justify-center gap-0.5 sm:justify-start sm:gap-1"
              onMouseLeave={() => !locked && setHover(null)}
              role="group"
              aria-label={locked ? "Sizning bahongiz" : "Baho, 1 dan 10 gacha"}
            >
              {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
                const filled = n <= highlight;
                const star = (
                  <span
                    className={[
                      "text-[22px] leading-none sm:text-[26px]",
                      filled
                        ? "text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.25)]"
                        : "text-zinc-700",
                      mine === n && !locked ? "ring-1 ring-amber-500/40 rounded-md" : "",
                    ].join(" ")}
                    aria-hidden
                  >
                    ★
                  </span>
                );
                if (locked) {
                  return (
                    <span
                      key={n}
                      className="relative flex h-9 w-7 cursor-default items-center justify-center sm:h-10 sm:w-8"
                    >
                      {star}
                    </span>
                  );
                }
                return (
                  <button
                    key={n}
                    type="button"
                    disabled={saving}
                    onMouseEnter={() => setHover(n)}
                    onFocus={() => setHover(n)}
                    onBlur={() => setHover(null)}
                    onClick={() => submit(n)}
                    className={[
                      "relative flex h-9 w-7 items-center justify-center rounded-md transition-all sm:h-10 sm:w-8",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50",
                      filled
                        ? "scale-100 text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.25)]"
                        : "text-zinc-700 hover:text-zinc-500",
                    ].join(" ")}
                    aria-label={`${n} yulduz`}
                  >
                    {star}
                  </button>
                );
              })}
            </div>

            <div className="flex min-h-[1.25rem] items-center gap-2 text-xs">
              {!locked && msg ? <span className="text-emerald-400/95">{msg}</span> : null}
              {err ? <span className="text-rose-300">{err}</span> : null}
              {!locked && saving ? <span className="text-zinc-500">Saqlanmoqda…</span> : null}
            </div>
          </div>
        ) : (
          <p className="text-sm text-zinc-500 sm:max-w-xs sm:text-right">
            Bahoni qo‘yish uchun{" "}
            <Link href={`/login?next=/title/${movieId}`} className="font-medium text-violet-400 hover:underline">
              kiring
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
