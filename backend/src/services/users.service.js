const bcrypt = require('bcrypt');
const db = require('../core/config/db');

const SALT_ROUNDS = 10;

/**
 * Create a new user for a tenant
 * @param {string} tenantId - UUID of the tenant
 * @param {string} email - User email (unique)
 * @param {string} password - Plain text password (will be hashed)
 * @returns {Promise<object>} Created user (without password_hash)
 */
const createUser = async (tenantId, email, password) => {
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const sql = `
    INSERT INTO users (tenant_id, email, password_hash)
    VALUES ($1, $2, $3)
    RETURNING id, tenant_id, email, role, created_at
  `;

    const result = await db.query(sql, [tenantId, email, passwordHash]);
    return result.rows[0];
};

module.exports = {
    createUser,
};
