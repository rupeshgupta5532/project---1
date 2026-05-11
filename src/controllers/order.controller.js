const Order = require('../models/order.model');
const logger = require('../config/logger');
const {
  STATS_PREFIX,
  statsCacheTtlSec,
  cacheGetJson,
  cacheSetJson,
  invalidateOrdersStatsCache
} = require('../services/redis.service');

const isAdmin = (req) => req.user.role === 'admin';

// CREATE — `user` comes from JWT (`req.user`), not the body
exports.createOrder = async (req, res, next) => {
  try {
    const { amount, status } = req.body;
    const order = await Order.create({
      user: req.user._id,
      amount: Number(amount),
      ...(status != null ? { status } : {})
    });
    await order.populate('user', 'name email role');
    await invalidateOrdersStatsCache();
    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
};

// READ ALL — admin: all orders; user: own orders only
exports.getOrders = async (req, res, next) => {
  try {
    const filter = isAdmin(req) ? {} : { user: req.user._id };
    const orders = await Order.find(filter)
      .populate('user', 'name email role')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    next(err);
  }
};

// READ ONE — admin: any order; user: own only
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email role');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    const ownerId = order.user && order.user._id ? order.user._id.toString() : String(order.user);
    if (!isAdmin(req) && ownerId !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    res.json(order);
  } catch (err) {
    next(err);
  }
};

// ORDERS FOR A USER (route ensures same user or admin)
exports.getOrdersByUserId = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.params.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    next(err);
  }
};

// UPDATE — admin: any; user: own only
exports.updateOrder = async (req, res, next) => {
  try {
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
    await invalidateOrdersStatsCache();
    res.json(order);
  } catch (err) {
    next(err);
  }
};

// DELETE — admin: any; user: own only
exports.deleteOrder = async (req, res, next) => {
  try {
    const existing = await Order.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: 'Order not found' });
    }
    if (!isAdmin(req) && existing.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await Order.findByIdAndDelete(req.params.id);
    await invalidateOrdersStatsCache();
    res.json({ message: 'Order deleted' });
  } catch (err) {
    next(err);
  }
};

/**
 * Top users by number of orders (descending).
 */
exports.getTopUsersByOrderCount = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit);
    if (isNaN(limit)) {
      return res.status(400).json({ message: 'Invalid limit' });
    }
    const cacheKey = `${STATS_PREFIX}top-users:${limit}`;
    const cached = await cacheGetJson(cacheKey);
    if (cached != null) {
      logger.info('orders stats cache hit', { key: cacheKey });
      return res.json(cached);
    }
    logger.info('orders stats cache miss', { key: cacheKey });

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
    await cacheSetJson(cacheKey, result, statsCacheTtlSec());
    res.json(result);
  } catch (err) {
    next(err);
  }
};

/**
 * Total revenue: sum of amounts for orders that count as revenue (completed).
 */
exports.getTotalRevenue = async (req, res, next) => {
  try {
    const cacheKey = `${STATS_PREFIX}revenue`;
    const cached = await cacheGetJson(cacheKey);
    if (cached != null) {
      return res.json(cached);
    }

    const [row] = await Order.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, totalRevenue: { $sum: '$amount' } } }
    ]);
    const payload = { totalRevenue: row ? row.totalRevenue : 0 };
    await cacheSetJson(cacheKey, payload, statsCacheTtlSec());
    res.json(payload);
  } catch (err) {
    next(err);
  }
};

/**
 * Order counts grouped by status.
 */
exports.getOrdersGroupedByStatus = async (req, res, next) => {
  try {
    const cacheKey = `${STATS_PREFIX}by-status`;
    const cached = await cacheGetJson(cacheKey);
    if (cached != null) {
      return res.json(cached);
    }

    const result = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, status: '$_id', count: 1 } }
    ]);
    await cacheSetJson(cacheKey, result, statsCacheTtlSec());
    res.json(result);
  } catch (err) {
    next(err);
  }
};

/**
 * Average order value across all orders.
 */
exports.getAverageOrderValue = async (req, res, next) => {
  try {
    const cacheKey = `${STATS_PREFIX}aov`;
    const cached = await cacheGetJson(cacheKey);
    if (cached != null) {
      return res.json(cached);
    }

    const [row] = await Order.aggregate([
      { $group: { _id: null, averageOrderValue: { $avg: '$amount' } } }
    ]);
    const avg = row && row.averageOrderValue != null ? row.averageOrderValue : 0;
    const payload = { averageOrderValue: Math.round(avg * 100) / 100 };
    await cacheSetJson(cacheKey, payload, statsCacheTtlSec());
    res.json(payload);
  } catch (err) {
    next(err);
  }
};
