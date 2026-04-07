const raw =
  import.meta.env.VITE_API_URL?.trim() ||
  import.meta.env.VITE_API_BASE?.trim() ||
  "http://localhost:5000/api";

export const apiBase = raw.replace(/\/$/, "");

export function getToken(): string | null {
  return localStorage.getItem("streamflix-admin-token");
}

export function setToken(t: string | null) {
  if (t) localStorage.setItem("streamflix-admin-token", t);
  else localStorage.removeItem("streamflix-admin-token");
}

export async function apiFetch(
  path: string,
  init: RequestInit & { token?: string | null } = {}
) {
  const { token, ...rest } = init;
  const headers = new Headers(rest.headers);
  if (!headers.has("Content-Type") && rest.body) {
    headers.set("Content-Type", "application/json");
  }
  const t = token ?? getToken();
  if (t) headers.set("Authorization", `Bearer ${t}`);
  const url = path.startsWith("http") ? path : `${apiBase}${path.startsWith("/") ? path : `/${path}`}`;
  return fetch(url, { ...rest, headers });
}
