const express = require('express');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { signToken } = require('../utils/token');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password min 6 characters'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { name, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, role: 'user' });
    const token = signToken(user._id);
    const safe = user.toObject();
    delete safe.password;
    res.status(201).json({ token, user: safe });
  }
);

router.post(
  '/login',
  [body('email').trim().notEmpty(), body('password').notEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    let { email, password } = req.body;
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@streamflix.com').toLowerCase();
    const raw = String(email).trim();
    const lower = raw.toLowerCase();
    if (lower === 'admin' || lower === 'administrator') {
      email = adminEmail;
    } else if (validator.isEmail(raw)) {
      email = validator.normalizeEmail(raw) || lower;
    } else {
      return res.status(400).json({ message: 'Email noto‘g‘ri' });
    }
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = signToken(user._id);
    const safe = user.toObject();
    delete safe.password;
    res.json({ token, user: safe });
  }
);

/** Current user profile (protected) */
router.get('/me', authenticate, async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('favorites')
    .select('-password');
  res.json(user);
});

module.exports = router;
