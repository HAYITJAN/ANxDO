const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

/** Authenticated: toggle favorite movie — before /:id routes */
router.post('/me/favorites', authenticate, async (req, res) => {
  try {
    const { movieId } = req.body;
    if (!movieId) {
      return res.status(400).json({ message: 'movieId required' });
    }
    const user = await User.findById(req.user._id);
    const idx = user.favorites.map(String).indexOf(String(movieId));
    if (idx >= 0) {
      user.favorites.splice(idx, 1);
    } else {
      user.favorites.push(movieId);
    }
    await user.save();
    const populated = await User.findById(user._id).populate('favorites').select('-password');
    res.json(populated);
  } catch (err) {
    res.status(400).json({ message: err.message || 'Failed to update favorites' });
  }
});

/** Authenticated: watch history / continue watching */
router.post('/me/watch-history', authenticate, async (req, res) => {
  try {
    const { movieId, episodeNumber, progress } = req.body;
    if (!movieId) {
      return res.status(400).json({ message: 'movieId required' });
    }
    const user = await User.findById(req.user._id);
    const list = user.watchHistory || [];
    const i = list.findIndex(
      (e) =>
        String(e.movieId) === String(movieId) &&
        Number(e.episodeNumber) === Number(episodeNumber ?? null)
    );
    const entry = {
      movieId,
      episodeNumber: episodeNumber ?? null,
      progress: progress ?? 0,
      updatedAt: new Date(),
    };
    if (i >= 0) {
      list[i] = entry;
    } else {
      list.push(entry);
    }
    user.watchHistory = list.slice(-50);
    await user.save();
    const populated = await User.findById(user._id)
      .populate('watchHistory.movieId')
      .select('-password');
    res.json(populated);
  } catch (err) {
    res.status(400).json({ message: err.message || 'Failed to update history' });
  }
});

/** Admin: list all users */
router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 }).lean();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

/** Admin: delete user */
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid user id' });
    }
    if (req.params.id === String(req.user._id)) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }
    const u = await User.findByIdAndDelete(req.params.id);
    if (!u) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete user' });
  }
});

/** Admin: change role */
router.patch('/:id/role', authenticate, requireAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    const u = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');
    if (!u) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(u);
  } catch (err) {
    res.status(400).json({ message: 'Failed to update role' });
  }
});

module.exports = router;
