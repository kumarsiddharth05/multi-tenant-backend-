const db = require('../config/db');
const fs = require('fs');
const path = require('path');

const REPORTS_DIR = path.join(__dirname, '../../reports');

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
 * Get tenant Key by ID
 * @param {string} tenantId
 * @returns {Promise<string>} tenant_key
 */
const getTenantKey = async (tenantId) => {
    const sql = 'SELECT tenant_key FROM tenants WHERE id = $1';
    const result = await db.query(sql, [tenantId]);
    return result.rows[0]?.tenant_key;
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

/**
 * List available reports for a tenant
 * @param {string} tenantKey 
 * @returns {Array} List of report objects
 */
const listReports = (tenantKey) => {
    if (!fs.existsSync(REPORTS_DIR)) return [];

    const files = fs.readdirSync(REPORTS_DIR);
    const prefix = `Report_${tenantKey}_`;

    return files
        .filter(file => file.startsWith(prefix) && file.endsWith('.pdf'))
        .map(file => {
            const stats = fs.statSync(path.join(REPORTS_DIR, file));
            const timestampPart = file.replace(prefix, '').replace('.pdf', '');
            return {
                filename: file,
                generatedAt: new Date(parseInt(timestampPart)).toISOString(),
                sizeBytes: stats.size
            };
        })
        .sort((a, b) => new Date(b.generatedAt) - new Date(a.generatedAt));
};

/**
 * Get absolute path to a specific report (Security validated)
 * @param {string} tenantKey 
 * @param {string} filename 
 * @returns {string|null} Absolute path or null if invalid
 */
const getReportPath = (tenantKey, filename) => {
    // 1. Validate Filename format (Strict Prefix Check)
    const prefix = `Report_${tenantKey}_`;
    if (!filename.startsWith(prefix) || !filename.endsWith('.pdf')) {
        return null;
    }

    // 2. Prevent Path Traversal
    const safePath = path.join(REPORTS_DIR, filename);
    if (!safePath.startsWith(REPORTS_DIR)) {
        return null; // Path traversal attempt
    }

    // 3. Check Existence
    if (!fs.existsSync(safePath)) {
        return null;
    }

    return safePath;
};

module.exports = {
    getTenantType,
    getTenantKey,
    getRestaurantOrders,
    getMechanicJobs,
    completeRestaurantOrder,
    completeMechanicJob,
    listReports,
    getReportPath
};
