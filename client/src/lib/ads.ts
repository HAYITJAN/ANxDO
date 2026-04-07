const apiBase =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:5000/api";

/** Pastki lenta «reklama» matni bosilganda ochiladigan manzil (mailto:, https, Telegram va hokazo). */
export const AD_INQUIRY_HREF =
  process.env.NEXT_PUBLIC_ADS_CONTACT_URL?.trim() ||
  "mailto:?subject=Reklama%20%7C%20ANDO";

export type AdItem = {
  _id: string;
  title?: string;
  body?: string;
  mediaType: "image" | "video";
  imageUrl?: string;
  videoUrl?: string;
  linkUrl?: string;
  active?: boolean;
  sortOrder?: number;
  placement?: string;
};

export async function fetchAds(placement = "home"): Promise<AdItem[]> {
  try {
    const q = placement ? `?placement=${encodeURIComponent(placement)}` : "";
    const res = await fetch(`${apiBase}/ads${q}`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

/** O‘ng 150px panel — admin: Joylashuv = `sidebar` */
export const AD_PLACEMENT_SIDEBAR = "sidebar";

/** Brauzer (fixed reklama paneli) */
export async function fetchAdsClient(placement: string): Promise<AdItem[]> {
  try {
    const q = placement ? `?placement=${encodeURIComponent(placement)}` : "";
    const res = await fetch(`${apiBase}/ads${q}`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}
