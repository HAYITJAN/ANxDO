/**
 * MONGODB_URI + ixtiyoriy MONGODB_PASSWORD (Atlas parolini URI ga xavfsiz qo‘yish uchun).
 */

function getMongoUri() {
  let uri = process.env.MONGODB_URI;
  if (!uri || typeof uri !== 'string') {
    return '';
  }
  uri = uri.trim();
  const pwd = process.env.MONGODB_PASSWORD?.trim();
  if (pwd && uri.includes('YOUR_PASSWORD_HERE')) {
    uri = uri.replace(/YOUR_PASSWORD_HERE/g, encodeURIComponent(pwd));
  }
  // Atlas DB userlar ko‘pincha admin DB da — ba’zi muhitlarda autentifikatsiya xatosi ReplicaSetNoPrimary ko‘rinadi
  if (!uri.includes('authSource=')) {
    uri += uri.includes('?') ? '&authSource=admin' : '?authSource=admin';
  }
  return uri;
}

function assertMongoUriReady(uri) {
  if (!uri || typeof uri !== 'string') {
    throw new Error('MONGODB_URI .env faylida yo‘q yoki bo‘sh.');
  }
  const trimmed = uri.trim();
  if (
    trimmed.includes('YOUR_PASSWORD_HERE') ||
    trimmed.includes('<password>') ||
    trimmed.includes('<db_password>')
  ) {
    throw new Error(
      'MongoDB paroli berilmagan. Ikki yo‘l: (1) server/.env da MONGODB_PASSWORD=... qatoriga Atlas parolini yozing; yoki (2) MONGODB_URI ichidagi YOUR_PASSWORD_HERE o‘rniga parolni to‘g‘ridan-to‘g‘ri yozing (maxsus belgilar bo‘lsa Atlas “Connect” dan tayyor qatorni nusxalang).'
    );
  }
}

module.exports = { getMongoUri, assertMongoUriReady };
