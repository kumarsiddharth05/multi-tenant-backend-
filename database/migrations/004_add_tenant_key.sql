-- Add tenant_key column
ALTER TABLE tenants ADD COLUMN tenant_key VARCHAR(50);

-- Backfill existing tenants (using name as key)
UPDATE tenants SET tenant_key = name WHERE tenant_key IS NULL;

-- Enforce Not Null and Unique
ALTER TABLE tenants ALTER COLUMN tenant_key SET NOT NULL;
ALTER TABLE tenants ADD CONSTRAINT tenants_tenant_key_unique UNIQUE (tenant_key);
