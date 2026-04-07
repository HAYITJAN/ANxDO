const Genre = require('../models/Genre');
const { DEFAULT_GENRE_NAMES } = require('./defaultGenres');

/**
 * Har server ishga tushishida: ro‘yxatdagi janrlar bazada bo‘lmasa yaratiladi.
 */
async function ensureDefaultGenres() {
  for (const name of DEFAULT_GENRE_NAMES) {
    try {
      await Genre.findOneAndUpdate(
        { name },
        { $setOnInsert: { name } },
        { upsert: true }
      );
    } catch (e) {
      console.warn('ensureDefaultGenres:', name, e.message);
    }
  }
  console.log('Default janrlar tekshirildi (', DEFAULT_GENRE_NAMES.length, 'nom).');
}

module.exports = { ensureDefaultGenres };
