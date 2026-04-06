-- Expand restaurant_orders status check to allow: rejected
ALTER TABLE restaurant_orders
  DROP CONSTRAINT IF EXISTS restaurant_orders_status_check;

ALTER TABLE restaurant_orders
  ADD CONSTRAINT restaurant_orders_status_check
  CHECK (status IN ('pending', 'preparing', 'ready', 'completed', 'rejected'));

-- Expand mechanic_jobs status check to allow: rejected
ALTER TABLE mechanic_jobs
  DROP CONSTRAINT IF EXISTS mechanic_jobs_status_check;

ALTER TABLE mechanic_jobs
  ADD CONSTRAINT mechanic_jobs_status_check
  CHECK (status IN ('pending', 'completed', 'rejected'));
