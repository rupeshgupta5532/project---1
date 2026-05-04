const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

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
router.post('/register', authController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login and receive JWT
 *     tags: [Auth]
 */
router.post('/login', authController.login);

module.exports = router;
