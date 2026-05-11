const { getRedis } = require('../config/redis');
const config = require('../config');

const STATS_PREFIX = 'cache:orders:stats:';

function statsCacheTtlSec() {
  return config.ordersStatsCacheTtlSec;
}

async function cacheGetJson(key) {
  const redis = getRedis();
  if (!redis) return null;
  try {
    const raw = await redis.get(key);
    if (raw == null) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function cacheSetJson(key, value, ttlSec) {
  const redis = getRedis();
  if (!redis) return;
  try {
    await redis.set(key, JSON.stringify(value), { EX: ttlSec });
  } catch {
    // ignore cache write errors
  }
}

/** Clears all order analytics cache entries (call after order create/update/delete). */
async function invalidateOrdersStatsCache() {
  const redis = getRedis();
  if (!redis) return;
  try {
    for await (const key of redis.scanIterator({ MATCH: `${STATS_PREFIX}*`, COUNT: 100 })) {
      await redis.del(key);
    }
  } catch {
    // ignore
  }
}

module.exports = {
  STATS_PREFIX,
  statsCacheTtlSec,
  cacheGetJson,
  cacheSetJson,
  invalidateOrdersStatsCache
};
