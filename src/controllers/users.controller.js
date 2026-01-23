const usersService = require('../services/users.service');

/**
 * Simple email validation
 * @param {string} email
 * @returns {boolean}
 */
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Simple UUID validation
 * @param {string} uuid
 * @returns {boolean}
 */
const isValidUUID = (uuid) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
};

/**
 * POST /users
 * Create a new user for a tenant
 */
const createUser = async (req, res, next) => {
    try {
        const { tenantId, email, password } = req.body;

        // Validate tenantId
        if (!tenantId || !isValidUUID(tenantId)) {
            return res.status(400).json({
                error: {
                    message: 'tenantId is required and must be a valid UUID',
                    statusCode: 400,
                },
            });
        }

        // Validate email
        if (!email || !isValidEmail(email)) {
            return res.status(400).json({
                error: {
                    message: 'A valid email address is required',
                    statusCode: 400,
                },
            });
        }

        // Validate password
        if (!password || typeof password !== 'string' || password.length < 6) {
            return res.status(400).json({
                error: {
                    message: 'Password is required and must be at least 6 characters',
                    statusCode: 400,
                },
            });
        }

        const user = await usersService.createUser(tenantId, email.toLowerCase().trim(), password);

        return res.status(201).json(user);
    } catch (error) {
        // Handle duplicate email (PostgreSQL error code 23505)
        if (error.code === '23505') {
            return res.status(409).json({
                error: {
                    message: 'A user with this email already exists',
                    statusCode: 409,
                },
            });
        }

        // Handle foreign key violation (invalid tenant_id)
        if (error.code === '23503') {
            return res.status(400).json({
                error: {
                    message: 'The specified tenant does not exist',
                    statusCode: 400,
                },
            });
        }

        next(error);
    }
};

module.exports = {
    createUser,
};
