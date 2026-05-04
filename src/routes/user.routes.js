const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const orderController = require('../controllers/order.controller');
const { requireAuth, requireSameUserParamOrAdmin } = require('../middleware/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management APIs
 */

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create user (admin only)
 *     tags: [Users]
 */
router.post('/', requireAuth, userController.createUser);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: List all users (admin only)
 *     tags: [Users]
 */
router.get('/', requireAuth, userController.getUsers);

/**
 * @swagger
 * /api/users/{id}/orders:
 *   get:
 *     summary: List orders for a user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User orders (newest first)
 */
router.get('/:id/orders', requireAuth, requireSameUserParamOrAdmin, orderController.getOrdersByUserId);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User found
 */
router.get('/:id', requireAuth, userController.getUser);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Updated user
 */
router.put('/:id', requireAuth, userController.updateUser);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete user
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: User deleted
 */
router.delete('/:id', requireAuth, userController.deleteUser);

module.exports = router;