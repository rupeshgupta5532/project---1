const { getRedis } = require('../config/redis');
const config = require('../config');

/**
 * Redis-backed rate limit for auth routes. If Redis is disabled, requests pass through.
 */
function rateLimitAuth(options = {}) {
  const max = options.max ?? config.authRateLimit.max;
  const windowSec = options.windowSec ?? config.authRateLimit.windowSec;
  const prefix = options.prefix ?? 'ratelimit:auth';

  return async (req, res, next) => {
    const redis = getRedis();
    if (!redis) {
      return next();
    }

    const ip = req.ip || req.socket?.remoteAddress || 'unknown';
    const key = `${prefix}:${ip}`;

    try {
      const n = await redis.incr(key);
      if (n === 1) {
        await redis.expire(key, windowSec);
      }
      if (n > max) {
        return res.status(429).json({
          message: 'Too many attempts. Try again later.'
        });
      }
    } catch {
      return next();
    }

    next();
  };
}

module.exports = { rateLimitAuth };
