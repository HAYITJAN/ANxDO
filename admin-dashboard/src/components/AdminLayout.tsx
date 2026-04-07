import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { BrandIcon, BrandWordmark } from "./BrandWordmark";
import { setToken } from "../lib/api";

const nav = [
  { to: "/dashboard", label: "Statistika", end: false },
  { to: "/movies", label: "Kinolar" },
  { to: "/genres", label: "Janrlar" },
  { to: "/ads", label: "Reklama" },
  { to: "/users", label: "Foydalanuvchilar" },
  { to: "/analytics", label: "Analitika" },
];

export function AdminLayout() {
  const navigate = useNavigate();

  function logout() {
    setToken(null);
    navigate("/login", { replace: true });
  }

  return (
    <div className="flex min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-white/[0.06] bg-[#0c0a12]">
        <div className="border-b border-white/[0.06] px-5 py-6">
          <div className="flex items-center gap-2">
            <BrandIcon />
            <div>
              <p className="font-display text-white">
                <BrandWordmark />
              </p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">Admin</p>
            </div>
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-gradient-to-r from-violet-600/40 to-fuchsia-600/25 text-white ring-1 ring-white/10"
                    : "text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-200"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-white/[0.06] p-4">
          <button
            type="button"
            onClick={logout}
            className="w-full rounded-lg bg-white/[0.05] py-2 text-xs text-rose-300 hover:bg-rose-500/10"
          >
            Chiqish
          </button>
          <a
            href={import.meta.env.VITE_PUBLIC_SITE_URL || "http://localhost:3000"}
            className="mt-2 block w-full rounded-lg border border-white/10 py-2 text-center text-xs text-zinc-400 hover:border-white/20"
            target="_blank"
            rel="noreferrer"
          >
            Saytga o‘tish
          </a>
        </div>
      </aside>
      <div className="flex min-h-screen flex-1 flex-col pl-64">
        <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-[#0a0a0f]/90 px-8 py-5 backdrop-blur-md">
          <h1 className="font-display text-xl font-semibold tracking-tight text-white">Boshqaruv paneli</h1>
          <p className="mt-1 text-sm text-zinc-500">Kontent, statistika va reklama ma’lumotlari</p>
        </header>
        <main className="flex-1 px-8 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
