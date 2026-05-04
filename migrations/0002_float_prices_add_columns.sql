-- Adds float SAR + legacy-currency columns. Next: run `npx tsx scripts/migrate-prices-to-floats.ts`, then apply 0003.
-- Products
ALTER TABLE products ADD COLUMN saudi_riyal REAL;
ALTER TABLE products ADD COLUMN saudi_riyal_before_discount REAL;
ALTER TABLE products ADD COLUMN old_riyal_before_discount REAL;

UPDATE products
SET old_riyal_before_discount = before_discount_old_riyal
WHERE before_discount_old_riyal IS NOT NULL;

-- Packages
ALTER TABLE packages ADD COLUMN saudi_riyal REAL;
ALTER TABLE packages ADD COLUMN saudi_riyal_before_discount REAL;
ALTER TABLE packages ADD COLUMN old_riyal_before_discount REAL;

UPDATE packages
SET old_riyal_before_discount = before_discount_old_riyal
WHERE before_discount_old_riyal IS NOT NULL;
