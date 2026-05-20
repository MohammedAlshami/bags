-- Removes is_pickup_point column and shipping-office rows from store_locations.
-- Run via: wrangler d1 migrations apply goldqueen --remote

ALTER TABLE store_locations DROP COLUMN is_pickup_point;

DELETE FROM store_locations WHERE id IN ('shipping-office-salmi', 'shipping-office-qudsi');
