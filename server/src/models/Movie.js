const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    genre: [{ type: String, trim: true }],
    year: { type: Number },
    /** O‘rtacha foydalanuvchi bahosi (1–10), sharhlardan hisoblanadi */
    rating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    posterUrl: { type: String, default: '' },
    bannerUrl: { type: String, default: '' },
    /** TikTok / YouTube Shorts uslubidagi qisqa treyler (bosh sahifada vertikal lenta) */
    trailerShortUrl: { type: String, default: '', trim: true },
    type: { type: String, enum: ['movie', 'anime', 'dorama'], required: true },
    /**
     * Til bo‘yicha video havolalari (film uchun).
     * Birinchi element `videoUrl` maydoni bilan sinxron saqlanadi (eski mijozlar).
     */
    streams: [
      {
        lang: { type: String, required: true, trim: true },
        label: { type: String, default: '', trim: true },
        /** Saytda treyler / embed (YouTube, .mp4) — ixtiyoriy */
        videoUrl: { type: String, default: '', trim: true },
        /** To‘liq film boshqa saytda — tanlangan tilda yangi oynada ochiladi */
        externalWatchUrl: { type: String, default: '', trim: true },
      },
    ],
    /** Birinchi oqim yoki yagona URL (migratsiya / qisqa kirish) */
    videoUrl: { type: String, default: '' },
    views: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
    newRelease: { type: Boolean, default: false },
  },
  { timestamps: true }
);

movieSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Movie', movieSchema);
