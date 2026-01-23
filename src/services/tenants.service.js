const db = require('../config/db');

/**
 * Create a new tenant
 * @param {string} name - Tenant name (unique)
 * @param {string} type - Tenant type ('restaurant' or 'mechanic')
 * @param {object} config - Tenant configuration
 * @returns {Promise<object>} Created tenant
 */
const createTenant = async (name, type, config = {}) => {
    const sql = `
    INSERT INTO tenants (name, type, config)
    VALUES ($1, $2, $3)
    RETURNING id, name, type, config, created_at
  `;

    const result = await db.query(sql, [name, type, config]);
    return result.rows[0];
};

module.exports = {
    createTenant,
};
