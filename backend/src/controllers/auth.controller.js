const authService = require('../services/auth.service');

/**
 * POST /auth/login
 * Authenticate user and return JWT token
 */
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validate required fields
        if (!email || typeof email !== 'string' || email.trim() === '') {
            return res.status(400).json({
                error: {
                    message: 'Email is required',
                    statusCode: 400,
                },
            });
        }

        if (!password || typeof password !== 'string') {
            return res.status(400).json({
                error: {
                    message: 'Password is required',
                    statusCode: 400,
                },
            });
        }

        const result = await authService.login(email, password);

        return res.status(200).json(result);
    } catch (error) {
        // Handle authentication errors
        if (error.statusCode === 401) {
            return res.status(401).json({
                error: {
                    message: 'Invalid credentials',
                    statusCode: 401,
                },
            });
        }

        next(error);
    }
};

module.exports = {
    login,
};
