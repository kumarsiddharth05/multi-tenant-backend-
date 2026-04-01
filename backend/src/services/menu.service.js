const db = require('../core/config/db');

/**
 * Create a new menu item for a tenant
 * @param {string} tenantId
 * @param {object} data - { name, description, price, category }
 * @returns {Promise<object>} Created menu item
 */
const createMenuItem = async (tenantId, data) => {
    const { name, description, price, category } = data;
    const sql = `
    INSERT INTO menu_items (tenant_id, name, description, price, category)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, tenant_id, name, description, price, category, is_available, created_at
  `;
    const result = await db.query(sql, [tenantId, name, description || null, price, category || null]);
    return result.rows[0];
};

/**
 * Get all menu items for a tenant by tenant ID
 * @param {string} tenantId
 * @returns {Promise<Array>} Menu items
 */
const getMenuByTenantId = async (tenantId) => {
    const sql = `
    SELECT id, name, description, price, category, is_available, created_at
    FROM menu_items
    WHERE tenant_id = $1
    ORDER BY category, name
  `;
    const result = await db.query(sql, [tenantId]);
    return result.rows;
};

/**
 * Get available menu items for a tenant by tenant key (public-facing)
 * @param {string} tenantKey
 * @returns {Promise<Array>} Available menu items
 */
const getMenuByTenantKey = async (tenantKey) => {
    const sql = `
    SELECT mi.id, mi.name, mi.description, mi.price, mi.category
    FROM menu_items mi
    JOIN tenants t ON t.id = mi.tenant_id
    WHERE t.tenant_key = $1 AND mi.is_available = true
    ORDER BY mi.category, mi.name
  `;
    const result = await db.query(sql, [tenantKey]);
    return result.rows;
};

/**
 * Update a menu item (name, description, price, category)
 * @param {string} tenantId
 * @param {string} itemId
 * @param {object} data - Fields to update
 * @returns {Promise<object|null>} Updated menu item or null
 */
const updateMenuItem = async (tenantId, itemId, data) => {
    const { name, description, price, category } = data;
    const sql = `
    UPDATE menu_items
    SET name = COALESCE($3, name),
        description = COALESCE($4, description),
        price = COALESCE($5, price),
        category = COALESCE($6, category)
    WHERE id = $2 AND tenant_id = $1
    RETURNING id, tenant_id, name, description, price, category, is_available, created_at
  `;
    const result = await db.query(sql, [tenantId, itemId, name, description, price, category]);
    return result.rows[0] || null;
};

/**
 * Toggle availability of a menu item
 * @param {string} tenantId
 * @param {string} itemId
 * @returns {Promise<object|null>} Updated menu item or null
 */
const toggleAvailability = async (tenantId, itemId) => {
    const sql = `
    UPDATE menu_items
    SET is_available = NOT is_available
    WHERE id = $2 AND tenant_id = $1
    RETURNING id, name, is_available
  `;
    const result = await db.query(sql, [tenantId, itemId]);
    return result.rows[0] || null;
};

/**
 * Look up menu items by IDs for a specific tenant
 * @param {string} tenantId
 * @param {Array<string>} itemIds
 * @returns {Promise<Array>} Found menu items
 */
const getItemsByIds = async (tenantId, itemIds) => {
    const sql = `
    SELECT id, name, price, is_available
    FROM menu_items
    WHERE tenant_id = $1 AND id = ANY($2)
  `;
    const result = await db.query(sql, [tenantId, itemIds]);
    return result.rows;
};

module.exports = {
    createMenuItem,
    getMenuByTenantId,
    getMenuByTenantKey,
    updateMenuItem,
    toggleAvailability,
    getItemsByIds,
};
