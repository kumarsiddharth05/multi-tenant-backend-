const db = require('../config/db');

/**
 * Get tenant type by ID
 * @param {string} tenantId
 * @returns {Promise<string>} 'restaurant' or 'mechanic'
 */
const getTenantType = async (tenantId) => {
    const sql = 'SELECT type FROM tenants WHERE id = $1';
    const result = await db.query(sql, [tenantId]);
    return result.rows[0]?.type;
};

/**
 * Get all orders for a restaurant tenant
 * @param {string} tenantId
 * @returns {Promise<Array>} List of orders
 */
const getRestaurantOrders = async (tenantId) => {
    const sql = `
    SELECT id, table_number, customer_name, items, status, created_at
    FROM restaurant_orders
    WHERE tenant_id = $1
    ORDER BY created_at DESC
  `;
    const result = await db.query(sql, [tenantId]);
    return result.rows;
};

/**
 * Get all jobs for a mechanic tenant
 * @param {string} tenantId
 * @returns {Promise<Array>} List of jobs
 */
const getMechanicJobs = async (tenantId) => {
    const sql = `
    SELECT id, customer_name, customer_phone, vehicle_details, problem_description, location, status, created_at
    FROM mechanic_jobs
    WHERE tenant_id = $1
    ORDER BY created_at DESC
  `;
    const result = await db.query(sql, [tenantId]);
    return result.rows;
};

/**
 * Mark a restaurant order as completed
 * @param {string} tenantId
 * @param {string} orderId
 * @returns {Promise<object|null>} Updated order or null if not found
 */
const completeRestaurantOrder = async (tenantId, orderId) => {
    const sql = `
    UPDATE restaurant_orders
    SET status = 'completed'
    WHERE id = $2 AND tenant_id = $1
    RETURNING id, status
  `;
    const result = await db.query(sql, [tenantId, orderId]);
    return result.rows[0];
};

/**
 * Mark a mechanic job as completed
 * @param {string} tenantId
 * @param {string} jobId
 * @returns {Promise<object|null>} Updated job or null if not found
 */
const completeMechanicJob = async (tenantId, jobId) => {
    const sql = `
    UPDATE mechanic_jobs
    SET status = 'completed'
    WHERE id = $2 AND tenant_id = $1
    RETURNING id, status
  `;
    const result = await db.query(sql, [tenantId, jobId]);
    return result.rows[0];
};

module.exports = {
    getTenantType,
    getRestaurantOrders,
    getMechanicJobs,
    completeRestaurantOrder,
    completeMechanicJob,
};
