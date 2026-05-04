const { createClient } = require('redis');

let client;

/**
 * Connects to Redis (uses `REDIS_URL`, default `redis://127.0.0.1:6379`).
 * Set `REDIS_ENABLED=false` to skip (e.g. local dev without Redis).
 */
const connectRedis = async () => {
  if (process.env.REDIS_ENABLED === 'false') {
    console.log('Redis disabled (REDIS_ENABLED=false)');
    return;
  }

  const url = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

  try {
    client = createClient({ url });
    client.on('error', (err) => {
      console.error('Redis client error:', err.message);
    });
    await client.connect();
    await client.ping();
    console.log('Redis connected');
  } catch (error) {
    console.error('Redis connection failed:', error);
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
