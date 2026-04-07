const express = require('express');
const DailyStat = require('../models/DailyStat');

const router = express.Router();

/** Sayt sahifasi ochilishi (asosiy frontenddan chaqiriladi) */
router.post('/pageview', async (req, res) => {
  try {
    await DailyStat.bumpPageView();
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed' });
  }
});

/**
 * Reklama statistikasi: ko‘rinish yoki bosish
 * body: { type: 'impression' | 'click', slot?: string }
 */
router.post('/ad', async (req, res) => {
  try {
    const t = req.body?.type;
    if (t !== 'click' && t !== 'impression') {
      return res.status(400).json({ message: 'type: impression yoki click' });
    }
    await DailyStat.bumpAd(t);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed' });
  }
});

module.exports = router;
