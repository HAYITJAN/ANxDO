import { apiBase, getToken } from "./api";

export async function uploadAdMedia(file: File, kind: "image" | "video"): Promise<{ url: string }> {
  const token = getToken();
  if (!token) throw new Error("Kirish kerak");
  const path = kind === "image" ? "/ads/upload/image" : "/ads/upload/video";
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(`${apiBase}${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: fd,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(typeof json.message === "string" ? json.message : "Yuklashda xato");
  }
  if (!json.url || typeof json.url !== "string") {
    throw new Error("Javobda URL yo‘q");
  }
  return { url: json.url };
}
