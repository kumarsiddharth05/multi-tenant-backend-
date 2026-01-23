/* eslint-disable */
require('dotenv').config();
const { pool } = require('../src/config/db');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

// Check for --dry-run flag
const isDryRun = process.argv.includes('--dry-run');

async function generateReports() {
    try {
        console.log(`--- Generating Weekly Reports ${isDryRun ? '(DRY RUN)' : ''} ---`);

        // Ensure reports dir exists
        const reportsDir = path.join(__dirname, '..', 'reports');
        if (!fs.existsSync(reportsDir) && !isDryRun) {
            fs.mkdirSync(reportsDir);
        }

        // Get all tenants
        const tenants = await pool.query("SELECT id, name, type, tenant_key FROM tenants");

        for (const tenant of tenants.rows) {
            console.log(`Processing ${tenant.name} (${tenant.type})...`);

            // SQL: Aggregate by day for the last 7 days
            // Edge Case: Timezones are UTC by default in DB. date_trunc('day', timestamp) truncates to 00:00 UTC.
            let query;
            if (tenant.type === 'restaurant') {
                query = `
                SELECT date_trunc('day', created_at)::date as day, count(*) as count 
                FROM restaurant_orders 
                WHERE tenant_id = $1 AND created_at > NOW() - INTERVAL '7 days'
                GROUP BY day ORDER BY day DESC
            `;
            } else {
                query = `
                SELECT date_trunc('day', created_at)::date as day, count(*) as count 
                FROM mechanic_jobs 
                WHERE tenant_id = $1 AND created_at > NOW() - INTERVAL '7 days'
                GROUP BY day ORDER BY day DESC
            `;
            }

            const res = await pool.query(query, [tenant.id]);
            const data = res.rows;

            if (isDryRun) {
                console.log(`  > Found ${data.length} daily entries.`);
                data.forEach(row => console.log(`    - ${new Date(row.day).toISOString().split('T')[0]}: ${row.count}`));
                continue; // Skip PDF generation
            }

            // Generate PDF
            const doc = new PDFDocument();
            // File Naming: Report_TENANTKEY_TIMESTAMP.pdf
            const filename = `Report_${tenant.tenant_key}_${Date.now()}.pdf`;
            const filePath = path.join(reportsDir, filename);
            const stream = fs.createWriteStream(filePath);

            doc.pipe(stream);

            // Header
            doc.fontSize(20).text(`Weekly Report`, { align: 'center' });
            doc.fontSize(14).text(`${tenant.name}`, { align: 'center' });
            doc.moveDown();
            doc.fontSize(10).text(`Tenant Key: ${tenant.tenant_key}`);
            doc.text(`Type: ${tenant.type}`);
            doc.text(`Generated: ${new Date().toUTCString()}`);
            doc.moveDown();
            doc.text(`Period: Last 7 Days`);
            doc.moveDown();

            // Data Table
            doc.fontSize(12).text(tenant.type === 'restaurant' ? 'Orders Summary' : 'Jobs Summary', { underline: true });
            doc.moveDown();

            if (data.length === 0) {
                doc.text('No activity recorded in the last 7 days.');
            } else {
                // Total Count
                const total = data.reduce((acc, row) => acc + parseInt(row.count), 0);
                doc.text(`Total Items: ${total}`);
                doc.moveDown();

                data.forEach(row => {
                    const dateStr = new Date(row.day).toISOString().split('T')[0]; // YYYY-MM-DD
                    doc.text(`${dateStr}: ${row.count}`);
                });
            }

            doc.end();
            console.log(`  > Generated: reports/${filename}`);
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
