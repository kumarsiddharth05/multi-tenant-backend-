const express = require('express');
const usersController = require('../controllers/users.controller');

const router = express.Router();

/**
 * POST /users
 * Create a new user for a tenant
 */
router.post('/', usersController.createUser);

module.exports = router;
