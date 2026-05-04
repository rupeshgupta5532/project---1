const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { requireAuth, requireAdmin } = require('../middleware/auth.middleware');

router.use(requireAuth);

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Orders and analytics APIs
 */

/**
 * @swagger
 * /api/orders/stats/top-users:
 *   get:
 *     summary: Top users by order count
 *     tags: [Orders]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Users ranked by number of orders
 */
router.get('/stats/top-users', requireAdmin, orderController.getTopUsersByOrderCount);

/**
 * @swagger
 * /api/orders/stats/total-revenue:
 *   get:
 *     summary: Total revenue (completed orders)
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: Sum of completed order amounts
 */
router.get('/stats/total-revenue', requireAdmin, orderController.getTotalRevenue);

/**
 * @swagger
 * /api/orders/stats/by-status:
 *   get:
 *     summary: Order counts grouped by status
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: Count per status
 */
router.get('/stats/by-status', requireAdmin, orderController.getOrdersGroupedByStatus);

/**
 * @swagger
 * /api/orders/stats/average-order-value:
 *   get:
 *     summary: Average order value
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: Mean amount across all orders
 */
router.get('/stats/average-order-value', requireAdmin, orderController.getAverageOrderValue);

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create order
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount]
 *             properties:
 *               amount:
 *                 type: number
 *               status:
 *                 type: string
 *                 enum: [pending, processing, completed, cancelled]
 */
router.post('/', orderController.createOrder);

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: List all orders
 *     tags: [Orders]
 */
router.get('/', orderController.getOrders);

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Get order by ID
 *     tags: [Orders]
 */
router.get('/:id', orderController.getOrder);

/**
 * @swagger
 * /api/orders/{id}:
 *   put:
 *     summary: Update order
 *     tags: [Orders]
 */
router.put('/:id', orderController.updateOrder);

/**
 * @swagger
 * /api/orders/{id}:
 *   delete:
 *     summary: Delete order
 *     tags: [Orders]
 */
router.delete('/:id', orderController.deleteOrder);

module.exports = router;
