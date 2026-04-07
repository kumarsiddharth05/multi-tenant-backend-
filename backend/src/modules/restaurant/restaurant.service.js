const db = require('../../core/config/db');

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

const updateRestaurantOrderStatus = async (tenantId, orderId, status) => {
    const sql = `
    UPDATE restaurant_orders
    SET status = $3
    WHERE id = $2 AND tenant_id = $1
    RETURNING id, status
  `;
    const result = await db.query(sql, [tenantId, orderId, status]);
    return result.rows[0];
};

const createRestaurantOrder = async (tenantId, data) => {
    const { tableNumber, items } = data;
    const sql = `
    INSERT INTO restaurant_orders (tenant_id, table_number, customer_name, items)
    VALUES ($1, $2, $3, $4)
    RETURNING id, table_number, customer_name, items, status, created_at
  `;
    const result = await db.query(sql, [tenantId, tableNumber, 'Anonymous', JSON.stringify(items || [])]);
    return result.rows[0];
};

module.exports = {
    getRestaurantOrders,
    updateRestaurantOrderStatus,
    createRestaurantOrder,
};
