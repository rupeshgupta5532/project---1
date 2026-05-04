const mongoose = require('mongoose');
const Order = require('../models/order.model');

const isAdmin = (req) => req.user.role === 'admin';

// CREATE — `user` comes from JWT (`req.user`), not the body
exports.createOrder = async (req, res) => {
  const { amount, status } = req.body;
  if (amount == null || Number(amount) < 0) {
    return res.status(400).json({ message: 'Valid amount is required' });
  }
  const order = await Order.create({
    user: req.user._id,
    amount: Number(amount),
    ...(status != null ? { status } : {})
  });
  await order.populate('user', 'name email role');
  res.status(201).json(order);
};

// READ ALL — admin: all orders; user: own orders only
exports.getOrders = async (req, res) => {
  const filter = isAdmin(req) ? {} : { user: req.user._id };
  const orders = await Order.find(filter)
    .populate('user', 'name email role')
    .sort({ createdAt: -1 });
  res.json(orders);
};

// READ ONE — admin: any order; user: own only
exports.getOrder = async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email role');
  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }
  if (!isAdmin(req)) {
    const ownerId = order.user?._id ?? order.user;
    if (String(ownerId) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
  }
  res.json(order);
};

// ORDERS FOR A USER (route ensures same user or admin)
exports.getOrdersByUserId = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid user id' });
  }
  const orders = await Order.find({ user: req.params.id }).sort({ createdAt: -1 });
  res.json(orders);
};

// UPDATE — admin: any; user: own only
exports.updateOrder = async (req, res) => {
  const existing = await Order.findById(req.params.id);
  if (!existing) {
    return res.status(404).json({ message: 'Order not found' });
  }
  if (!isAdmin(req) && existing.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  const { user: _ignored, ...updates } = req.body;
  const order = await Order.findByIdAndUpdate(req.params.id, updates, { new: true })
    .populate('user', 'name email role');
  res.json(order);
};

// DELETE — admin: any; user: own only
exports.deleteOrder = async (req, res) => {
  const existing = await Order.findById(req.params.id);
  if (!existing) {
    return res.status(404).json({ message: 'Order not found' });
  }
  if (!isAdmin(req) && existing.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  await Order.findByIdAndDelete(req.params.id);
  res.json({ message: 'Order deleted' });
};

/**
 * Top users by number of orders (descending).
 */
exports.getTopUsersByOrderCount = async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 10, 100);
  const pipeline = [
    { $group: { _id: '$user', orderCount: { $sum: 1 } } },
    { $sort: { orderCount: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user'
      }
    },
    { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 0,
        userId: '$_id',
        orderCount: 1,
        name: '$user.name',
        email: '$user.email',
        role: '$user.role'
      }
    }
  ];
  const result = await Order.aggregate(pipeline);
  res.json(result);
};

/**
 * Total revenue: sum of amounts for orders that count as revenue (completed).
 */
exports.getTotalRevenue = async (req, res) => {
  const [row] = await Order.aggregate([
    { $match: { status: 'completed' } },
    { $group: { _id: null, totalRevenue: { $sum: '$amount' } } }
  ]);
  res.json({ totalRevenue: row ? row.totalRevenue : 0 });
};

/**
 * Order counts grouped by status.
 */
exports.getOrdersGroupedByStatus = async (req, res) => {
  const result = await Order.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
    { $project: { _id: 0, status: '$_id', count: 1 } }
  ]);
  res.json(result);
};

/**
 * Average order value across all orders.
 */
exports.getAverageOrderValue = async (req, res) => {
  const [row] = await Order.aggregate([
    { $group: { _id: null, averageOrderValue: { $avg: '$amount' } } }
  ]);
  const avg = row && row.averageOrderValue != null ? row.averageOrderValue : 0;
  res.json({ averageOrderValue: Math.round(avg * 100) / 100 });
};
