/* eslint-disable */
require('dotenv').config();
const { pool } = require('../src/config/db');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

async function generateReports() {
    try {
        console.log('--- Generating Weekly Reports ---');

        // Ensure reports dir exists
        const reportsDir = path.join(__dirname, '..', 'reports');
        if (!fs.existsSync(reportsDir)) {
            fs.mkdirSync(reportsDir);
        }

        // Get all tenants
        const tenants = await pool.query("SELECT id, name, type, tenant_key FROM tenants");

        for (const tenant of tenants.rows) {
            console.log(`Processing ${tenant.name} (${tenant.type})...`);
            const doc = new PDFDocument();
            const filename = `Report_${tenant.tenant_key}_${Date.now()}.pdf`;
            const stream = fs.createWriteStream(path.join(reportsDir, filename));

            doc.pipe(stream);

            doc.fontSize(20).text(`Weekly Report: ${tenant.name}`, { align: 'center' });
            doc.moveDown();
            doc.fontSize(12).text(`Generated: ${new Date().toLocaleString()}`);
            doc.text(`Tenant Type: ${tenant.type}`);
            doc.moveDown();

            let data = [];
            if (tenant.type === 'restaurant') {
                const res = await pool.query(`
                SELECT date_trunc('day', created_at)::date as day, count(*) as count 
                FROM restaurant_orders 
                WHERE tenant_id = $1 
                GROUP BY day ORDER BY day DESC
            `, [tenant.id]);
                data = res.rows;
                doc.text('Summary: Restaurant Orders');
            } else {
                const res = await pool.query(`
                SELECT date_trunc('day', created_at)::date as day, count(*) as count 
                FROM mechanic_jobs 
                WHERE tenant_id = $1 
                GROUP BY day ORDER BY day DESC
            `, [tenant.id]);
                data = res.rows;
                doc.text('Summary: Mechanic Jobs');
            }

            doc.moveDown();

            if (data.length === 0) {
                doc.text('No activity recorded this week.');
            } else {
                data.forEach(row => {
                    // Format date
                    const dateStr = new Date(row.day).toDateString();
                    doc.text(`${dateStr}: ${row.count} items`);
                });
            }

            doc.end();
            console.log(`Generated: reports/${filename}`);
        }

        console.log('--- Reports Complete ---');
    } catch (err) {
        console.error('Report Error:', err);
        process.exit(1);
    } finally {
        pool.end();
    }
}

generateReports();
