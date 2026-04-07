"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BrandIcon, BrandWordmark } from "@/components/brand/BrandWordmark";
import { useAuthStore } from "@/store/authStore";

const nav = [
  { href: "/admin/dashboard", label: "Statistika", icon: IconChart },
  { href: "/admin/movies", label: "Kinolar", icon: IconFilm },
  { href: "/admin/genres", label: "Janrlar", icon: IconTag },
  { href: "/admin/ads", label: "Reklama", icon: IconMegaphone },
  { href: "/admin/movies/new", label: "Yangi kino", icon: IconPlus },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  return (
    <div className="admin-theme flex min-h-screen bg-background text-violet-100">
      <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-white/[0.06] bg-[#0c0a12]/95 backdrop-blur-xl">
        <div className="border-b border-white/[0.06] px-5 py-6">
          <Link href="/admin/dashboard" className="group flex items-center gap-2" aria-label="ANDO admin">
            <BrandIcon className="!bg-accent-deep !shadow-violet-950/50 !ring-violet-400/25" />
            <div>
              <p className="text-sm text-white">
                <BrandWordmark size="sm" />
              </p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">Admin</p>
            </div>
          </Link>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {nav.map((item) => {
            let active = false;
            if (item.href === "/admin/dashboard") {
              active = pathname === "/admin/dashboard" || pathname === "/admin";
            } else if (item.href === "/admin/movies") {
              active =
                pathname === "/admin/movies" ||
                (pathname.startsWith("/admin/movies/") && !pathname.startsWith("/admin/movies/new"));
            } else if (item.href === "/admin/genres") {
              active = pathname === "/admin/genres" || pathname.startsWith("/admin/genres/");
            } else if (item.href === "/admin/ads") {
              active = pathname === "/admin/ads" || pathname.startsWith("/admin/ads/");
            } else if (item.href === "/admin/movies/new") {
              active = pathname === "/admin/movies/new";
            }
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  active
                    ? "bg-white/[0.07] text-white shadow-inner shadow-white/5"
                    : "text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-200"
                }`}
              >
                <item.icon className="h-5 w-5 shrink-0 opacity-80" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-white/[0.06] p-4">
          <p className="truncate text-xs text-zinc-500">{user?.email}</p>
          <div className="mt-3 flex gap-2">
            <Link
              href="/"
              className="flex-1 rounded-lg border border-white/10 py-2 text-center text-xs text-zinc-400 hover:border-white/20 hover:text-white"
            >
              Sayt
            </Link>
            <button
              type="button"
              onClick={() => {
                logout();
                router.push("/");
              }}
              className="flex-1 rounded-lg bg-white/[0.05] py-2 text-xs text-rose-300/90 hover:bg-rose-500/10"
            >
              Chiqish
            </button>
          </div>
        </div>
      </aside>
      <div className="flex min-h-screen flex-1 flex-col pl-64">
        <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-[#07060b]/80 px-8 py-5 backdrop-blur-md">
          <h1 className="font-[family-name:var(--font-syne)] text-xl font-semibold tracking-tight text-white">
            Boshqaruv paneli
          </h1>
          <p className="mt-1 text-sm text-zinc-500">Kontent va statistikalar</p>
        </header>
        <div className="flex-1 px-8 py-8">{children}</div>
      </div>
    </div>
  );
}

function IconChart({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 19V5" strokeLinecap="round" />
      <path d="M4 19h16" strokeLinecap="round" />
      <path d="M8 17V9" strokeLinecap="round" />
      <path d="M12 17v-5" strokeLinecap="round" />
      <path d="M16 17V6" strokeLinecap="round" />
    </svg>
  );
}

function IconFilm({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M2 8h20M2 16h20M6 4v16M10 4v16M14 4v16M18 4v16" strokeLinecap="round" />
    </svg>
  );
}

function IconPlus({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
    </svg>
  );
}

function IconTag({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 6a3 3 0 0 1 3-3h4.5L21 12.5 12.5 21 3 11.5V6z" strokeLinejoin="round" />
      <circle cx="7.5" cy="6.5" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconMegaphone({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 11v4a2 2 0 0 0 2 2h2v-8H6a2 2 0 0 0-2 2z" strokeLinejoin="round" />
      <path d="M10 9v6l5 2V7l-5 2z" strokeLinejoin="round" />
      <path d="M18 8v8" strokeLinecap="round" />
    </svg>
  );
}
