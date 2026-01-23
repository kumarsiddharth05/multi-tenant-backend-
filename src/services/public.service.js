const db = require('../config/db');

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
 * Create a restaurant order
 * @param {string} tenantId - Tenant UUID
 * @param {object} data - Order data
 * @returns {Promise<object>} Created order
 */
const createRestaurantOrder = async (tenantId, data) => {
    const { tableNumber, customerName, items } = data;
    const sql = `
    INSERT INTO restaurant_orders (tenant_id, table_number, customer_name, items)
    VALUES ($1, $2, $3, $4)
    RETURNING id, table_number, customer_name, items, status, created_at
  `;
    const result = await db.query(sql, [tenantId, tableNumber, customerName, JSON.stringify(items || [])]);
    return result.rows[0];
};

/**
 * Create a mechanic job
 * @param {string} tenantId - Tenant UUID
 * @param {object} data - Job data
 * @returns {Promise<object>} Created job
 */
const createMechanicJob = async (tenantId, data) => {
    const { customerName, customerPhone, vehicleDetails, problemDescription, location } = data;
    const sql = `
    INSERT INTO mechanic_jobs (tenant_id, customer_name, customer_phone, vehicle_details, problem_description, location)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id, customer_name, vehicle_details, status, created_at
  `;
    const result = await db.query(sql, [tenantId, customerName, customerPhone, vehicleDetails, problemDescription, JSON.stringify(location || {})]);
    return result.rows[0];
};

module.exports = {
    getTenantByKey,
    createRestaurantOrder,
    createMechanicJob,
};
