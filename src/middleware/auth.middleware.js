const jwt = require('jsonwebtoken');

/**
 * Authentication Middleware
 * Verifies JWT token and attaches user identity to request
 */
const authMiddleware = (req, res, next) => {
    try {
        // 1. Get token from header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                error: {
                    message: 'Authentication required. Please provide a valid token.',
                    statusCode: 401,
                },
            });
        }

        const token = authHeader.split(' ')[1];

        // 2. Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 3. Attach user identity to request
        req.user = {
            id: decoded.userId,
            role: decoded.role,
            tenantId: decoded.tenantId,
        };

        next();
    } catch (error) {
        return res.status(401).json({
            error: {
                message: 'Invalid or expired token',
                statusCode: 401,
            },
        });
    }
};

module.exports = authMiddleware;
