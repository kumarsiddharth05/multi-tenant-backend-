const tenantsService = require('../services/tenants.service');

const VALID_TYPES = ['restaurant', 'mechanic'];

/**
 * POST /tenants
 * Create a new tenant
 */
const createTenant = async (req, res, next) => {
    try {
        const { name, type, config } = req.body;

        // Validate required fields
        if (!name || typeof name !== 'string' || name.trim() === '') {
            return res.status(400).json({
                error: {
                    message: 'Name is required and must be a non-empty string',
                    statusCode: 400,
                },
            });
        }

        if (!type || !VALID_TYPES.includes(type)) {
            return res.status(400).json({
                error: {
                    message: `Type must be one of: ${VALID_TYPES.join(', ')}`,
                    statusCode: 400,
                },
            });
        }

        const tenant = await tenantsService.createTenant(name.trim(), type, config || {});

        return res.status(201).json(tenant);
    } catch (error) {
        // Handle duplicate name (PostgreSQL error code 23505)
        if (error.code === '23505') {
            return res.status(409).json({
                error: {
                    message: 'A tenant with this name already exists',
                    statusCode: 409,
                },
            });
        }

        next(error);
    }
};

module.exports = {
    createTenant,
};
