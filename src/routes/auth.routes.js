const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { rateLimitAuth } = require('../middleware/rateLimit.middleware');
const { validateBody } = require('../middleware/validate.middleware');
const schemas = require('../validators/schemas');

const authLimiter = rateLimitAuth();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register (role always user)
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *           examples:
 *             sample:
 *               summary: Example signup
 *               value:
 *                 name: New User
 *                 email: newuser@example.com
 *                 age: 22
 *                 password: secret12
 *     responses:
 *       201:
 *         description: Created — copy `token` into Authorize
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Validation / duplicate email
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorMessage'
 *       429:
 *         description: Too many requests (Redis rate limit)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorMessage'
 */
router.post('/register', authLimiter, validateBody(schemas.registerBody), authController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login and receive JWT
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           examples:
 *             alice:
 *               summary: Seeded user (after npm run seed)
 *               value:
 *                 email: alice@example.com
 *                 password: secret12
 *             admin:
 *               summary: Seeded admin
 *               value:
 *                 email: admin@example.com
 *                 password: secret12
 *     responses:
 *       200:
 *         description: Copy `token` → Authorize (Bearer)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorMessage'
 *       429:
 *         description: Too many requests
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorMessage'
 */
router.post('/login', authLimiter, validateBody(schemas.loginBody), authController.login);

module.exports = router;
