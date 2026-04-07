-- Add phone column
ALTER TABLE users ADD COLUMN phone VARCHAR(20);

-- Migrate existing data cleanly
UPDATE users SET phone = left(id::text, 10) WHERE phone IS NULL;

-- Enforce constraints
ALTER TABLE users ALTER COLUMN phone SET NOT NULL;
ALTER TABLE users ADD CONSTRAINT users_phone_key UNIQUE (phone);

-- Drop deprecated email column
ALTER TABLE users DROP COLUMN IF EXISTS email;
