const express = require('express');
const Genre = require('../models/Genre');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (_req, res) => {
  try {
    const genres = await Genre.find().sort({ name: 1 }).lean();
    res.json(genres);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch genres' });
  }
});

router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const name = (req.body?.name || '').trim();
    if (!name) {
      return res.status(400).json({ message: 'Janr nomi kerak' });
    }
    const genre = await Genre.create({ name });
    res.status(201).json(genre);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Bu janr allaqachon mavjud' });
    }
    res.status(400).json({ message: err.message || 'Failed to create genre' });
  }
});

router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const genre = await Genre.findByIdAndDelete(req.params.id);
    if (!genre) {
      return res.status(404).json({ message: 'Genre not found' });
    }
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete genre' });
  }
});

module.exports = router;
