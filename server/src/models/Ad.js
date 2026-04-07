const mongoose = require('mongoose');

const adSchema = new mongoose.Schema(
  {
    /** Qisqa sarlavha (masalan: “Yangi mahsulot”) */
    title: { type: String, default: '', trim: true },
    /** Matn / tavsif (ixtiyoriy) */
    body: { type: String, default: '' },
    /** Rasm yoki video */
    mediaType: { type: String, enum: ['image', 'video'], required: true },
    imageUrl: { type: String, default: '', trim: true },
    videoUrl: { type: String, default: '', trim: true },
    /** Bosilganda ochiladigan havola (ixtiyoriy) */
    linkUrl: { type: String, default: '', trim: true },
    active: { type: Boolean, default: true },
    /** Ko‘rinish tartibi (kichik = yuqorida) */
    sortOrder: { type: Number, default: 0 },
    /** Masalan: home — bosh sahifa banner qatori */
    placement: { type: String, default: 'home', trim: true },
  },
  { timestamps: true }
);

adSchema.index({ active: 1, placement: 1, sortOrder: 1 });

module.exports = mongoose.model('Ad', adSchema);
