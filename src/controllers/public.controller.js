const publicService = require('../services/public.service');

/**
 * Handle public request wrapper
 * Resolves tenant, validates type, calls appropriate creator
 */
const submitRequest = async (req, res, next) => {
    try {
        const { tenantName } = req.params;

        // 1. Resolve Tenant
        const tenant = await publicService.getTenantByName(tenantName);

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

        // 3. Process Request
        let result;
        if (isOrder) {
            // Validate Order Body
            const { tableNumber, customerName, items } = req.body;
            if (!tableNumber || !customerName) {
                return res.status(400).json({ error: { message: 'Missing required fields: tableNumber, customerName', statusCode: 400 } });
            }
            result = await publicService.createRestaurantOrder(tenant.id, req.body);
        } else if (isJob) {
            // Validate Job Body
            const { customerName, customerPhone, vehicleDetails } = req.body;
            if (!customerName || !customerPhone || !vehicleDetails) {
                return res.status(400).json({ error: { message: 'Missing required fields: customerName, customerPhone, vehicleDetails', statusCode: 400 } });
            }
            result = await publicService.createMechanicJob(tenant.id, req.body);
        } else {
            return res.status(404).json({ error: { message: 'Unknown endpoint', statusCode: 404 } });
        }

        return res.status(201).json(result);

    } catch (error) {
        next(error);
    }
};

module.exports = {
    submitRequest,
};
