import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";

type Stats = {
  totalMovies: number;
  totalUsers: number;
  totalEpisodes: number;
  totalViews: number;
  trafficTotals?: { apiRequests: number; pageViews: number };
  adTotals?: { impressions: number; clicks: number; ctr: number };
  recentUploads: { _id: string; title: string; createdAt: string; type: string }[];
};

export default function Dashboard() {
  const [data, setData] = useState<Stats | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiFetch("/stats");
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j.message || "Yuklanmadi");
        }
        const json = await res.json();
        if (!cancelled) setData(json);
      } catch (e) {
        if (!cancelled) setErr(e instanceof Error ? e.message : "Xato");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (err) {
    return <p className="rounded-xl border border-rose-500/20 bg-rose-500/5 px-4 py-3 text-sm text-rose-200">{err}</p>;
  }
  if (!data) {
    return (
      <div className="flex h-48 items-center justify-center text-zinc-500">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
      </div>
    );
  }

  const cards = [
    { label: "Kinolar", value: data.totalMovies, accent: "from-violet-500/20 to-violet-600/5" },
    { label: "Foydalanuvchilar", value: data.totalUsers, accent: "from-emerald-500/20 to-emerald-600/5" },
    { label: "Epizodlar", value: data.totalEpisodes, accent: "from-amber-500/20 to-amber-600/5" },
    { label: "Kontent ko‘rishlari", value: data.totalViews.toLocaleString(), accent: "from-rose-500/20 to-rose-600/5" },
    {
      label: "API so‘rovlar (jami)",
      value: (data.trafficTotals?.apiRequests ?? 0).toLocaleString(),
      accent: "from-cyan-500/20 to-cyan-600/5",
    },
    {
      label: "Sahifa ko‘rishlari (jami)",
      value: (data.trafficTotals?.pageViews ?? 0).toLocaleString(),
      accent: "from-fuchsia-500/20 to-fuchsia-600/5",
    },
    {
      label: "Reklama: ko‘rinish",
      value: (data.adTotals?.impressions ?? 0).toLocaleString(),
      accent: "from-orange-500/20 to-orange-600/5",
    },
    {
      label: "Reklama: bosish / CTR",
      value: `${(data.adTotals?.clicks ?? 0).toLocaleString()} / ${data.adTotals?.ctr ?? 0}%`,
      accent: "from-pink-500/20 to-pink-600/5",
    },
  ];

  return (
    <div className="space-y-10">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className={`relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br ${c.accent} p-5 shadow-lg shadow-black/20`}
          >
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">{c.label}</p>
            <p className="font-display mt-2 text-2xl font-bold text-white">{c.value}</p>
          </div>
        ))}
      </div>

      <section>
        <h2 className="font-display mb-4 text-lg font-semibold text-white">So‘nggi qo‘shilganlar</h2>
        <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0c0a12]/50">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] text-xs uppercase tracking-wider text-zinc-500">
                <th className="px-4 py-3 font-medium">Sarlavha</th>
                <th className="px-4 py-3 font-medium">Tur</th>
                <th className="px-4 py-3 font-medium">Sana</th>
              </tr>
            </thead>
            <tbody>
              {data.recentUploads?.length ? (
                data.recentUploads.map((r) => (
                  <tr key={r._id} className="border-b border-white/[0.04] last:border-0">
                    <td className="px-4 py-3 font-medium text-zinc-200">{r.title}</td>
                    <td className="px-4 py-3 text-zinc-400">{r.type}</td>
                    <td className="px-4 py-3 text-zinc-500">{new Date(r.createdAt).toLocaleString("uz-UZ")}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-zinc-500">
                    Bo‘sh
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
