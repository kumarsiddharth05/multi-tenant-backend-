--- Step 1: Add is_veg to menu_items ---
ALTER TABLE menu_items ADD COLUMN is_veg BOOLEAN NOT NULL DEFAULT true;
