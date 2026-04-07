import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";

type UserRow = {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt?: string;
};

export default function Users() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let c = false;
    (async () => {
      const res = await apiFetch("/users");
      if (res.ok) {
        const data = await res.json();
        if (!c) setUsers(Array.isArray(data) ? data : []);
      }
      if (!c) setLoading(false);
    })();
    return () => {
      c = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-display mb-6 text-lg font-semibold text-white">Foydalanuvchilar</h2>
      <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0c0a12]/50">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/[0.06] text-xs uppercase tracking-wider text-zinc-500">
              <th className="px-4 py-3 font-medium">Ism</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Rol</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="border-b border-white/[0.04] last:border-0">
                <td className="px-4 py-3 text-zinc-200">{u.name}</td>
                <td className="px-4 py-3 text-zinc-400">{u.email}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-md px-2 py-0.5 text-xs font-medium ${
                      u.role === "admin" ? "bg-violet-500/20 text-violet-200" : "bg-zinc-500/20 text-zinc-300"
                    }`}
                  >
                    {u.role}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
