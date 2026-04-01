-- Menu Items Table
CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  category VARCHAR(50),
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Index for tenant-scoped menu queries
CREATE INDEX IF NOT EXISTS idx_menu_items_tenant ON menu_items(tenant_id);

-- Expand restaurant_orders status check to allow: pending, preparing, ready, completed
ALTER TABLE restaurant_orders
  DROP CONSTRAINT IF EXISTS restaurant_orders_status_check;

ALTER TABLE restaurant_orders
  ADD CONSTRAINT restaurant_orders_status_check
  CHECK (status IN ('pending', 'preparing', 'ready', 'completed'));
