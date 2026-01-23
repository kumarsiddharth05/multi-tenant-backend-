const express = require('express');
const dashboardController = require('../controllers/dashboard.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

// Apply Auth Middleware globally to all dashboard routes
router.use(authMiddleware);

// GET /dashboard - Fetch main data
router.get('/', dashboardController.getDashboard);

// PATCH /dashboard/:type/:id/complete - Mark completed
router.patch('/:type/:id/complete', dashboardController.completeService);

module.exports = router;
