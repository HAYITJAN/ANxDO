/**
 * CORS uchun ruxsat etilgan originlar: CLIENT_URL, ADMIN_CLIENT_URL, CORS_EXTRA_ORIGINS.
 * Ortiqcha "/" olib tashlanadi; vergul bilan bir nechta qo‘shimcha domen.
 */

function normalizeOrigin(raw) {
  if (!raw || typeof raw !== 'string') return '';
  const t = raw.trim();
  if (!t) return '';
  try {
    const u = new URL(t);
    return `${u.protocol}//${u.host}`;
  } catch {
    return t.replace(/\/+$/, '');
  }
}

function parseCorsOrigins() {
  const extra = (process.env.CORS_EXTRA_ORIGINS || '')
    .split(',')
    .map((s) => normalizeOrigin(s))
    .filter(Boolean);

  const primary = [
    normalizeOrigin(process.env.CLIENT_URL),
    normalizeOrigin(process.env.ADMIN_CLIENT_URL),
    ...extra,
  ].filter(Boolean);

  const uniq = [...new Set(primary)];

  if (uniq.length === 0) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'Production: set CLIENT_URL va/yoki ADMIN_CLIENT_URL (Render HTTPS URL) yoki CORS_EXTRA_ORIGINS — bo‘lmasa brauzer CORS bilan bloklaydi.'
      );
    }
    return ['http://localhost:3000', 'http://localhost:5173'];
  }

  return uniq;
}

module.exports = { parseCorsOrigins };
