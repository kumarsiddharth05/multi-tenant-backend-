-- Indexes on tenant_id for all tenant-scoped tables
CREATE INDEX IF NOT EXISTS idx_users_tenant ON users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_orders_tenant ON restaurant_orders(tenant_id);
CREATE INDEX IF NOT EXISTS idx_jobs_tenant ON mechanic_jobs(tenant_id);

-- Composite indexes for report and cleanup queries (tenant + time range)
CREATE INDEX IF NOT EXISTS idx_orders_tenant_created ON restaurant_orders(tenant_id, created_at);
CREATE INDEX IF NOT EXISTS idx_jobs_tenant_created ON mechanic_jobs(tenant_id, created_at);
