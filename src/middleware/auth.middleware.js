const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

/**
 * Requires `Authorization: Bearer <JWT>`. Sets `req.user` to the User document.
 */
exports.requireAuth = async (req, res, next) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return res.status(500).json({ message: 'JWT_SECRET is not configured' });
  }

  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const token = auth.slice(7);

  try {
    const payload = jwt.verify(token, secret);
    const userId = payload.sub;
    if (!userId) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
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
