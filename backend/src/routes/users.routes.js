const express = require('express');
const usersController = require('../controllers/users.controller');
const authMiddleware = require('../core/middleware/auth.middleware');
const { requireOwner } = require('../core/middleware/role.middleware');

const router = express.Router();

/**
 * POST /users
 * Create a new user for a tenant
 * Protected: Requires valid JWT + owner role
 */
router.post('/', authMiddleware, requireOwner, usersController.createUser);

module.exports = router;
