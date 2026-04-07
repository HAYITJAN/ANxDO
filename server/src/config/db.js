const mongoose = require('mongoose');
const mongoOptions = require('./mongoOptions');
const { getMongoUri, assertMongoUriReady } = require('./validateMongoUri');

/**
 * Connects to MongoDB using MONGODB_URI from environment.
 */
async function connectDB() {
  const uri = getMongoUri();
  if (!uri) {
    throw new Error('MONGODB_URI is not defined in environment');
  }
  assertMongoUriReady(uri);
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, mongoOptions);
  console.log('MongoDB connected');
}

module.exports = { connectDB };
