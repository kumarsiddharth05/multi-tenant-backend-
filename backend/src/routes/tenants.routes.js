const express = require('express');
const tenantsController = require('../controllers/tenants.controller');
const authMiddleware = require('../core/middleware/auth.middleware');

const router = express.Router();

/**
 * POST /tenants
 * Create a new tenant (requires authentication)
 */
router.post('/', authMiddleware, tenantsController.createTenant);

module.exports = router;
