const publicService = require('../services/public.service');
const menuService = require('../services/menu.service');
const socket = require('../socket');

const restaurantModule = require('../modules/restaurant/restaurant.controller');
const mechanicModule = require('../modules/mechanic/mechanic.controller');

const handlers = {
    restaurant: restaurantModule,
    mechanic: mechanicModule
};

/**
 * GET /public/:tenantKey/menu
 * Return only available menu items for the tenant (no auth required)
 */
const getMenu = async (req, res, next) => {
    try {
        const { tenantKey } = req.params;

        const tenant = await publicService.getTenantByKey(tenantKey);
        if (!tenant) {
            return res.status(404).json({
                error: { message: 'Tenant not found', statusCode: 404 }
            });
        }

        if (tenant.type !== 'restaurant') {
            return res.status(400).json({
                error: { message: 'Menu is only available for restaurant tenants', statusCode: 400 }
            });
        }

        const items = await publicService.getMenuByTenantKey(tenantKey);

        return res.status(200).json({
            tenant: tenantKey,
            count: items.length,
            data: items,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Handle public request wrapper
 * Resolves tenant by key, validates type, calls appropriate creator
 */
const submitRequest = async (req, res, next) => {
    try {
        const { tenantKey } = req.params;

        // 1. Resolve Tenant
        const tenant = await publicService.getTenantByKey(tenantKey);

        if (!tenant) {
            return res.status(404).json({
                error: { message: 'Tenant not found', statusCode: 404 }
            });
        }

        const path = req.path; // /orders or /jobs
        const isOrder = path.includes('/orders');
        const isJob = path.includes('/jobs');

        // 2. Validate Tenant Type vs Endpoint
        if (isOrder && tenant.type !== 'restaurant') {
            return res.status(400).json({ error: { message: 'This tenant is not a restaurant', statusCode: 400 } });
        }
        if (isJob && tenant.type !== 'mechanic') {
            return res.status(400).json({ error: { message: 'This tenant is not a mechanic', statusCode: 400 } });
        }

        // 3. For restaurant orders, validate items against menu_items
        if (isOrder && tenant.type === 'restaurant') {
            const { items } = req.body;

            if (!items || !Array.isArray(items) || items.length === 0) {
                return res.status(400).json({
                    error: { message: 'Order must include a non-empty items array', statusCode: 400 }
                });
            }

            // Validate that each item has an id
            const missingIds = items.filter(item => !item.id);
            if (missingIds.length > 0) {
                return res.status(400).json({
                    error: { message: 'Each item in the order must have an id field', statusCode: 400 }
                });
            }

            // Look up items in menu_items for this tenant
            const itemIds = items.map(item => item.id);
            const menuItems = await menuService.getItemsByIds(tenant.id, itemIds);

            // Build a map for quick lookup
            const menuMap = new Map(menuItems.map(mi => [mi.id, mi]));

            // Validate all items exist and are available
            const invalidItems = [];
            const unavailableItems = [];
            for (const item of items) {
                const menuItem = menuMap.get(item.id);
                if (!menuItem) {
                    invalidItems.push(item.id);
                } else if (!menuItem.is_available) {
                    unavailableItems.push(menuItem.name);
                }
            }

            if (invalidItems.length > 0) {
                return res.status(400).json({
                    error: {
                        message: `Menu items not found: ${invalidItems.join(', ')}`,
                        statusCode: 400
                    }
                });
            }

            if (unavailableItems.length > 0) {
                return res.status(400).json({
                    error: {
                        message: `Menu items currently unavailable: ${unavailableItems.join(', ')}`,
                        statusCode: 400
                    }
                });
            }

            // Replace request body items with server-side name and price (price lock)
            req.body.items = items.map(item => {
                const menuItem = menuMap.get(item.id);
                return {
                    id: menuItem.id,
                    name: menuItem.name,
                    price: menuItem.price,
                    quantity: item.quantity || 1,
                };
            });
            
            // Normalize frontend payload
            req.body.tableNumber = req.body.table_number || req.body.tableNumber;
        }

        const handler = handlers[tenant.type];
        if (!handler) {
            return res.status(400).json({ error: { message: 'Unsupported tenant type', statusCode: 400 } });
        }

        // 4. Process Request via Module
        const result = await handler.create(tenant.id, req.body);
        
        // Emit event to connected kitchen screens / clients in tenant's room
        if (isOrder) {
            try {
                const io = socket.getIo();
                io.to(tenantKey).emit('new_order', result);
            } catch (err) {
                console.error('Socket emit error for new_order:', err);
            }
        }
        
        return res.status(201).json(result);

    } catch (error) {
        next(error);
    }
};

module.exports = {
    getMenu,
    submitRequest,
};
