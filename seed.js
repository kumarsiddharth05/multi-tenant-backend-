/* eslint-disable */
require('dotenv').config();
const { pool } = require('./src/config/db');
const fs = require('fs');
const bcrypt = require('bcrypt');

async function seed() {
    try {
        console.log('--- Seeding V2 DB ---');

        // Migrations
        const migrations = [
            './migrations/001_create_tenants.sql',
            './migrations/002_create_users.sql',
            './migrations/003_create_v2_schemas.sql',
            './migrations/004_add_tenant_key.sql'
        ];

        for (const file of migrations) {
            try {
                const sql = fs.readFileSync(file, 'utf8');
                await pool.query(sql);
                console.log(`Applied ${file}`);
            } catch (e) {
                // ignore exists error
                if (!e.message.includes('already exists') && !e.message.includes('duplicate')) {
                    // console.log(`Migration Note: ${e.message.split('\n')[0]}`);
                }
            }
        }

        // Helper to get or create tenant
        async function getOrCreateTenant(key, type) {
            // Here we use 'key' as both name and tenant_key for simplicity in seed
            const existing = await pool.query("SELECT id FROM tenants WHERE tenant_key = $1", [key]);
            if (existing.rows.length > 0) {
                await pool.query("UPDATE tenants SET type = $1 WHERE id = $2", [type, existing.rows[0].id]);
                return existing.rows[0].id;
            }
            // If not found by key, try by name (for backward compat if migration ran but no key yet?)
            // Migration 004 updates existing names to keys.
            // So checking by key is sufficient.

            // Handle constraint: name must be provided. user key as name.
            const res = await pool.query(`
          INSERT INTO tenants (name, type, tenant_key) 
          VALUES ($1, $2, $3) 
          ON CONFLICT (tenant_key) DO UPDATE SET type=EXCLUDED.type 
          RETURNING id
        `, [key, type, key]);
            return res.rows[0].id;
        }

        // Helper to create user
        async function upsertUser(tenantId, email, password) {
            const hash = await bcrypt.hash(password, 10);
            const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
            if (existing.rows.length > 0) {
                await pool.query("UPDATE users SET password_hash = $1, tenant_id = $2 WHERE email = $3", [hash, tenantId, email]);
                console.log(`Updated user: ${email}`);
                return existing.rows[0].id;
            }
            const res = await pool.query("INSERT INTO users (tenant_id, email, password_hash, role) VALUES ($1, $2, $3, 'owner') RETURNING id", [tenantId, email, hash]);
            console.log(`Created user: ${email}`);
            return res.rows[0].id;
        }

        // Create Restaurant Tenant & User
        const restId = await getOrCreateTenant('demo-restaurant', 'restaurant');
        await upsertUser(restId, 'rest-owner@demo.com', 'secret123');
        console.log('Restaurant:', 'demo-restaurant', restId);

        // Create Mechanic Tenant & User
        const mechId = await getOrCreateTenant('demo-mechanic', 'mechanic');
        await upsertUser(mechId, 'mech-owner@demo.com', 'secret123');
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
