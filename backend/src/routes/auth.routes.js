const express = require('express');
const authController = require('../controllers/auth.controller');

const router = express.Router();

/**
 * POST /auth/login
 * Authenticate user and return JWT token
 */
router.post('/login', authController.login);

module.exports = router;
