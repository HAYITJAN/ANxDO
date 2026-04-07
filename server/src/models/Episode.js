const mongoose = require('mongoose');

const episodeSchema = new mongoose.Schema(
  {
    movieId: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
    episodeNumber: { type: Number, required: true },
    title: { type: String, default: '' },
    streams: [
      {
        lang: { type: String, required: true, trim: true },
        label: { type: String, default: '', trim: true },
        videoUrl: { type: String, default: '', trim: true },
        externalWatchUrl: { type: String, default: '', trim: true },
      },
    ],
    /** Birinchi oqim (eski yozuvlar / migratsiya) */
    videoUrl: { type: String, default: '' },
  },
  { timestamps: true }
);

episodeSchema.index({ movieId: 1, episodeNumber: 1 }, { unique: true });

module.exports = mongoose.model('Episode', episodeSchema);
