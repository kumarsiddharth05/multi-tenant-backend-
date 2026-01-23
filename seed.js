/* eslint-disable */
require('dotenv').config();
const { pool } = require('./src/config/db');
const fs = require('fs');
const bcrypt = require('bcrypt');

async function seed() {
    try {
        console.log('--- Seeding DB ---');

        // Attempt to run migration 001
        try {
            const sql1 = fs.readFileSync('./migrations/001_create_tenants.sql', 'utf8');
            await pool.query(sql1);
            console.log('Applied migration 001');
        } catch (e) {
            // ignore if table exists
        }

        // Attempt to run migration 002
        try {
            const sql2 = fs.readFileSync('./migrations/002_create_users.sql', 'utf8');
            await pool.query(sql2);
            console.log('Applied migration 002');
        } catch (e) {
            // ignore if table exists
        }

        // Create Tenant (Manual check strictly)
        let tenantId;
        const existingTenant = await pool.query("SELECT id FROM tenants WHERE name = 'Demo Tenant'");
        if (existingTenant.rows.length > 0) {
            tenantId = existingTenant.rows[0].id;
            console.log('Using existing Tenant ID:', tenantId);
        } else {
            const tenantRes = await pool.query("INSERT INTO tenants (name, type) VALUES ('Demo Tenant', 'restaurant') RETURNING id");
            tenantId = tenantRes.rows[0].id;
            console.log('Created Tenant ID:', tenantId);
        }

        // Create User (Manual check strictly)
        const email = 'owner@demo.com';
        const existingUser = await pool.query("SELECT id FROM users WHERE email = $1", [email]);

        if (existingUser.rows.length > 0) {
            // Update password just in case
            const hash = await bcrypt.hash('secret123', 10);
            await pool.query("UPDATE users SET password_hash = $1 WHERE email = $2", [hash, email]);
            console.log('Updated existing User:', email);
        } else {
            const hash = await bcrypt.hash('secret123', 10);
            await pool.query(`
          INSERT INTO users (tenant_id, email, password_hash, role) 
          VALUES ($1, $2, $3, 'owner')
        `, [tenantId, email, hash]);
            console.log('Created User:', email);
        }

        console.log('--- Seeding Complete ---');

    } catch (e) {
        console.error('Seeding Error:', e);
        process.exit(1);
    } finally {
        pool.end();
    }
}

seed();
