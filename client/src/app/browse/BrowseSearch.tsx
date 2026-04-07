"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useEffect, FormEvent } from "react";

export function BrowseSearch({ initialQ }: { initialQ: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(initialQ);

  useEffect(() => {
    setQ(initialQ);
  }, [initialQ]);

  const submit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      const next = new URLSearchParams(searchParams.toString());
      if (q.trim()) next.set("q", q.trim());
      else next.delete("q");
      router.push(`/browse?${next.toString()}`);
    },
    [q, router, searchParams]
  );

  return (
    <form onSubmit={submit} className="flex gap-2">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Film yoki serial qidirish..."
        className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:border-fuchsia-500/50 focus:outline-none focus:ring-1 focus:ring-fuchsia-500/30"
      />
      <button
        type="submit"
        className="rounded-xl bg-gradient-to-r from-fuchsia-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:brightness-110"
      >
        Qidiruv
      </button>
    </form>
  );
}
