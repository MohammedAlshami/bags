-- Drops legacy string price columns (run only after `npx tsx scripts/migrate-prices-to-floats.ts`).

ALTER TABLE products DROP COLUMN price;
ALTER TABLE products DROP COLUMN before_discount_price;
ALTER TABLE products DROP COLUMN before_discount_old_riyal;

ALTER TABLE packages DROP COLUMN price;
ALTER TABLE packages DROP COLUMN before_discount_price;
ALTER TABLE packages DROP COLUMN before_discount_old_riyal;
