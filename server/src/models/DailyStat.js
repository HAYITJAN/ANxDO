const mongoose = require('mongoose');

const dailyStatSchema = new mongoose.Schema(
  {
    /** YYYY-MM-DD (UTC) */
    day: { type: String, required: true, unique: true, index: true },
    apiRequests: { type: Number, default: 0 },
    pageViews: { type: Number, default: 0 },
    /** Reklama ko‘rinishlari */
    adImpressions: { type: Number, default: 0 },
    /** Reklama bosishlari */
    adClicks: { type: Number, default: 0 },
  },
  { timestamps: false }
);

dailyStatSchema.statics.todayKey = function todayKey() {
  return new Date().toISOString().slice(0, 10);
};

dailyStatSchema.statics.bumpApi = async function bumpApi() {
  const day = this.todayKey();
  await this.updateOne({ day }, { $inc: { apiRequests: 1 } }, { upsert: true });
};

dailyStatSchema.statics.bumpPageView = async function bumpPageView() {
  const day = this.todayKey();
  await this.updateOne({ day }, { $inc: { pageViews: 1 } }, { upsert: true });
};

dailyStatSchema.statics.bumpAd = async function bumpAd(kind) {
  const day = this.todayKey();
  const field = kind === 'click' ? 'adClicks' : 'adImpressions';
  await this.updateOne({ day }, { $inc: { [field]: 1 } }, { upsert: true });
};

module.exports = mongoose.model('DailyStat', dailyStatSchema);
