const fs = require('fs');
const multer = require('multer');
const path = require('path');

/** Bosh sahifa vertikal qisqa montajlar (1–2 daq., TikTok/Reels uslubi) */
const shortsDir = path.join(__dirname, '..', '..', 'uploads', 'movies', 'shorts');
fs.mkdirSync(shortsDir, { recursive: true });

const videoMime = /^video\/(mp4|webm|quicktime|x-msvideo)$/;

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, shortsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || '') || '.mp4';
    const safe = `short-${Date.now()}-${Math.random().toString(36).slice(2, 10)}${ext}`;
    cb(null, safe);
  },
});

/** ~2 daqiqali vertikal video uchun yetarli limit */
const uploadMovieShort = multer({
  storage,
  limits: { fileSize: 80 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!videoMime.test(file.mimetype)) {
      return cb(new Error('Faqat MP4, WebM yoki MOV'));
    }
    cb(null, true);
  },
}).single('file');

module.exports = { uploadMovieShort };
