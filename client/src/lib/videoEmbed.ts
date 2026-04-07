/**
 * Tomosha uchun URL: YouTube / Vimeo sahifa havolasi yoki to‘g‘ridan-to‘g‘ri video fayl (.mp4 va h.k.).
 */
export function toEmbedUrl(url: string): string | null {
  if (!url?.trim()) return null;
  const u = url.trim();
  try {
    /** Allaqachon embed havola */
    if (u.includes("youtube.com/embed/") || u.includes("youtube-nocookie.com/embed/")) {
      return u;
    }
    if (u.includes("youtube.com/shorts/")) {
      const id = u.split("youtube.com/shorts/")[1]?.split(/[?&#]/)[0];
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (u.includes("youtube.com/watch")) {
      const v = new URL(u).searchParams.get("v");
      return v ? `https://www.youtube.com/embed/${v}` : null;
    }
    if (u.includes("youtu.be/")) {
      const id = u.split("youtu.be/")[1]?.split(/[?&#]/)[0];
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (u.includes("player.vimeo.com/video/")) {
      const id = u.match(/player\.vimeo\.com\/video\/(\d+)/)?.[1];
      return id ? `https://player.vimeo.com/video/${id}` : u.split("?")[0];
    }
    if (u.includes("vimeo.com")) {
      const id =
        u.match(/vimeo\.com\/video\/(\d+)/)?.[1] ??
        u.match(/vimeo\.com\/(?:channels\/[^/]+\/|groups\/[^/]+\/)?(\d+)/)?.[1];
      return id ? `https://player.vimeo.com/video/${id}` : u;
    }
  } catch {
    return null;
  }
  return u;
}

/** iframe orqali ko‘rsatiladi (YouTube / Vimeo), `<video>` emas */
export function isIframeEmbedUrl(url: string): boolean {
  if (!url?.trim()) return false;
  return (
    url.includes("youtube.com/embed") ||
    url.includes("youtube-nocookie.com/embed") ||
    url.includes("player.vimeo.com/video")
  );
}
