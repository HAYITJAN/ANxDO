const fs = require('fs');
const multer = require('multer');
const path = require('path');

const adsDir = path.join(__dirname, '..', '..', 'uploads', 'ads');
fs.mkdirSync(adsDir, { recursive: true });

const imageMime = /^image\/(jpeg|png|gif|webp)$/;
const videoMime = /^video\/(mp4|webm|quicktime|x-msvideo)$/;

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, adsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || '') || '';
    const safe = `${Date.now()}-${Math.random().toString(36).slice(2, 12)}${ext}`;
    cb(null, safe);
  },
});

const uploadImage = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!imageMime.test(file.mimetype)) {
      return cb(new Error('Faqat JPEG, PNG, GIF yoki WebP'));
    }
    cb(null, true);
  },
}).single('file');

const uploadVideo = multer({
  storage,
  limits: { fileSize: 120 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!videoMime.test(file.mimetype)) {
      return cb(new Error('Faqat MP4, Webm yoki MOV'));
    }
    cb(null, true);
  },
}).single('file');

module.exports = { uploadImage, uploadVideo };
