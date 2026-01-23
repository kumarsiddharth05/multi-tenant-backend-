const express = require('express');
const publicController = require('../controllers/public.controller');

const router = express.Router();

// Matches /public/:tenantName/orders
router.post('/:tenantName/orders', publicController.submitRequest);

// Matches /public/:tenantName/jobs
router.post('/:tenantName/jobs', publicController.submitRequest);

module.exports = router;
