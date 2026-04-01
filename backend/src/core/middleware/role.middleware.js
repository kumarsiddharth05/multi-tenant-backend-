/**
 * Role-based access control middleware
 * Requires 'owner' role on req.user (set by auth middleware)
 */
const requireOwner = (req, res, next) => {
    if (!req.user || req.user.role !== 'owner') {
        return res.status(403).json({
            error: {
                message: 'Forbidden: owner role required',
                statusCode: 403,
            },
        });
    }
    next();
};

module.exports = { requireOwner };
