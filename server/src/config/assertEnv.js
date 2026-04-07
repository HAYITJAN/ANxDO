/**
 * Productionda muhit o‘zgaruvchilarini tekshiradi — deployda "nima uchun ishlamayapti" ni kamaytiradi.
 */

function assertProductionEnv() {
  if (process.env.NODE_ENV !== 'production') {
    return;
  }
  const secret = process.env.JWT_SECRET;
  if (!secret || typeof secret !== 'string' || secret.length < 24) {
    throw new Error(
      'Production: JWT_SECRET kamida 24 belgi bo‘lsin (masalan: openssl rand -base64 32).'
    );
  }

  const mongo = (process.env.MONGODB_URI || '').trim();
  if (!mongo) {
    throw new Error('Production: MONGODB_URI majburiy.');
  }

  const client = (process.env.CLIENT_URL || '').trim();
  if (client && /localhost|127\.0\.0\.1/i.test(client)) {
    console.warn(
      '[env] CLIENT_URL hali localhost — agar frontend boshqa domen/Render da bo‘lsa, CORS xatolik beradi. Haqiqiy sayt URL ni qo‘ying.'
    );
  }
}

module.exports = { assertProductionEnv };
