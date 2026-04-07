"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

function mapAdminPath(pathname: string): string {
  if (pathname === "/admin" || pathname === "/admin/") return "/dashboard";
  const rest = pathname.replace(/^\/admin/, "") || "/dashboard";
  return rest.startsWith("/") ? rest : `/${rest}`;
}

export function ExternalAdminRedirect({ base }: { base: string }) {
  const pathname = usePathname();
  const origin = base.replace(/\/$/, "");

  useEffect(() => {
    const target = `${origin}${mapAdminPath(pathname)}`;
    window.location.replace(target);
  }, [origin, pathname]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[#07060b] px-6 text-center text-zinc-400">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
      <p className="text-sm">Alohida admin panelga yo‘naltirilmoqda…</p>
      <p className="max-w-sm text-xs text-zinc-600">
        Agar ochilmasa, brauzerda to‘g‘ridan-to‘g‘ri:{" "}
        <span className="text-zinc-500">{origin}</span>
      </p>
    </div>
  );
}
