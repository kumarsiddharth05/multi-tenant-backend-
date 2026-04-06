/* eslint-disable */
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const path = require('path');
const { pool } = require(path.join(__dirname, '../core/config/db'));
const fs = require('fs');
const bcrypt = require('bcrypt');

async function seed() {
    try {
        console.log('--- Seeding V2 DB ---');

        // Migrations (resolved relative to this script's location - now in backend/src/scripts/)
        // migrations folder is at ../../../database/migrations
        const migrationsDir = path.join(__dirname, '../../../database/migrations');
        const migrations = [
            '001_create_tenants.sql',
            '002_create_users.sql',
            '003_create_v2_schemas.sql',
            '004_add_tenant_key.sql',
            '005_add_indexes.sql',
            '006_create_menu_and_status.sql',
            '007_update_auth_to_phone.sql',
            '008_add_rejected_status.sql'
        ];

        for (const file of migrations) {
            try {
                const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
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
            const existing = await pool.query("SELECT id FROM tenants WHERE tenant_key = $1", [key]);
            if (existing.rows.length > 0) {
                await pool.query("UPDATE tenants SET type = $1 WHERE id = $2", [type, existing.rows[0].id]);
                return existing.rows[0].id;
            }

            const res = await pool.query(`
          INSERT INTO tenants (name, type, tenant_key) 
          VALUES ($1, $2, $3) 
          ON CONFLICT (tenant_key) DO UPDATE SET type=EXCLUDED.type 
          RETURNING id
        `, [key, type, key]);
            return res.rows[0].id;
        }

        // Helper to create user
        async function upsertUser(tenantId, phone, password) {
            const hash = await bcrypt.hash(password, 10);
            const existing = await pool.query("SELECT id FROM users WHERE phone = $1", [phone]);
            if (existing.rows.length > 0) {
                await pool.query("UPDATE users SET password_hash = $1, tenant_id = $2 WHERE phone = $3", [hash, tenantId, phone]);
                console.log(`Updated user: ${phone}`);
                return existing.rows[0].id;
            }
            const res = await pool.query("INSERT INTO users (tenant_id, phone, password_hash, role) VALUES ($1, $2, $3, 'owner') RETURNING id", [tenantId, phone, hash]);
            console.log(`Created user: ${phone}`);
            return res.rows[0].id;
        }

        // Create Restaurant Tenant & User
        const restId = await getOrCreateTenant('demo-restaurant', 'restaurant');
        await upsertUser(restId, '9998887777', 'secret123');
        console.log('Restaurant:', 'demo-restaurant', restId);

        // Create Mechanic Tenant & User
        const mechId = await getOrCreateTenant('demo-mechanic', 'mechanic');
        await upsertUser(mechId, '6665554444', 'secret123');
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
