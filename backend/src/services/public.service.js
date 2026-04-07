const db = require('../core/config/db');

/**
 * Get tenant ID by key
 * @param {string} key - Tenant key (unique)
 * @returns {Promise<object>} Tenant object (id, type)
 */
const getTenantByKey = async (key) => {
    const sql = 'SELECT id, type FROM tenants WHERE tenant_key = $1';
    const result = await db.query(sql, [key]);
    return result.rows[0];
};

/**
 * Get available menu items by tenant key (public-facing)
 * @param {string} tenantKey
 * @returns {Promise<Array>} Available menu items
 */
const getMenuByTenantKey = async (tenantKey) => {
    const sql = `
    SELECT mi.id, mi.name, mi.description, mi.price, mi.category, mi.is_veg
    FROM menu_items mi
    JOIN tenants t ON t.id = mi.tenant_id
    WHERE t.tenant_key = $1 AND mi.is_available = true
    ORDER BY mi.category, mi.name
  `;
    const result = await db.query(sql, [tenantKey]);
    return result.rows;
};

module.exports = {
    getTenantByKey,
    getMenuByTenantKey,
};
