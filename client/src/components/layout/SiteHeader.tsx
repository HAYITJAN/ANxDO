"use client";

import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { useLocale } from "@/components/i18n/LocaleContext";
import { pageShell } from "@/lib/pageShell";
import { useAuthStore } from "@/store/authStore";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { BrandIcon, BrandWordmark } from "@/components/brand/BrandWordmark";
import { NotificationBell } from "@/components/layout/NotificationBell";

function NavLink({
  href,
  children,
  active,
}: {
  href: string;
  children: React.ReactNode;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`relative whitespace-nowrap pb-1 text-sm font-medium transition md:text-[15px] ${
        active ? "text-white" : "text-zinc-400 hover:text-zinc-200"
      }`}
    >
      {children}
      {active ? (
        <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-gradient-to-r from-fuchsia-500 to-pink-500" />
      ) : null}
    </Link>
  );
}

export function SiteHeader() {
  const { t } = useLocale();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { token, user, logout } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function close(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const type = searchParams.get("type");
  const sort = searchParams.get("sort");

  const isHome = pathname === "/";
  const isMovies = pathname === "/browse" && type === "movie";
  const isAnime = pathname === "/browse" && type === "anime";
  const isDoramas = pathname === "/browse" && type === "dorama";
  const isTrending = pathname === "/browse" && sort === "trending";
  const isMyList = pathname === "/profile";

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-background/85 backdrop-blur-md">
      <div className={`flex h-14 items-center gap-3 sm:h-16 md:gap-4 ${pageShell}`}>
        <Link href="/" className="flex shrink-0 items-center gap-2" aria-label="ANDO — bosh sahifa">
          <BrandIcon />
          <span className="hidden sm:inline">
            <BrandWordmark />
          </span>
        </Link>

        <nav className="flex min-w-0 flex-1 items-center justify-start gap-x-5 overflow-x-auto py-1 pl-2 [-ms-overflow-style:none] [scrollbar-width:none] md:gap-x-7 md:pl-6 lg:gap-x-9 xl:pl-10 [&::-webkit-scrollbar]:hidden">
          <NavLink href="/" active={isHome}>
            {t("nav.home")}
          </NavLink>
          <NavLink href="/browse?type=movie" active={isMovies}>
            {t("nav.movies")}
          </NavLink>
          <NavLink href="/browse?type=anime" active={isAnime}>
            {t("nav.anime")}
          </NavLink>
          <NavLink href="/browse?type=dorama" active={isDoramas}>
            {t("nav.doramas")}
          </NavLink>
          <NavLink href="/browse?sort=trending" active={isTrending}>
            {t("nav.trending")}
          </NavLink>
          <NavLink href="/profile" active={isMyList}>
            {t("nav.myList")}
          </NavLink>
        </nav>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <LanguageSwitcher />
          <Link
            href="/browse"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.07] bg-transparent text-zinc-200 transition hover:border-white/15 hover:bg-white/[0.06] hover:text-white"
            aria-label={t("header.search")}
          >
            <svg className="h-[22px] w-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </Link>
          <NotificationBell />

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              className="flex h-10 items-center gap-1 rounded-xl border border-white/[0.07] bg-zinc-900/40 pl-1 pr-1.5 text-zinc-200 transition hover:border-white/12 hover:bg-zinc-900/70"
              aria-expanded={menuOpen}
              aria-haspopup="true"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-700 via-fuchsia-800 to-purple-950 text-sm font-semibold text-white shadow-inner shadow-black/30 ring-1 ring-white/15">
                {token && user ? (
                  (user.name || user.email || "?").slice(0, 1).toUpperCase()
                ) : (
                  <svg className="h-[18px] w-[18px] text-white/95" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                )}
              </span>
              <svg className="h-3.5 w-3.5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {menuOpen ? (
              <div className="absolute right-0 top-full z-50 mt-2 min-w-[180px] rounded-xl border border-white/10 bg-[#12101a] py-1 shadow-xl shadow-black/50">
                {token && user ? (
                  <>
                    <Link
                      href="/profile"
                      className="block px-4 py-2.5 text-sm text-zinc-200 hover:bg-white/5"
                      onClick={() => setMenuOpen(false)}
                    >
                      {t("auth.profile")}
                    </Link>
                    <button
                      type="button"
                      className="w-full px-4 py-2.5 text-left text-sm text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                      onClick={() => {
                        logout();
                        setMenuOpen(false);
                      }}
                    >
                      {t("auth.logout")}
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="block px-4 py-2.5 text-sm text-zinc-200 hover:bg-white/5"
                      onClick={() => setMenuOpen(false)}
                    >
                      {t("auth.login")}
                    </Link>
                    <Link
                      href="/register"
                      className="block px-4 py-2.5 text-sm text-zinc-200 hover:bg-white/5"
                      onClick={() => setMenuOpen(false)}
                    >
                      {t("auth.register")}
                    </Link>
                  </>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
