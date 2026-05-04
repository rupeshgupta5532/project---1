const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const ROLES = ['user', 'admin'];

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  age: Number,
  password: { type: String, select: false },
  role: {
    type: String,
    enum: ROLES,
    default: 'user'
  }
}, { timestamps: true });

userSchema.pre('save', async function hashPassword() {
  if (!this.isModified('password') || !this.password) {
    return;
  }
  this.password = await bcrypt.hash(this.password, 10);
});

const stripPassword = (_doc, ret) => {
  delete ret.password;
  return ret;
};

userSchema.set('toJSON', {
  transform: stripPassword
});
userSchema.set('toObject', {
  transform: stripPassword
});

module.exports = mongoose.model('User', userSchema);
module.exports.ROLES = ROLES;
