import { publicApiBase } from "@/lib/publicApiBase";

export const apiBase = publicApiBase;

export async function apiFetch(
  path: string,
  init: RequestInit & { token?: string | null } = {}
) {
  const { token, ...rest } = init;
  const headers = new Headers(rest.headers);
  if (!headers.has("Content-Type") && rest.body) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  const url = path.startsWith("http") ? path : `${apiBase}${path.startsWith("/") ? path : `/${path}`}`;
  return fetch(url, { ...rest, headers });
}
