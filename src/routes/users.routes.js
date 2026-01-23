const express = require('express');
const usersController = require('../controllers/users.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

/**
 * POST /users
 * Create a new user for a tenant
 * Protected: Requires valid JWT
 */
router.post('/', authMiddleware, usersController.createUser);

module.exports = router;
