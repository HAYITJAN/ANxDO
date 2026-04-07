const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    /** 1–10 butun son */
    rating: { type: Number, required: true, min: 1, max: 10 },
  },
  { timestamps: true }
);

reviewSchema.index({ movie: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
