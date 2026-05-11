const Joi = require('joi');
const User = require('../models/user.model');
const { ORDER_STATUSES } = require('../models/order.model');

const objectId = Joi.string().hex().length(24).required();

const registerBody = Joi.object({
  name: Joi.string().trim().min(1).max(200).required(),
  email: Joi.string().email().trim().lowercase().required(),
  age: Joi.number().integer().min(0).max(150).optional(),
  password: Joi.string().min(6).max(500).required()
});

const loginBody = Joi.object({
  email: Joi.string().email().trim().lowercase().required(),
  password: Joi.string().min(1).required()
});

const adminCreateUserBody = Joi.object({
  name: Joi.string().trim().min(1).max(200).required(),
  email: Joi.string().email().trim().lowercase().required(),
  age: Joi.number().integer().min(0).max(150).optional(),
  password: Joi.string().min(6).max(500).required(),
  role: Joi.string().valid(...User.ROLES).optional()
});

const updateUserBody = Joi.object({
  name: Joi.string().trim().min(1).max(200).optional(),
  email: Joi.string().email().trim().lowercase().optional(),
  age: Joi.number().integer().min(0).max(150).optional(),
  password: Joi.string().min(6).max(500).optional(),
  role: Joi.string().valid(...User.ROLES).optional()
})
  .min(1)
  .messages({ 'object.min': 'At least one field is required' });

const createOrderBody = Joi.object({
  amount: Joi.number().min(0).required(),
  status: Joi.string().valid(...ORDER_STATUSES).optional()
});

const updateOrderBody = Joi.object({
  amount: Joi.number().min(0).optional(),
  status: Joi.string().valid(...ORDER_STATUSES).optional()
})
  .min(1)
  .messages({ 'object.min': 'At least one field is required' });

const mongoIdParams = Joi.object({
  id: objectId
});

const topUsersQuery = Joi.object({
  limit: Joi.number().integer().min(1).max(100).default(10)
});

module.exports = {
  registerBody,
  loginBody,
  adminCreateUserBody,
  updateUserBody,
  createOrderBody,
  updateOrderBody,
  mongoIdParams,
  topUsersQuery
};
