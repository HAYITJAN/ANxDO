/**
 * Seed sample movies and a default admin user.
 * Run: npm run seed (requires MONGODB_URI in .env)
 */
require('dotenv').config();
require('./config/dnsBootstrap');
const { logAtlasHelp } = require('./config/atlasConnectionHelp');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const mongoOptions = require('./config/mongoOptions');
const { getMongoUri, assertMongoUriReady } = require('./config/validateMongoUri');
const User = require('./models/User');
const Movie = require('./models/Movie');
const Episode = require('./models/Episode');
const Genre = require('./models/Genre');
const Review = require('./models/Review');
const { recalcMovieRating } = require('./utils/recalcMovieRating');
const { DEFAULT_GENRE_NAMES } = require('./config/defaultGenres');

const samplePoster = 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&q=80';
const sampleBanner = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1920&q=80';

async function seed() {
  const uri = getMongoUri();
  assertMongoUriReady(uri);
  await mongoose.connect(uri, mongoOptions);
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@streamflix.com').toLowerCase();
  const adminPlain = process.env.ADMIN_PASSWORD || 'Hayit406';

  await Review.deleteMany({});
  await Episode.deleteMany({});
  await Movie.deleteMany({});
  await Genre.deleteMany({});
  await User.deleteMany({ email: adminEmail });

  const adminPass = await bcrypt.hash(adminPlain, 10);
  const admin = await User.create({
    name: 'Admin User',
    email: adminEmail,
    password: adminPass,
    role: 'admin',
  });

  const rawMovies = [
    {
      title: 'Neon Blade Runner',
      description:
        'In a dystopian future where technology and humanity merge, a rogue detective uncovers a conspiracy.',
      genre: ['Sci-Fi', 'Action', 'Thriller'],
      year: 2024,
      demoRating: 9,
      posterUrl: samplePoster,
      bannerUrl: sampleBanner,
      type: 'movie',
      streams: [
        { lang: 'uz', label: 'O‘zbek', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
        { lang: 'ru', label: 'Rus', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
        { lang: 'en', label: 'Ingliz', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
      ],
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      featured: true,
      newRelease: true,
      views: 1200,
    },
    {
      title: 'Moonlight Romance',
      description: 'A sweeping romance set against city lights.',
      genre: ['Romance', 'Drama'],
      year: 2024,
      demoRating: 8,
      posterUrl: samplePoster,
      bannerUrl: sampleBanner,
      type: 'dorama',
      videoUrl: '',
      featured: true,
      newRelease: true,
      views: 800,
    },
    {
      title: 'Attack on Titans',
      description: 'Humanity fights for survival behind walls.',
      genre: ['Action', 'Dark Fantasy'],
      year: 2013,
      demoRating: 10,
      posterUrl: samplePoster,
      bannerUrl: sampleBanner,
      type: 'anime',
      videoUrl: '',
      featured: false,
      newRelease: true,
      views: 5000,
    },
  ];

  const uniqueGenreNames = [...new Set([...rawMovies.flatMap((m) => m.genre), ...DEFAULT_GENRE_NAMES])];
  await Genre.insertMany(uniqueGenreNames.map((name) => ({ name })));

  const movies = await Movie.insertMany(
    rawMovies.map(({ demoRating, ...m }) => ({
      ...m,
      rating: 0,
      ratingCount: 0,
    }))
  );

  for (let i = 0; i < rawMovies.length; i++) {
    const r = Math.min(10, Math.max(1, Math.round(rawMovies[i].demoRating)));
    await Review.create({
      movie: movies[i]._id,
      user: admin._id,
      rating: r,
    });
    await recalcMovieRating(movies[i]._id);
  }

  const anime = movies.find((m) => m.title === 'Attack on Titans');
  if (anime) {
    await Episode.insertMany([
      {
        movieId: anime._id,
        episodeNumber: 1,
        title: 'To You, in 2000 Years',
        videoUrl: 'https://www.youtube.com/embed/LI7ezinQk30',
      },
      {
        movieId: anime._id,
        episodeNumber: 2,
        title: 'That Day',
        videoUrl: 'https://www.youtube.com/embed/LI7ezinQk30',
      },
    ]);
  }

  console.log('Seed complete. Admin:', admin.email, '/ password:', adminPlain);
  console.log('Sample movies:', movies.length);
  await mongoose.disconnect();
}

seed().catch((e) => {
  logAtlasHelp(e);
  console.error(e);
  process.exit(1);
});
