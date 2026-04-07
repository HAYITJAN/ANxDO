const bcrypt = require('bcryptjs');
const User = require('../models/User');

/**
 * Bitta administrator akkaunti: email va parol .env dan (yoki default).
 * Server har ishga tushganda parol yangilanadi — `.env` dagi ADMIN_PASSWORD bilan mos.
 */
async function ensureDefaultAdmin() {
  const email = (process.env.ADMIN_EMAIL || 'admin@streamflix.com').toLowerCase().trim();
  const plain = process.env.ADMIN_PASSWORD || 'Hayit406';
  if (!plain || plain.length < 6) {
    console.warn('ADMIN_PASSWORD kamida 6 belgi bo‘lishi kerak; default admin yaratilmadi.');
    return;
  }

  const hashed = await bcrypt.hash(plain, 10);
  const existing = await User.findOne({ email }).select('+password');

  if (existing) {
    await User.updateOne(
      { _id: existing._id },
      { $set: { password: hashed, role: 'admin', name: existing.name || 'Admin' } }
    );
    console.log('Admin akkaunt yangilandi:', email);
    return;
  }

  await User.create({
    name: 'Admin',
    email,
    password: hashed,
    role: 'admin',
  });
  console.log('Admin akkaunt yaratildi:', email);
}

module.exports = { ensureDefaultAdmin };
