const menuService = require('../services/menu.service');

/**
 * POST /menu
 * Create a new menu item for the authenticated user's tenant
 */
const createItem = async (req, res, next) => {
    try {
        const { tenantId } = req.user;
        const { name, description, price, category } = req.body;

        // Validate required fields
        if (!name || typeof name !== 'string' || name.trim() === '') {
            return res.status(400).json({
                error: { message: 'Name is required and must be a non-empty string', statusCode: 400 },
            });
        }

        if (price == null || isNaN(price) || Number(price) < 0) {
            return res.status(400).json({
                error: { message: 'Price is required and must be a non-negative number', statusCode: 400 },
            });
        }

        const item = await menuService.createMenuItem(tenantId, {
            name: name.trim(),
            description,
            price: Number(price),
            category,
        });

        return res.status(201).json(item);
    } catch (error) {
        next(error);
    }
};

/**
 * GET /menu
 * List all menu items for the authenticated user's tenant
 */
const listItems = async (req, res, next) => {
    try {
        const { tenantId } = req.user;
        const items = await menuService.getMenuByTenantId(tenantId);

        return res.status(200).json({
            count: items.length,
            data: items,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * PATCH /menu/:id
 * Update a menu item
 */
const updateItem = async (req, res, next) => {
    try {
        const { tenantId } = req.user;
        const { id } = req.params;
        const { name, description, price, category } = req.body;

        // Validate price if provided
        if (price !== undefined && (isNaN(price) || Number(price) < 0)) {
            return res.status(400).json({
                error: { message: 'Price must be a non-negative number', statusCode: 400 },
            });
        }

        const item = await menuService.updateMenuItem(tenantId, id, {
            name: name?.trim(),
            description,
            price: price !== undefined ? Number(price) : undefined,
            category,
        });

        if (!item) {
            return res.status(404).json({
                error: { message: 'Menu item not found or access denied', statusCode: 404 },
            });
        }

        return res.status(200).json(item);
    } catch (error) {
        next(error);
    }
};

/**
 * PATCH /menu/:id/toggle
 * Toggle availability of a menu item
 */
const toggleItem = async (req, res, next) => {
    try {
        const { tenantId } = req.user;
        const { id } = req.params;

        const item = await menuService.toggleAvailability(tenantId, id);

        if (!item) {
            return res.status(404).json({
                error: { message: 'Menu item not found or access denied', statusCode: 404 },
            });
        }

        return res.status(200).json(item);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createItem,
    listItems,
    updateItem,
    toggleItem,
};
