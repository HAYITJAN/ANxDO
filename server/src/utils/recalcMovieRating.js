const mongoose = require('mongoose');
const Review = require('../models/Review');
const Movie = require('../models/Movie');

/**
 * Barcha sharhlardan o‘rtacha reyting va sonini Movie ga yozadi.
 */
async function recalcMovieRating(movieId) {
  const id = typeof movieId === 'string' ? new mongoose.Types.ObjectId(movieId) : movieId;
  const agg = await Review.aggregate([
    { $match: { movie: id } },
    { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  const row = agg[0];
  const avg = row?.avg ?? 0;
  const count = row?.count ?? 0;
  const rating = count === 0 ? 0 : Math.round(avg * 10) / 10;
  await Movie.findByIdAndUpdate(id, { rating, ratingCount: count });
}

module.exports = { recalcMovieRating };
