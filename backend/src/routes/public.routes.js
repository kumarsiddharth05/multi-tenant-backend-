const express = require('express');
const publicController = require('../controllers/public.controller');

const router = express.Router();

// Matches /public/:tenantKey/menu (public, no auth)
router.get('/:tenantKey/menu', publicController.getMenu);

// Matches /public/:tenantKey/orders
router.post('/:tenantKey/orders', publicController.submitRequest);

// Matches /public/:tenantKey/jobs
router.post('/:tenantKey/jobs', publicController.submitRequest);

module.exports = router;
