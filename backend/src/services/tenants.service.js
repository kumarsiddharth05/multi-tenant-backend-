const db = require('../core/config/db');

/**
 * Create a new tenant
 * @param {string} name - Tenant name (unique)
 * @param {string} type - Tenant type ('restaurant' or 'mechanic')
 * @param {object} config - Tenant configuration
 * @param {string} [tenantKey] - Tenant key (auto-generated from name if not provided)
 * @returns {Promise<object>} Created tenant
 */
const createTenant = async (name, type, config = {}, tenantKey) => {
    // Auto-generate tenant_key from name if not provided
    const key = tenantKey || name.toLowerCase().replace(/\s+/g, '-');

    const sql = `
    INSERT INTO tenants (name, type, config, tenant_key)
    VALUES ($1, $2, $3, $4)
    RETURNING id, name, type, config, tenant_key, created_at
  `;

    const result = await db.query(sql, [name, type, config, key]);
    return result.rows[0];
};

module.exports = {
    createTenant,
};
