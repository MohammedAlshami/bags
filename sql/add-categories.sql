CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE products
ADD COLUMN IF NOT EXISTS category_id UUID;

INSERT INTO categories (name, sort_order)
VALUES
  ('العناية بالبشرة', 1),
  ('العناية بالشعر', 2),
  ('العناية بالجسم', 3),
  ('العناية والجمال', 4)
ON CONFLICT (name) DO NOTHING;

UPDATE categories
SET sort_order = CASE name
  WHEN 'العناية بالبشرة' THEN 1
  WHEN 'العناية بالشعر' THEN 2
  WHEN 'العناية بالجسم' THEN 3
  WHEN 'العناية والجمال' THEN 4
  ELSE sort_order
END,
updated_at = now()
WHERE name IN (
  'العناية بالبشرة',
  'العناية بالشعر',
  'العناية بالجسم',
  'العناية والجمال'
);

INSERT INTO categories (name, sort_order)
SELECT src.category, 100 + ROW_NUMBER() OVER (ORDER BY src.category)
FROM (
  SELECT DISTINCT p.category AS category
  FROM products p
  WHERE p.category IS NOT NULL AND btrim(p.category) <> ''
) src
WHERE NOT EXISTS (
  SELECT 1 FROM categories c WHERE c.name = src.category
);

UPDATE products p
SET category_id = c.id
FROM categories c
WHERE p.category = c.name
  AND p.category_id IS NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'products_category_id_fkey'
  ) THEN
    ALTER TABLE products
    ADD CONSTRAINT products_category_id_fkey
    FOREIGN KEY (category_id) REFERENCES categories(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS products_category_id_idx ON products(category_id);

ALTER TABLE products
ALTER COLUMN category_id SET NOT NULL;
