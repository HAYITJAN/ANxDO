/**
 * Vercel/Render: NEXT_PUBLIC_API_URL yoki NEXT_PUBLIC_API_BASE (ikkalasi ham qo‘llab-quvvatlanadi).
 */
function normalize(): string {
  const raw =
    process.env.NEXT_PUBLIC_API_URL?.trim() ||
    process.env.NEXT_PUBLIC_API_BASE?.trim() ||
    "http://localhost:5000/api";
  return raw.replace(/\/$/, "");
}

export const publicApiBase = normalize();
