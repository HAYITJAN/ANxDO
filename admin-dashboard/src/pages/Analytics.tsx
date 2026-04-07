import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";

type Daily = {
  day: string;
  apiRequests: number;
  pageViews: number;
  adImpressions: number;
  adClicks: number;
};

type Stats = {
  dailyStats: Daily[];
  topMovies: { title: string; views: number; type: string }[];
  adTotals: { impressions: number; clicks: number; ctr: number };
  trafficTotals: { apiRequests: number; pageViews: number };
};

export default function Analytics() {
  const [data, setData] = useState<Stats | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let c = false;
    (async () => {
      try {
        const res = await apiFetch("/stats");
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j.message || "Xato");
        }
        const json = await res.json();
        if (!c) setData(json);
      } catch (e) {
        if (!c) setErr(e instanceof Error ? e.message : "Xato");
      }
    })();
    return () => {
      c = true;
    };
  }, []);

  if (err) {
    return <p className="rounded-xl border border-rose-500/20 px-4 py-3 text-sm text-rose-200">{err}</p>;
  }
  if (!data) {
    return (
      <div className="flex h-48 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
      </div>
    );
  }

  const daily = data.dailyStats || [];
  const maxPv = Math.max(1, ...daily.map((d) => d.pageViews || 0));

  return (
    <div className="space-y-10">
      <section>
        <h2 className="font-display mb-4 text-lg font-semibold text-white">Trafik va reklama (jami)</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-white/[0.06] bg-[#0c0a12]/80 p-5">
            <p className="text-xs uppercase tracking-wide text-zinc-500">API so‘rovlar</p>
            <p className="font-display mt-2 text-2xl font-bold text-cyan-300">
              {(data.trafficTotals?.apiRequests ?? 0).toLocaleString()}
            </p>
          </div>
          <div className="rounded-2xl border border-white/[0.06] bg-[#0c0a12]/80 p-5">
            <p className="text-xs uppercase tracking-wide text-zinc-500">Sahifa ko‘rishlari</p>
            <p className="font-display mt-2 text-2xl font-bold text-fuchsia-300">
              {(data.trafficTotals?.pageViews ?? 0).toLocaleString()}
            </p>
          </div>
          <div className="rounded-2xl border border-white/[0.06] bg-[#0c0a12]/80 p-5">
            <p className="text-xs uppercase tracking-wide text-zinc-500">Reklama ko‘rinishi</p>
            <p className="font-display mt-2 text-2xl font-bold text-orange-300">
              {(data.adTotals?.impressions ?? 0).toLocaleString()}
            </p>
          </div>
          <div className="rounded-2xl border border-white/[0.06] bg-[#0c0a12]/80 p-5">
            <p className="text-xs uppercase tracking-wide text-zinc-500">Reklama bosishi / CTR</p>
            <p className="font-display mt-2 text-2xl font-bold text-pink-300">
              {(data.adTotals?.clicks ?? 0).toLocaleString()}{" "}
              <span className="text-base text-zinc-500">/ {data.adTotals?.ctr ?? 0}%</span>
            </p>
          </div>
        </div>
        <p className="mt-3 text-xs text-zinc-500">
          Reklama slotlarida: <code className="text-zinc-400">POST /api/analytics/ad</code> bilan{" "}
          <code className="text-zinc-400">impression</code> va <code className="text-zinc-400">click</code> yuboring.
        </p>
      </section>

      <section>
        <h2 className="font-display mb-4 text-lg font-semibold text-white">So‘nggi 30 kun (kunlik)</h2>
        <div className="overflow-x-auto rounded-2xl border border-white/[0.06] bg-[#0c0a12]/50 p-4">
          <div className="flex min-w-[640px] gap-1">
            {daily.map((d) => (
              <div key={d.day} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full max-w-[20px] rounded-t bg-gradient-to-t from-violet-600/80 to-fuchsia-500/40"
                  style={{ height: `${Math.max(8, (d.pageViews / maxPv) * 120)}px` }}
                  title={`${d.day}: sahifa ${d.pageViews}`}
                />
                <span className="max-w-[52px] truncate text-[9px] text-zinc-600">{d.day.slice(5)}</span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-zinc-500">Ustun balandligi: kunlik sahifa ko‘rishlari (moslashuvchan)</p>
        </div>
      </section>

      <section>
        <h2 className="font-display mb-4 text-lg font-semibold text-white">Eng ko‘p ko‘rilgan kontent</h2>
        <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0c0a12]/50">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] text-xs uppercase text-zinc-500">
                <th className="px-4 py-3">Sarlavha</th>
                <th className="px-4 py-3">Tur</th>
                <th className="px-4 py-3">Ko‘rishlar</th>
              </tr>
            </thead>
            <tbody>
              {(data.topMovies || []).map((m, i) => (
                <tr key={i} className="border-b border-white/[0.04] last:border-0">
                  <td className="px-4 py-3 text-zinc-200">{m.title}</td>
                  <td className="px-4 py-3 text-zinc-500">{m.type}</td>
                  <td className="px-4 py-3 text-amber-200/90">{m.views?.toLocaleString() ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
