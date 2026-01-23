const express = require('express');
const tenantsController = require('../controllers/tenants.controller');

const router = express.Router();

/**
 * POST /tenants
 * Create a new tenant
 */
router.post('/', tenantsController.createTenant);

module.exports = router;
