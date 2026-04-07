const mongoose = require('mongoose');

const watchHistoryEntrySchema = new mongoose.Schema(
  {
    movieId: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
    episodeNumber: { type: Number, default: null },
    progress: { type: Number, default: 0 },
    updatedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }],
    watchHistory: [watchHistoryEntrySchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
