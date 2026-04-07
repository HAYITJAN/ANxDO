const DailyStat = require('../models/DailyStat');

/**
 * Har bir /api/* so‘rovini sanaydi (health bundan mustasno).
 */
function bumpApiStats(req, res, next) {
  if (req.path === '/health' || req.originalUrl?.startsWith('/api/health')) {
    return next();
  }
  DailyStat.bumpApi().catch((e) => console.error('bumpApiStats', e));
  next();
}

module.exports = { bumpApiStats };
