const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const orderController = require('../controllers/order.controller');
const { requireAuth, requireSameUserParamOrAdmin, requireAdmin } = require('../middleware/auth.middleware');
const { validateBody, validateParams } = require('../middleware/validate.middleware');
const schemas = require('../validators/schemas');

router.use(requireAuth);
/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create user (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdminCreateUserRequest'
 *     responses:
 *       201:
 *         description: User created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request / duplicate email
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorMessage'
 *       401:
 *         description: Missing or invalid JWT
 *       403:
 *         description: Not admin
 */
router.post(
  '/',
  requireAdmin,
  validateBody(schemas.adminCreateUserBody),
  userController.createUser
);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: List all users (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not admin
 */
router.get('/',requireAdmin, userController.getUsers);

/**
 * @swagger
 * /api/users/{id}/orders:
 *   get:
 *     summary: Orders for this user (same user or admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 507f1f77bcf86cd799439011
 *         description: MongoDB ObjectId of the user
 *     responses:
 *       200:
 *         description: Newest first
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *       400:
 *         description: Invalid id
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Cannot view another user's orders
 */
router.get(
  '/:id/orders',
  validateParams(schemas.mongoIdParams),
  requireSameUserParamOrAdmin,
  orderController.getOrdersByUserId
);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by id (self or admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid id
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 */
router.get(
  '/:id',
  validateParams(schemas.mongoIdParams),
  requireSameUserParamOrAdmin,
  userController.getUser
);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update user (self or admin; only admin may change role)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 507f1f77bcf86cd799439011
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserRequest'
 *           examples:
 *             rename:
 *               value:
 *                 name: Alice Updated
 *                 age: 29
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 */
router.put(
  '/:id',
  validateParams(schemas.mongoIdParams),
  requireSameUserParamOrAdmin,
  validateBody(schemas.updateUserBody),
  userController.updateUser
);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete user (self or admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeleteMessage'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 */
router.delete(
  '/:id',
  validateParams(schemas.mongoIdParams),
  requireSameUserParamOrAdmin,
  userController.deleteUser
);

module.exports = router;
