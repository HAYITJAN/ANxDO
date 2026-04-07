const express = require('express');
const Movie = require('../models/Movie');
const User = require('../models/User');
const Episode = require('../models/Episode');
const DailyStat = require('../models/DailyStat');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

function daysAgoKey(n) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
}

/** Admin dashboard stats */
router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const [totalMovies, totalUsers, totalEpisodes] = await Promise.all([
      Movie.countDocuments(),
      User.countDocuments(),
      Episode.countDocuments(),
    ]);
    const viewsAgg = await Movie.aggregate([{ $group: { _id: null, total: { $sum: '$views' } } }]);
    const totalViews = viewsAgg[0]?.total || 0;

    const recent = await Movie.find()
      .sort({ createdAt: -1 })
      .limit(8)
      .select('title createdAt type')
      .lean();

    const topMovies = await Movie.find()
      .sort({ views: -1 })
      .limit(10)
      .select('title views type posterUrl year')
      .lean();

    const fromDay = daysAgoKey(29);
    const daily = await DailyStat.find({ day: { $gte: fromDay } }).sort({ day: 1 }).lean();

    const adAgg = await DailyStat.aggregate([
      {
        $group: {
          _id: null,
          adImpressions: { $sum: '$adImpressions' },
          adClicks: { $sum: '$adClicks' },
          apiRequests: { $sum: '$apiRequests' },
          pageViews: { $sum: '$pageViews' },
        },
      },
    ]);
    const adRow = adAgg[0] || {};

    res.json({
      totalMovies,
      totalUsers,
      totalEpisodes,
      totalViews,
      recentUploads: recent,
      topMovies,
      dailyStats: daily.map((d) => ({
        day: d.day,
        apiRequests: d.apiRequests,
        pageViews: d.pageViews,
        adImpressions: d.adImpressions,
        adClicks: d.adClicks,
      })),
      adTotals: {
        impressions: adRow.adImpressions || 0,
        clicks: adRow.adClicks || 0,
        ctr:
          adRow.adImpressions > 0
            ? Math.round((10000 * (adRow.adClicks || 0)) / adRow.adImpressions) / 100
            : 0,
      },
      trafficTotals: {
        apiRequests: adRow.apiRequests || 0,
        pageViews: adRow.pageViews || 0,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load stats' });
  }
});

module.exports = router;
