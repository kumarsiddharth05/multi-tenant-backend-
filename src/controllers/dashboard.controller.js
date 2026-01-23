const dashboardService = require('../services/dashboard.service');

/**
 * GET /dashboard
 * Fetch data based on tenant type
 */
const getDashboard = async (req, res, next) => {
    try {
        const { tenantId } = req.user;

        // 1. Detect Tenant Type
        const type = await dashboardService.getTenantType(tenantId);
        if (!type) {
            return res.status(404).json({ error: { message: 'Tenant not found', statusCode: 404 } });
        }

        // 2. Fetch Data based on Type
        let data = [];
        if (type === 'restaurant') {
            data = await dashboardService.getRestaurantOrders(tenantId);
        } else if (type === 'mechanic') {
            data = await dashboardService.getMechanicJobs(tenantId);
        }

        return res.status(200).json({
            type,
            count: data.length,
            data,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * PATCH /dashboard/:type/:id/complete
 * Mark service as completed
 */
const completeService = async (req, res, next) => {
    try {
        const { tenantId } = req.user;
        const { type, id } = req.params;

        let result;

        // Validate type and call appropriate service
        if (type === 'orders') {
            result = await dashboardService.completeRestaurantOrder(tenantId, id);
        } else if (type === 'jobs') {
            result = await dashboardService.completeMechanicJob(tenantId, id);
        } else {
            return res.status(400).json({
                error: { message: 'Invalid type. Use "orders" or "jobs".', statusCode: 400 }
            });
        }

        if (!result) {
            return res.status(404).json({
                error: { message: 'Record not found or access denied', statusCode: 404 }
            });
        }

        return res.status(200).json({ status: 'completed' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getDashboard,
    completeService,
};
