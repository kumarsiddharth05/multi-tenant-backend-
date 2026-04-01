/* eslint-disable */
require('dotenv').config();
const { pool } = require('../../backend/src/core/config/db');

// Check for --dry-run flag
const isDryRun = process.argv.includes('--dry-run');

async function cleanup() {
    const client = await pool.connect();
    try {
        console.log(`--- Starting Data Cleanup ${isDryRun ? '(DRY RUN)' : ''} ---`);
        console.log(`Timestamp: ${new Date().toISOString()}`);
        console.log('Retention Policy: Delete data older than 30 days');

        const cutoffDate = "NOW() - INTERVAL '30 days'";

        // Begin Transaction (Production Safety)
        if (!isDryRun) await client.query('BEGIN');

        // 1. Restaurant Orders
        let ordersQuery;
        if (isDryRun) {
            ordersQuery = `SELECT count(*) as count FROM restaurant_orders WHERE created_at < ${cutoffDate}`;
        } else {
            ordersQuery = `DELETE FROM restaurant_orders WHERE created_at < ${cutoffDate} RETURNING id`;
        }
        const ordersRes = await client.query(ordersQuery);
        const ordersCount = isDryRun ? ordersRes.rows[0].count : ordersRes.rowCount;
        console.log(`[Restaurant Orders] ${isDryRun ? 'Would delete' : 'Deleted'}: ${ordersCount} records`);

        // 2. Mechanic Jobs
        let jobsQuery;
        if (isDryRun) {
            jobsQuery = `SELECT count(*) as count FROM mechanic_jobs WHERE created_at < ${cutoffDate}`;
        } else {
            jobsQuery = `DELETE FROM mechanic_jobs WHERE created_at < ${cutoffDate} RETURNING id`;
        }
        const jobsRes = await client.query(jobsQuery);
        const jobsCount = isDryRun ? jobsRes.rows[0].count : jobsRes.rowCount;
        console.log(`[Mechanic Jobs]     ${isDryRun ? 'Would delete' : 'Deleted'}: ${jobsCount} records`);

        // Commit Transaction
        if (!isDryRun) {
            await client.query('COMMIT');
            console.log('Transaction Committed.');
        }

        console.log('--- Cleanup Complete ---');
    } catch (err) {
        if (!isDryRun) await client.query('ROLLBACK');
        console.error('Cleanup Error (Rolled Back):', err);
        process.exit(1);
    } finally {
        client.release();
        pool.end();
    }
}

cleanup();
