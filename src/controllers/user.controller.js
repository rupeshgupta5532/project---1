const User = require('../models/user.model');
const ROLES = User.ROLES;

/**
 * POST /api/users — admin only. Creates a user (e.g. staff or customer with known role).
 */
exports.createUser = async (req, res, next) => {
  try {
    const { name, email, age, password, role } = req.body;
    const nextRole = role && ROLES.includes(role) ? role : 'user';
    const existedUser = await User.findOne({ email });
    if (existedUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    const user = await User.create({ name, email, age, password, role: nextRole });
    return res.status(201).json(user);
  } catch (err) {
    return next(err);
  }
};

/**
 * GET /api/users — admin only.
 */
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/users/:id — self or admin.
 */
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/users/:id — self (limited fields) or admin (full).
 * Non-admins cannot change `role` or another user's account.
 */
exports.updateUser = async (req, res, next) => {
  try {
    const updates = { ...req.body };
    if (req.user.role !== 'admin') {
      delete updates.role;
    }

    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/users/:id — self or admin.
 */
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted' });
  } catch (err) {
    next(err);
  }
};
