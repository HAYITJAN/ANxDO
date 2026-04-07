const express = require('express');
const mongoose = require('mongoose');
const Movie = require('../models/Movie');
const Episode = require('../models/Episode');
const Review = require('../models/Review');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { uploadMovieShort } = require('../middleware/uploadMovieShort');
const { recalcMovieRating } = require('../utils/recalcMovieRating');
const { normalizeMovieStreams } = require('../utils/normalizeMovieStreams');

const router = express.Router();

function runShortUpload(mw) {
  return (req, res, next) => {
    mw(req, res, (err) => {
      if (err) return res.status(400).json({ message: err.message || 'Yuklash xatosi' });
      next();
    });
  };
}

/** Admin: filmda ishlatish uchun qisqa vertikal montaj (kompyuterdan) */
router.post(
  '/upload/short',
  authenticate,
  requireAdmin,
  runShortUpload(uploadMovieShort),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: 'Fayl tanlanmagan' });
    }
    const base = `${req.protocol}://${req.get('host')}`;
    const url = `${base}/uploads/movies/shorts/${req.file.filename}`;
    res.status(201).json({ url });
  }
);

function escapeRegex(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function stripAdminRating(body) {
  if (!body || typeof body !== 'object') return {};
  const { rating, ratingCount, ...rest } = body;
  return rest;
}

/**
 * GET /api/movies
 * Query: type, genre, search, featured
 */
router.get('/', async (req, res) => {
  try {
    const { type, genre, search, featured } = req.query;
    const filter = {};
    if (type && ['movie', 'anime', 'dorama'].includes(type)) {
      filter.type = type;
    }
    if (genre) {
      const g = String(genre).trim();
      if (g) {
        filter.genre = g;
      }
    }
    if (search) {
      const safe = escapeRegex(String(search).trim());
      if (safe) {
        filter.$or = [
          { title: new RegExp(safe, 'i') },
          { description: new RegExp(safe, 'i') },
        ];
      }
    }
    if (featured === 'true') {
      filter.featured = true;
    }
    const movies = await Movie.find(filter).sort({ createdAt: -1 }).lean();
    res.json(movies);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch movies' });
  }
});

/**
 * GET /api/movies/new-releases?limit=5
 * Yangi chiqish (newRelease) — bosh sahifa banner va bildirishnomalar.
 * `/:id` dan oldin bo‘lishi kerak.
 */
router.get('/new-releases', async (req, res) => {
  try {
    const raw = Number(req.query.limit);
    const limit = Number.isFinite(raw) ? Math.min(20, Math.max(1, Math.floor(raw))) : 5;
    const movies = await Movie.find({ newRelease: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    res.json(movies);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch new releases' });
  }
});

/** Mening bahom (kirgan foydalanuvchi) */
router.get('/:id/reviews/me', authenticate, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid id' });
    }
    const review = await Review.findOne({
      movie: req.params.id,
      user: req.user._id,
    })
      .select('rating')
      .lean();
    res.json(review ? { rating: review.rating } : null);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch review' });
  }
});

/** Bahoni bir marta qo‘yish (1–10), keyin o‘zgartirilmaydi */
router.post('/:id/reviews', authenticate, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid id' });
    }
    const movie = await Movie.findById(req.params.id).select('_id');
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }
    const raw = Number(req.body?.rating);
    if (!Number.isFinite(raw) || raw < 1 || raw > 10 || Math.floor(raw) !== raw) {
      return res.status(400).json({ message: 'Bahoni 1 dan 10 gacha butun son kiriting' });
    }
    const existing = await Review.findOne({ movie: req.params.id, user: req.user._id }).select('_id');
    if (existing) {
      return res.status(409).json({ message: 'Bahoni bir marta qo‘yish mumkin, o‘zgartirib bo‘lmaydi' });
    }
    await Review.create({
      movie: req.params.id,
      user: req.user._id,
      rating: raw,
    });
    await recalcMovieRating(req.params.id);
    const updated = await Movie.findById(req.params.id).lean();
    res.json({ ok: true, movie: updated });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message || 'Failed to save review' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const skipView = req.query.skipView === 'true';
    let movie = await Movie.findById(req.params.id).lean();
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }
    if (!skipView) {
      movie = await Movie.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true }).lean();
    }
    res.json(movie);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch movie' });
  }
});

router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    let body = stripAdminRating(req.body);
    body = normalizeMovieStreams(body);
    const movie = await Movie.create({
      ...body,
      rating: 0,
      ratingCount: 0,
    });
    res.status(201).json(movie);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message || 'Failed to create movie' });
  }
});

router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    let body = stripAdminRating(req.body);
    body = normalizeMovieStreams(body);
    const movie = await Movie.findByIdAndUpdate(req.params.id, body, {
      new: true,
      runValidators: true,
    });
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }
    res.json(movie);
  } catch (err) {
    res.status(400).json({ message: err.message || 'Failed to update movie' });
  }
});

router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    await Review.deleteMany({ movie: req.params.id });
    await Episode.deleteMany({ movieId: req.params.id });
    const movie = await Movie.findByIdAndDelete(req.params.id);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete movie' });
  }
});

module.exports = router;
