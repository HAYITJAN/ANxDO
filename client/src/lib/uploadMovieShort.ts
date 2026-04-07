import { apiBase } from "@/lib/api";

/** Kinoning bosh sahifa qisqa montaj videosini serverga yuklaydi; `trailerShortUrl` ga yoziladi */
export async function uploadMovieShortVideo(file: File, token: string): Promise<{ url: string }> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(`${apiBase}/movies/upload/short`, {
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
