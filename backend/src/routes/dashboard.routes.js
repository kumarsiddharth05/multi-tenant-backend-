const express = require('express');
const dashboardController = require('../controllers/dashboard.controller');
const authMiddleware = require('../core/middleware/auth.middleware');
const { requireOwner } = require('../core/middleware/role.middleware');

const router = express.Router();

// Apply Auth Middleware globally to all dashboard routes
router.use(authMiddleware);

// GET /dashboard - Fetch main data
router.get('/', dashboardController.getDashboard);

// Reports Routes
router.get('/reports', dashboardController.listReports);
router.get('/reports/:filename', dashboardController.downloadReport);

// PATCH /dashboard/:type/:id/status - Update status (owner only)
router.patch('/:type/:id/status', requireOwner, dashboardController.updateOrderStatus);

module.exports = router;
