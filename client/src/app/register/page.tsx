"use client";

import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function safeNextPath(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/";
  return raw;
}

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = (fd.get("name") as string).trim();
    const email = (fd.get("email") as string).trim();
    const password = fd.get("password") as string;
    setLoading(true);
    setErr(null);
    try {
      const res = await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.errors?.[0]?.msg || "Ro‘yxatdan o‘tish muvaffaqiyatsiz");
      }
      setAuth(data.token, {
        _id: data.user._id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
      });
      router.replace(safeNextPath(searchParams.get("next")));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Xato");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto mt-10 max-w-sm space-y-4 rounded-2xl border border-white/[0.08] bg-[#0c0a12] p-8 shadow-2xl"
    >
      <h1 className="text-center text-xl font-semibold text-white">Ro‘yxatdan o‘tish</h1>
      {err && (
        <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
          {err}
        </p>
      )}
      <label className="block text-sm">
        <span className="text-zinc-500">Ism</span>
        <input
          name="name"
          required
          autoComplete="name"
          className="mt-1 w-full rounded-lg border border-white/10 bg-[#07060b] px-3 py-2 text-white outline-none focus:ring-2 focus:ring-violet-500/40"
        />
      </label>
      <label className="block text-sm">
        <span className="text-zinc-500">Email</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="mt-1 w-full rounded-lg border border-white/10 bg-[#07060b] px-3 py-2 text-white outline-none focus:ring-2 focus:ring-violet-500/40"
        />
      </label>
      <label className="block text-sm">
        <span className="text-zinc-500">Parol (kamida 6 belgi)</span>
        <input
          name="password"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          className="mt-1 w-full rounded-lg border border-white/10 bg-[#07060b] px-3 py-2 text-white outline-none focus:ring-2 focus:ring-violet-500/40"
        />
      </label>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-gradient-to-r from-rose-500 to-violet-600 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
      >
        {loading ? "…" : "Ro‘yxatdan o‘tish"}
      </button>
      <p className="text-center text-xs text-zinc-500">
        Akkauntingiz bormi?{" "}
        <Link href={searchParams.get("next") ? `/login?next=${encodeURIComponent(safeNextPath(searchParams.get("next")))}` : "/login"} className="text-violet-400 hover:underline">
          Kirish
        </Link>
      </p>
    </form>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-background py-16 pl-4 pr-[calc(1rem+var(--ad-slot-right))] text-violet-100 sm:pl-6 sm:pr-[calc(1.5rem+var(--ad-slot-right))] md:pl-8 md:pr-[calc(2rem+var(--ad-slot-right))]">
      <Suspense fallback={<div className="mx-auto mt-10 max-w-sm text-center text-zinc-500">Yuklanmoqda…</div>}>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
