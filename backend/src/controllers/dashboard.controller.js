const dashboardService = require('../services/dashboard.service');

const restaurantModule = require('../modules/restaurant/restaurant.controller');
const mechanicModule = require('../modules/mechanic/mechanic.controller');

const handlers = {
    restaurant: restaurantModule,
    mechanic: mechanicModule
};

/**
 * GET /dashboard
 * Fetch data based on tenant type
 */
const getDashboard = async (req, res, next) => {
    try {
        const { tenantId } = req.user;

        // 1. Detect Tenant Type
        const type = await dashboardService.getTenantType(tenantId);
        if (!type || !handlers[type]) {
            return res.status(404).json({ error: { message: 'Tenant type not found or unsupported', statusCode: 404 } });
        }

        // 2. Fetch Data based on Type via Module
        const data = await handlers[type].getAll(tenantId);

        return res.status(200).json({
            type,
            count: data.length,
            data,
        });
    } catch (error) {
        next(error);
    }
};

const VALID_ORDER_STATUSES = ['pending', 'preparing', 'ready', 'completed'];
const VALID_JOB_STATUSES = ['pending', 'completed'];

/**
 * PATCH /dashboard/:type/:id/status
 * Update order/job status
 */
const updateOrderStatus = async (req, res, next) => {
    try {
        const { tenantId } = req.user;
        const { type, id } = req.params;
        const { status } = req.body;

        const tenantType = await dashboardService.getTenantType(tenantId);
        if (!tenantType || !handlers[tenantType]) {
            return res.status(404).json({ error: { message: 'Tenant type not found or unsupported', statusCode: 404 } });
        }

        // Validate endpoint vs tenant type
        if (tenantType === 'restaurant' && type !== 'orders') {
            return res.status(400).json({ error: { message: 'Invalid type. Use "orders".', statusCode: 400 } });
        }
        if (tenantType === 'mechanic' && type !== 'jobs') {
            return res.status(400).json({ error: { message: 'Invalid type. Use "jobs".', statusCode: 400 } });
        }

        // Validate status value
        const validStatuses = tenantType === 'restaurant' ? VALID_ORDER_STATUSES : VALID_JOB_STATUSES;
        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({
                error: { message: `Status must be one of: ${validStatuses.join(', ')}`, statusCode: 400 }
            });
        }

        const result = await handlers[tenantType].updateStatus(tenantId, id, status);

        if (!result) {
            return res.status(404).json({
                error: { message: 'Record not found or access denied', statusCode: 404 }
            });
        }

        return res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

/**
 * GET /dashboard/reports
 * List available reports
 */
const listReports = async (req, res, next) => {
    try {
        const { tenantId } = req.user;

        // Resolve Tenant Key (for file cleanup/lookup)
        const tenantKey = await dashboardService.getTenantKey(tenantId);
        if (!tenantKey) {
            return res.status(404).json({ error: { message: 'Tenant key not found', statusCode: 404 } });
        }

        const reports = dashboardService.listReports(tenantKey);

        return res.status(200).json({ reports });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /dashboard/reports/:filename
 * Download a specific query
 */
const downloadReport = async (req, res, next) => {
    try {
        const { tenantId } = req.user;
        const { filename } = req.params;

        // Resolve Tenant Key
        const tenantKey = await dashboardService.getTenantKey(tenantId);
        if (!tenantKey) {
            return res.status(404).json({ error: { message: 'Tenant key not found', statusCode: 404 } });
        }

        // Get Safe Path
        const filePath = dashboardService.getReportPath(tenantKey, filename);

        if (!filePath) {
            return res.status(404).json({ error: { message: 'Report not found or access denied', statusCode: 404 } });
        }

        return res.download(filePath, filename);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getDashboard,
    updateOrderStatus,
    listReports,
    downloadReport
};
