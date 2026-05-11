const mongoose = require('mongoose');
const config = require('./index');
const logger = require('./logger');

const connectDB = async () => {
  if (!config.mongoUri) {
    logger.error('MONGO_URI is not set');
    process.exit(1);
  }
  try {
    await mongoose.connect(config.mongoUri);
    logger.info('MongoDB connected');
  } catch (error) {
    logger.error('MongoDB connection failed', { stack: error.stack });
    process.exit(1);
  }
};

module.exports = connectDB;
