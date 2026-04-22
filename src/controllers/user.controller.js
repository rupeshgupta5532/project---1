const User = require('../models/user.model');

// CREATE
exports.createUser = async (req, res) => {
  const user = await User.create(req.body);
  res.status(201).json(user);
};

// READ ALL
exports.getUsers = async (req, res) => {
  const users = await User.find();
  res.json(users);
};

// READ ONE
exports.getUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  res.json(user);
};

// UPDATE
exports.updateUser = async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(user);
};

// DELETE
exports.deleteUser = async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: "User deleted" });
};