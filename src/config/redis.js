const { createClient } = require('redis');
const config = require('./index');
const logger = require('./logger');

let client;

/**
 * Connects to Redis. Set `REDIS_ENABLED=false` to skip (e.g. local dev without Redis).
 */
const connectRedis = async () => {
  if (!config.redis.enabled) {
    logger.info('Redis disabled (REDIS_ENABLED=false)');
    return;
  }

  const url = config.redis.url;

  try {
    client = createClient({ url });
    client.on('error', (err) => {
      logger.error(`Redis client error: ${err.message}`);
    });
    await client.connect();
    await client.ping();
    logger.info('Redis connected');
  } catch (error) {
    logger.error('Redis connection failed', { stack: error.stack });
    process.exit(1);
  }
};

const getRedis = () => client;

const disconnectRedis = async () => {
  if (client) {
    try {
      await client.quit();
    } catch {
      // already closed
    }
  }
};

module.exports = { connectRedis, getRedis, disconnectRedis };
