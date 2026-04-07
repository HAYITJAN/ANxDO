import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { BrandWordmark } from "../components/BrandWordmark";
import { apiFetch, setToken } from "../lib/api";

export default function Login() {
  const navigate = useNavigate();
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
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
      if (!res.ok) throw new Error(data.message || "Kirish muvaffaqiyatsiz");
      if (data.user?.role !== "admin") {
        setErr("Faqat administrator kira oladi");
        return;
      }
      setToken(data.token);
      navigate("/dashboard", { replace: true });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Xato");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#07060b] px-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm space-y-4 rounded-2xl border border-white/[0.08] bg-[#0c0a12] p-8 shadow-2xl"
      >
        <div className="flex flex-col items-center gap-1">
          <BrandWordmark className="font-display justify-center text-lg" />
          <h1 className="font-display text-center text-xl font-semibold text-white">Admin kirish</h1>
        </div>
        <p className="text-center text-xs text-zinc-500">ANDO boshqaruv paneli (alohida ilova)</p>
        {err && (
          <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">{err}</p>
        )}
        <label className="block text-sm">
          <span className="text-zinc-500">Login yoki email</span>
          <input
            name="email"
            required
            autoComplete="username"
            className="mt-1 w-full rounded-lg border border-white/10 bg-[#07060b] px-3 py-2.5 text-white outline-none focus:ring-2 focus:ring-violet-500/40"
          />
        </label>
        <label className="block text-sm">
          <span className="text-zinc-500">Parol</span>
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="mt-1 w-full rounded-lg border border-white/10 bg-[#07060b] px-3 py-2.5 text-white outline-none focus:ring-2 focus:ring-violet-500/40"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-gradient-to-r from-rose-500 to-violet-600 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {loading ? "…" : "Kirish"}
        </button>
      </form>
    </div>
  );
}
