const express = require('express');
const menuController = require('../controllers/menu.controller');
const authMiddleware = require('../core/middleware/auth.middleware');

const router = express.Router();

// All menu management routes require authentication
router.use(authMiddleware);

// GET /menu — List all menu items for tenant
router.get('/', menuController.listItems);

// POST /menu — Create a new menu item
router.post('/', menuController.createItem);

// PATCH /menu/:id — Update a menu item
router.patch('/:id', menuController.updateItem);

// PATCH /menu/:id/toggle — Toggle item availability
router.patch('/:id/toggle', menuController.toggleItem);

module.exports = router;
