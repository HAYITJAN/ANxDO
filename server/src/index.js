require('./config/loadDotenv');
require('./config/dnsBootstrap');
const path = require('path');
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');
const { ensureDefaultAdmin } = require('./config/ensureDefaultAdmin');
const { ensureDefaultGenres } = require('./config/ensureDefaultGenres');
const { logAtlasHelp } = require('./config/atlasConnectionHelp');
const { parseCorsOrigins } = require('./config/parseCorsOrigins');
const { assertProductionEnv } = require('./config/assertEnv');

const authRoutes = require('./routes/authRoutes');
const movieRoutes = require('./routes/movieRoutes');
const episodeRoutes = require('./routes/episodeRoutes');
const userRoutes = require('./routes/userRoutes');
const statsRoutes = require('./routes/statsRoutes');
const genreRoutes = require('./routes/genreRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const adRoutes = require('./routes/adRoutes');
const { bumpApiStats } = require('./middleware/bumpApiStats');

const app = express();
const PORT = Number(process.env.PORT) || 5000;

const corsOrigins = parseCorsOrigins();
if (process.env.NODE_ENV !== 'production') {
  console.log('[cors]', corsOrigins.join(', '));
}

app.use(
  cors({
    origin: corsOrigins,
    credentials: true,
  })
);
app.use(express.json());

const uploadsRoot = path.join(__dirname, '..', 'uploads');
app.use('/uploads', express.static(uploadsRoot));

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.use('/api', bumpApiStats);
app.use('/api/auth', authRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/genres', genreRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/episodes', episodeRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/ads', adRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

async function start() {
  assertProductionEnv();
  await connectDB();
  await ensureDefaultAdmin();
  await ensureDefaultGenres();
  const host = process.env.LISTEN_HOST || '0.0.0.0';
  app.listen(PORT, host, () => {
    console.log(`API listening on ${host}:${PORT}`);
  });
}

start().catch((e) => {
  logAtlasHelp(e);
  console.error(e);
  process.exit(1);
});
