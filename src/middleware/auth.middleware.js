const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const config = require('../config');

/**
 * Requires `Authorization: Bearer <JWT>`. Sets `req.user` to the User document.
 */
exports.requireAuth = async (req, res, next) => {
  try {
    if (!config.jwtSecret) {
      return res.status(500).json({ message: 'JWT_SECRET is not configured' });
    }

    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const token = auth.slice(7);

    let payload;
    try {
      payload = jwt.verify(token, config.jwtSecret);
    } catch (err) {
      if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Invalid or expired token' });
      }
      throw err;
    }

    const userId = payload.sub;
    if (!userId) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    req.user = user;
    return next();
  } catch (err) {
    return next(err);
  }
};

/** Use after `requireAuth` on routes with `:id` user param (path must match logged-in user). */
exports.requireSameUserParam = (req, res, next) => {
  if (req.user._id.toString() !== req.params.id) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  next();
};

/** After `requireAuth`: same user as `:id`, or admin. */
exports.requireSameUserParamOrAdmin = (req, res, next) => {
  if (req.user.role === 'admin') {
    return next();
  }
  if (req.user._id.toString() === req.params.id) {
    return next();
  }
  return res.status(403).json({ message: 'Forbidden' });
};

/** After `requireAuth`: only `role: admin`. */
exports.requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};
