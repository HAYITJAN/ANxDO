"use client";

import { useAuthStore } from "@/store/authStore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

const LOGIN_WITH_NEXT = "/login?next=/admin/dashboard";
const ME_TIMEOUT_MS = 8000;

export function AdminAuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { token, user, setAuth, logout } = useAuthStore();
  const [storeHydrated, setStoreHydrated] = useState(false);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (useAuthStore.persist.hasHydrated()) {
      setStoreHydrated(true);
      return;
    }
    const unsub = useAuthStore.persist.onFinishHydration(() => setStoreHydrated(true));
    return unsub;
  }, []);

  /** Token yo‘q — API chaqirmasdan, paint oldidan yo‘naltirish (uzoq "Tekshirilmoqda" bo‘lmasin) */
  useLayoutEffect(() => {
    if (!storeHydrated) return;
    const t = useAuthStore.getState().token;
    if (!t) {
      setVerified(true);
      router.replace(LOGIN_WITH_NEXT);
    }
  }, [storeHydrated, router]);

  useEffect(() => {
    if (!storeHydrated) return;
    const raw = useAuthStore.getState().token;
    if (!raw) return;
    const authToken: string = raw;

    let cancelled = false;
    const ac = new AbortController();
    const tid = setTimeout(() => ac.abort(), ME_TIMEOUT_MS);

    async function run() {
      try {
        const res = await apiFetch("/auth/me", { token: authToken, signal: ac.signal });
        clearTimeout(tid);
        if (cancelled) return;
        if (!res.ok) {
          logout();
          router.replace(LOGIN_WITH_NEXT);
          setVerified(true);
          return;
        }
        const me = await res.json();
        if (cancelled) return;
        setAuth(authToken, {
          _id: me._id,
          name: me.name,
          email: me.email,
          role: me.role,
        });
        setVerified(true);
      } catch {
        clearTimeout(tid);
        if (cancelled) return;
        logout();
        router.replace(LOGIN_WITH_NEXT);
        setVerified(true);
      }
    }

    void run();
    return () => {
      cancelled = true;
      ac.abort();
      clearTimeout(tid);
    };
  }, [storeHydrated, router, setAuth, logout]);

  if (!storeHydrated || !verified) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#07060b] text-zinc-400">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
          <p className="text-sm">
            {storeHydrated && token ? "Sessiya tekshirilmoqda…" : "Yuklanmoqda…"}
          </p>
        </div>
      </div>
    );
  }

  if (!token || !user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[#07060b] px-6 text-center text-zinc-400">
        <p className="text-sm">Kirish sahifasiga yo‘naltilmoqda…</p>
        <Link href={LOGIN_WITH_NEXT} className="text-sm text-violet-400 hover:underline">
          Kirish sahifasiga o‘tish
        </Link>
      </div>
    );
  }

  if (user.role !== "admin") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#07060b] px-6 text-center text-zinc-200">
        <p className="text-lg font-medium">Admin huquqi yo‘q</p>
        <p className="max-w-sm text-sm text-zinc-500">
          Bu bo‘lim faqat administratorlar uchun. Oddiy akkaunt bilan kirgansiz.
        </p>
        <Link href="/" className="text-sm text-violet-400 hover:underline">
          Bosh sahifaga
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
