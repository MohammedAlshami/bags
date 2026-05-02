ALTER TABLE products
ADD COLUMN before_discount_price TEXT;

ALTER TABLE products
ADD COLUMN before_discount_old_riyal REAL;

ALTER TABLE packages
ADD COLUMN before_discount_price TEXT;

ALTER TABLE packages
ADD COLUMN before_discount_old_riyal REAL;
