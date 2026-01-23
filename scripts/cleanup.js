/* eslint-disable */
require('dotenv').config();
const { pool } = require('../src/config/db');

async function cleanup() {
    try {
        console.log('--- Starting Data Cleanup ---');
        console.log('Retention Policy: 30 Days');

        // Delete old orders
        const ordersRes = await pool.query(`
      DELETE FROM restaurant_orders 
      WHERE created_at < NOW() - INTERVAL '30 days'
      RETURNING id
    `);
        console.log(`Deleted ${ordersRes.rowCount} old restaurant orders.`);

        // Delete old jobs
        const jobsRes = await pool.query(`
      DELETE FROM mechanic_jobs 
      WHERE created_at < NOW() - INTERVAL '30 days'
      RETURNING id
    `);
        console.log(`Deleted ${jobsRes.rowCount} old mechanic jobs.`);

        console.log('--- Cleanup Complete ---');
    } catch (err) {
        console.error('Cleanup Error:', err);
        process.exit(1);
    } finally {
        pool.end();
    }
}

cleanup();
