const mongoose = require('mongoose');
const User = require('../models/user.model');
const ROLES = User.ROLES;

function forbidden(res) {
  return res.status(403).json({ message: 'Forbidden' });
}

/**
 * POST /api/users — admin only. Creates a user (e.g. staff or customer with known role).
 */
exports.createUser = async (req, res) => {
  if (req.user.role !== 'admin') {
    return forbidden(res);
  }
  const { name, email, age, password, role } = req.body;
  if (!password || String(password).length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }
  const nextRole = role && ROLES.includes(role) ? role : 'user';
  try {
    const user = await User.create({ name, email, age, password, role: nextRole });
    return res.status(201).json(user);
  } catch (e) {
    if (e.code === 11000) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    return res.status(500).json({ message: e.message });
  }
};

/**
 * GET /api/users — admin only.
 */
exports.getUsers = async (req, res) => {
  if (req.user.role !== 'admin') {
    return forbidden(res);
  }
  const users = await User.find().sort({ createdAt: -1 });
  res.json(users);
};

/**
 * GET /api/users/:id — self or admin.
 */
exports.getUser = async (req, res) => {
  const isSelf = req.user._id.toString() === req.params.id;
  if (!isSelf && req.user.role !== 'admin') {
    return forbidden(res);
  }
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid user id' });
  }
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  res.json(user);
};

/**
 * PUT /api/users/:id — self (limited fields) or admin (full).
 * Non-admins cannot change `role` or another user's account.
 */
exports.updateUser = async (req, res) => {
  const isSelf = req.user._id.toString() === req.params.id;
  if (!isSelf && req.user.role !== 'admin') {
    return forbidden(res);
  }
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid user id' });
  }

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
};

/**
 * DELETE /api/users/:id — self or admin.
 */
exports.deleteUser = async (req, res) => {
  const isSelf = req.user._id.toString() === req.params.id;
  if (!isSelf && req.user.role !== 'admin') {
    return forbidden(res);
  }
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid user id' });
  }
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  res.json({ message: 'User deleted' });
};
