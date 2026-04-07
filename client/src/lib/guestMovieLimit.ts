/**
 * Mehmon: cheklovsiz emas — turli kinolar/seriallar (title) soni.
 * Bir film/serial bir marta hisoblanadi; qayta tomosha qilish limitni sarflamaydi.
 */

const STORAGE_KEY = "sf_guest_movie_ids";

/** Ro‘yxatdan o‘tmagan foydalanuvchi nechta turli kontentni ochishi mumkin (keyin majburiy ro‘yxat). */
export const GUEST_FREE_TITLE_LIMIT = 15;

export function getGuestWatchedMovieIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as unknown;
    return Array.isArray(arr) ? arr.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function guestUniqueTitleCount(): number {
  return getGuestWatchedMovieIds().length;
}

/** Bu kontentni (film yoki serial) mehmon ochishi mumkinmi? */
export function canGuestAccessMovie(movieId: string, isLoggedIn: boolean): boolean {
  if (isLoggedIn) return true;
  const ids = getGuestWatchedMovieIds();
  if (ids.includes(movieId)) return true;
  return ids.length < GUEST_FREE_TITLE_LIMIT;
}

/** Yangi turli kontent sifatida hisobga qo‘shiladi (allaqachon bo‘lsa hech narsa qilmaydi). */
export function recordGuestMovie(movieId: string) {
  if (typeof window === "undefined") return;
  const ids = getGuestWatchedMovieIds();
  if (ids.includes(movieId)) return;
  ids.push(movieId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}
