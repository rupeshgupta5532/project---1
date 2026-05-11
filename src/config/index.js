const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const parseIntEnv = (key, fallback) => {
  const n = parseInt(process.env[key] ?? String(fallback), 10);
  return Number.isFinite(n) ? n : fallback;
};

const config = {
  // nodeEnv: process.env.NODE_ENV || 'development',
  // isProduction: (process.env.NODE_ENV || 'development') === 'production',
  port: parseIntEnv('PORT', 8080),
  mongoUri: process.env.MONGO_URI || '',
  jwtSecret: process.env.JWT_SECRET || '',
  redis: {
    enabled: process.env.REDIS_ENABLED !== 'false',
    url: process.env.REDIS_URL || 'redis://127.0.0.1:6379'
  },
  ordersStatsCacheTtlSec: Math.max(1, parseIntEnv('ORDERS_STATS_CACHE_TTL_SEC', 60)),
  authRateLimit: {
    max: Math.max(1, parseIntEnv('AUTH_RATE_LIMIT_MAX', 40)),
    windowSec: Math.max(1, parseIntEnv('AUTH_RATE_LIMIT_WINDOW_SEC', 900))
  },
  logLevel: process.env.LOG_LEVEL || 'info'
};

module.exports = config;
