const express = require('express');
const Ad = require('../models/Ad');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { uploadImage, uploadVideo } = require('../middleware/uploadAdFile');

const router = express.Router();

function runUpload(mw) {
  return (req, res, next) => {
    mw(req, res, (err) => {
      if (err) return res.status(400).json({ message: err.message || 'Yuklash xatosi' });
      next();
    });
  };
}

function sendUploadedUrl(req, res) {
  if (!req.file) {
    return res.status(400).json({ message: 'Fayl tanlanmagan' });
  }
  const base = `${req.protocol}://${req.get('host')}`;
  const url = `${base}/uploads/ads/${req.file.filename}`;
  res.status(201).json({ url });
}

function normalizeAdBody(body) {
  const title = String(body?.title ?? '').trim();
  const text = String(body?.body ?? '').trim();
  const mediaType = body?.mediaType === 'video' ? 'video' : 'image';
  const imageUrl = String(body?.imageUrl ?? '').trim();
  const videoUrl = String(body?.videoUrl ?? '').trim();
  const linkUrl = String(body?.linkUrl ?? '').trim();
  const active = body?.active !== false;
  const sortOrder = Number.isFinite(Number(body?.sortOrder)) ? Number(body.sortOrder) : 0;
  const placement = String(body?.placement ?? 'home').trim() || 'home';

  if (mediaType === 'image' && !imageUrl) {
    return { error: 'Rasm URL i majburiy' };
  }
  if (mediaType === 'video' && !videoUrl) {
    return { error: 'Video URL i majburiy' };
  }

  return {
    data: {
      title,
      body: text,
      mediaType,
      imageUrl,
      videoUrl,
      linkUrl,
      active,
      sortOrder,
      placement,
    },
  };
}

/** Sayt uchun: faqat faol reklamalar */
router.get('/', async (req, res) => {
  try {
    const placement = req.query.placement ? String(req.query.placement).trim() : '';
    const q = { active: true };
    if (placement) q.placement = placement;
    const ads = await Ad.find(q).sort({ sortOrder: 1, createdAt: -1 }).lean();
    res.json(ads);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Reklamalarni olishda xato' });
  }
});

/** Kompyuterdan rasm yuklash (admin) */
router.post(
  '/upload/image',
  authenticate,
  requireAdmin,
  runUpload(uploadImage),
  sendUploadedUrl
);

/** Kompyuterdan video yuklash (admin) */
router.post(
  '/upload/video',
  authenticate,
  requireAdmin,
  runUpload(uploadVideo),
  sendUploadedUrl
);

/** Barcha yozuvlar (admin) */
router.get('/manage', authenticate, requireAdmin, async (_req, res) => {
  try {
    const ads = await Ad.find().sort({ sortOrder: 1, createdAt: -1 }).lean();
    res.json(ads);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Reklamalarni olishda xato' });
  }
});

router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const n = normalizeAdBody(req.body);
    if (n.error) return res.status(400).json({ message: n.error });
    const ad = await Ad.create(n.data);
    res.status(201).json(ad);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message || 'Saqlashda xato' });
  }
});

router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const n = normalizeAdBody(req.body);
    if (n.error) return res.status(400).json({ message: n.error });
    const ad = await Ad.findByIdAndUpdate(req.params.id, n.data, { new: true, runValidators: true });
    if (!ad) return res.status(404).json({ message: 'Topilmadi' });
    res.json(ad);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message || 'Yangilashda xato' });
  }
});

router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const ad = await Ad.findByIdAndDelete(req.params.id);
    if (!ad) return res.status(404).json({ message: 'Topilmadi' });
    res.json({ message: 'O‘chirildi' });
  } catch (err) {
    res.status(500).json({ message: 'O‘chirishda xato' });
  }
});

module.exports = router;
