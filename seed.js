/* eslint-disable */
require('dotenv').config();
const { pool } = require('./src/config/db');
const fs = require('fs');

async function seed() {
    try {
        console.log('--- Seeding V2 DB ---');

        // Migrations
        const migrations = [
            './migrations/001_create_tenants.sql',
            './migrations/002_create_users.sql',
            './migrations/003_create_v2_schemas.sql'
        ];

        for (const file of migrations) {
            try {
                const sql = fs.readFileSync(file, 'utf8');
                await pool.query(sql);
                console.log(`Applied ${file}`);
            } catch (e) {
                // ignore exists error
            }
        }

        // Helper to get or create tenant
        async function getOrCreateTenant(name, type) {
            const existing = await pool.query("SELECT id FROM tenants WHERE name = $1", [name]);
            if (existing.rows.length > 0) {
                // Update type to match expected
                await pool.query("UPDATE tenants SET type = $1 WHERE id = $2", [type, existing.rows[0].id]);
                return existing.rows[0].id;
            }
            const res = await pool.query("INSERT INTO tenants (name, type) VALUES ($1, $2) RETURNING id", [name, type]);
            return res.rows[0].id;
        }

        // Create Restaurant Tenant
        const restId = await getOrCreateTenant('demo-restaurant', 'restaurant');
        console.log('Restaurant:', 'demo-restaurant', restId);

        // Create Mechanic Tenant
        const mechId = await getOrCreateTenant('demo-mechanic', 'mechanic');
        console.log('Mechanic:', 'demo-mechanic', mechId);

        console.log('--- Seeding Complete ---');

    } catch (e) {
        console.error('Seeding Error:', e);
        process.exit(1);
    } finally {
        pool.end();
    }
}

seed();
