"use client";

import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function safeNextPath(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/";
  try {
    const u = new URL(raw, "http://local");
    if (u.protocol !== "http:" || u.host !== "local") return "/";
    return u.pathname + u.search + u.hash;
  } catch {
    return "/";
  }
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = (fd.get("email") as string).trim();
    const password = fd.get("password") as string;
    setLoading(true);
    setErr(null);
    try {
      const res = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Kirish muvaffaqiyatsiz");
      }
      setAuth(data.token, {
        _id: data.user._id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
      });
      const next = safeNextPath(searchParams.get("next"));
      router.replace(next);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Xato");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto mt-10 max-w-sm space-y-4 rounded-2xl border border-white/[0.08] bg-[#0c0a12] p-8 shadow-2xl">
      <h1 className="text-center text-xl font-semibold text-white">Kirish</h1>
      {err && (
        <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">{err}</p>
      )}
      <label className="block text-sm">
        <span className="text-zinc-500">Login (admin yoki email)</span>
        <input
          name="email"
          type="text"
          required
          autoComplete="username"
          placeholder="admin yoki admin@streamflix.com"
          className="mt-1 w-full rounded-lg border border-white/10 bg-[#07060b] px-3 py-2 text-white outline-none focus:ring-2 focus:ring-violet-500/40"
        />
      </label>
      <label className="block text-sm">
        <span className="text-zinc-500">Parol</span>
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="mt-1 w-full rounded-lg border border-white/10 bg-[#07060b] px-3 py-2 text-white outline-none focus:ring-2 focus:ring-violet-500/40"
        />
      </label>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-accent py-2.5 text-sm font-semibold text-white shadow-md shadow-violet-950/30 transition hover:bg-accent-hover disabled:opacity-50"
      >
        {loading ? "…" : "Kirish"}
      </button>
      <p className="text-center text-xs text-zinc-500">
        Akkaunt yo‘qmi?{" "}
        <Link href="/register" className="text-violet-400 hover:underline">
          Ro‘yxatdan o‘tish
        </Link>
        {" · "}
        <Link href="/" className="text-zinc-500 hover:text-zinc-300">
          Bosh sahifa
        </Link>
      </p>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background py-16 pl-4 pr-[calc(1rem+var(--ad-slot-right))] text-violet-100 sm:pl-6 sm:pr-[calc(1.5rem+var(--ad-slot-right))] md:pl-8 md:pr-[calc(2rem+var(--ad-slot-right))]">
      <Suspense
        fallback={
          <div className="mx-auto mt-10 flex max-w-sm justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
