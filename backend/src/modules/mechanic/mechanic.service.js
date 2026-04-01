const db = require('../../core/config/db');

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

const updateMechanicJobStatus = async (tenantId, jobId, status) => {
    const sql = `
    UPDATE mechanic_jobs
    SET status = $3
    WHERE id = $2 AND tenant_id = $1
    RETURNING id, status
  `;
    const result = await db.query(sql, [tenantId, jobId, status]);
    return result.rows[0];
};

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
    getMechanicJobs,
    updateMechanicJobStatus,
    createMechanicJob,
};
