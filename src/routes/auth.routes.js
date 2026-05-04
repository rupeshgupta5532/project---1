const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { rateLimitAuth } = require('../middleware/rateLimit.middleware');

const authLimiter = rateLimitAuth();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Register and login (JWT)
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register and receive JWT
 *     tags: [Auth]
 */
router.post('/register', authLimiter, authController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login and receive JWT
 *     tags: [Auth]
 */
router.post('/login', authLimiter, authController.login);

module.exports = router;
