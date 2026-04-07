"use client";

import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { useEffect, useState } from "react";

type Stats = {
  totalMovies: number;
  totalUsers: number;
  totalEpisodes: number;
  totalViews: number;
  recentUploads: { _id: string; title: string; createdAt: string; type: string }[];
};

export default function AdminDashboardPage() {
  const token = useAuthStore((s) => s.token);
  const [data, setData] = useState<Stats | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!token) return;
      setLoading(true);
      setErr(null);
      try {
        const res = await apiFetch("/stats", { token });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j.message || "Statistika yuklanmadi");
        }
        const json = await res.json();
        if (!cancelled) setData(json);
      } catch (e) {
        if (!cancelled) setErr(e instanceof Error ? e.message : "Xato");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [token]);

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center text-zinc-500">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
      </div>
    );
  }

  if (err || !data) {
    return (
      <p className="rounded-xl border border-rose-500/20 bg-rose-500/5 px-4 py-3 text-sm text-rose-200">
        {err || "Ma’lumot yo‘q"}
      </p>
    );
  }

  const cards = [
    { label: "Jami kinolar", value: data.totalMovies, accent: "bg-violet-600/12" },
    { label: "Foydalanuvchilar", value: data.totalUsers, accent: "bg-emerald-600/12" },
    { label: "Epizodlar", value: data.totalEpisodes, accent: "bg-amber-600/12" },
    { label: "Ko‘rishlar (jami)", value: data.totalViews.toLocaleString(), accent: "bg-rose-600/12" },
  ];

  return (
    <div className="space-y-10">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className={`relative overflow-hidden rounded-2xl border border-white/[0.06] ${c.accent} p-5 shadow-lg shadow-black/20`}
          >
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">{c.label}</p>
            <p className="font-[family-name:var(--font-syne)] mt-2 text-3xl font-bold text-white">{c.value}</p>
          </div>
        ))}
      </div>

      <section>
        <h2 className="font-[family-name:var(--font-syne)] mb-4 text-lg font-semibold text-white">
          So‘nggi qo‘shilganlar
        </h2>
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
              {data.recentUploads.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-zinc-500">
                    Hali kino yo‘q
                  </td>
                </tr>
              ) : (
                data.recentUploads.map((r) => (
                  <tr key={r._id} className="border-b border-white/[0.04] last:border-0">
                    <td className="px-4 py-3 font-medium text-zinc-200">{r.title}</td>
                    <td className="px-4 py-3 text-zinc-400">{r.type}</td>
                    <td className="px-4 py-3 text-zinc-500">
                      {new Date(r.createdAt).toLocaleString("uz-UZ")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
