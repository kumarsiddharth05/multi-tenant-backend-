const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../core/config/db');

/**
 * Authenticate user and generate JWT token
 * @param {string} email - User email
 * @param {string} password - Plain text password
 * @returns {Promise<{token: string, user: object}>}
 * @throws {Error} If credentials are invalid
 */
const login = async (email, password) => {
    // Fetch user by email (include password_hash for comparison)
    const sql = `
    SELECT id, tenant_id, email, password_hash, role
    FROM users
    WHERE email = $1
  `;

    const result = await db.query(sql, [email.toLowerCase().trim()]);

    if (result.rows.length === 0) {
        const error = new Error('Invalid credentials');
        error.statusCode = 401;
        throw error;
    }

    const user = result.rows[0];

    // Compare password with hash
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
        const error = new Error('Invalid credentials');
        error.statusCode = 401;
        throw error;
    }

    // Generate JWT payload
    const payload = {
        userId: user.id,
        tenantId: user.tenant_id,
        role: user.role,
    };

    // Sign token
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });

    // Return token and user info (never return password_hash)
    return {
        token,
        user: {
            id: user.id,
            email: user.email,
            role: user.role,
            tenantId: user.tenant_id,
        },
    };
};

module.exports = {
    login,
};
