const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const signToken = (userId) => {
  const secret = process.env.JWT_SECRET;
  return jwt.sign({ sub: userId.toString() }, secret, { expiresIn: '7d' });
};

exports.register = async (req, res) => {
  
  try {
    const { name, email, age, password } = req.body;
    if (!password || String(password).length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    const existedUser = await User.findOne({ email });
    if (existedUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    const user = await User.create({ name, email, age, password, role: 'user' });
    const token = signToken(user._id);
    return res.status(201).json({ user, token });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};

exports.login = async (req, res) => {
  
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }
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
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};
