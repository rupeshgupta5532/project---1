const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const config = require('../config');

const signToken = (userId) =>
  jwt.sign({ sub: userId.toString() }, config.jwtSecret, { expiresIn: '7d' });

exports.register = async (req, res, next) => {
  try {
    const { name, email, age, password } = req.body;
    const existedUser = await User.findOne({ email });
    if (existedUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    const user = await User.create({ name, email, age, password, role: 'user' });
    const token = signToken(user._id);
    return res.status(201).json({ user, token });
  } catch (err) {
    return next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !user.password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    user.password = undefined;
    const token = signToken(user._id);
    return res.json({ user, token });
  } catch (err) {
    return next(err);
  }
};
