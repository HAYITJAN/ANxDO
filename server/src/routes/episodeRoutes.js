const express = require('express');
const Episode = require('../models/Episode');
const Movie = require('../models/Movie');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { normalizeEpisodeStreams } = require('../utils/normalizeEpisodeStreams');

const router = express.Router();

/**
 * GET /api/episodes/:movieId — list episodes for a title (series)
 */
router.get('/:movieId', async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.movieId);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }
    const episodes = await Episode.find({ movieId: req.params.movieId })
      .sort({ episodeNumber: 1 })
      .lean();
    res.json(episodes);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch episodes' });
  }
});

router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const body = normalizeEpisodeStreams(req.body);
    const { movieId, episodeNumber, title } = body;
    if (!movieId || episodeNumber == null) {
      return res.status(400).json({ message: 'movieId va episodeNumber majburiy' });
    }
    if (!body.videoUrl?.trim() && (!body.streams || body.streams.length === 0)) {
      return res.status(400).json({
        message: 'Kamida bitta til uchun saytdagi video yoki tashqi tomosha havolasi kerak',
      });
    }
    const ep = await Episode.create({
      movieId,
      episodeNumber: Number(episodeNumber),
      title: title || '',
      streams: body.streams || [],
      videoUrl: body.videoUrl || '',
    });
    res.status(201).json(ep);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Episode number already exists for this title' });
    }
    res.status(400).json({ message: err.message || 'Failed to create episode' });
  }
});

router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const ep = await Episode.findById(req.params.id);
    if (!ep) {
      return res.status(404).json({ message: 'Episode not found' });
    }
    const merged = { ...ep.toObject(), ...req.body };
    const body = normalizeEpisodeStreams(merged);
    if (!body.videoUrl?.trim() && (!body.streams || body.streams.length === 0)) {
      return res.status(400).json({
        message: 'Kamida bitta til uchun saytdagi video yoki tashqi tomosha havolasi kerak',
      });
    }
    const updated = await Episode.findByIdAndUpdate(
      req.params.id,
      {
        episodeNumber: Number(body.episodeNumber),
        title: String(body.title || '').trim(),
        streams: body.streams || [],
        videoUrl: body.videoUrl || '',
      },
      { new: true, runValidators: true }
    );
    res.json(updated);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Bu qism raqami bu serial uchun allaqachon mavjud' });
    }
    res.status(400).json({ message: err.message || 'Yangilashda xato' });
  }
});

router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const ep = await Episode.findByIdAndDelete(req.params.id);
    if (!ep) {
      return res.status(404).json({ message: 'Episode not found' });
    }
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete episode' });
  }
});

module.exports = router;
