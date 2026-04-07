const VIEW_KEY = "ando-notifications-last-viewed-at";

/** Bildirishnomalar paneli oxirgi ochilgan vaqt (ISO) */
export function getLastNotificationsViewedAt(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(VIEW_KEY);
  } catch {
    return null;
  }
}

export function markNotificationsViewed(): void {
  try {
    localStorage.setItem(VIEW_KEY, new Date().toISOString());
  } catch {
    /* ignore */
  }
}

export function hasUnreadNewReleases(
  items: { createdAt?: string }[],
  lastViewedIso: string | null
): boolean {
  if (!items.length) return false;
  const last = lastViewedIso ? new Date(lastViewedIso).getTime() : 0;
  return items.some((m) => {
    if (!m.createdAt) return false;
    return new Date(m.createdAt).getTime() > last;
  });
}
