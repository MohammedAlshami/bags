-- Add 'confirmed' (تم التأكيد) to the orders.status CHECK constraint by recreating the table.
-- Nothing references orders(id), so a plain copy-and-swap is safe.

CREATE TABLE orders_new (
  id TEXT PRIMARY KEY NOT NULL DEFAULT (
    lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-' || lower(hex(randomblob(2))) || '-' || lower(hex(randomblob(2))) || '-' || lower(hex(randomblob(6)))
  ),
  customer_id TEXT NOT NULL,
  items TEXT NOT NULL DEFAULT '[]',
  total REAL NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'paid', 'processing', 'shipped', 'delivered', 'cancelled')),
  shipping_address TEXT NOT NULL DEFAULT '{}',
  tracking_number TEXT NOT NULL DEFAULT '',
  carrier TEXT NOT NULL DEFAULT '',
  shipped_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  payment_proof_url TEXT,
  branch_key TEXT,
  FOREIGN KEY (customer_id) REFERENCES users(id)
);

INSERT INTO orders_new (
  id, customer_id, items, total, status, shipping_address, tracking_number, carrier,
  shipped_at, created_at, updated_at, payment_proof_url, branch_key
)
SELECT
  id, customer_id, items, total, status, shipping_address, tracking_number, carrier,
  shipped_at, created_at, updated_at, payment_proof_url, branch_key
FROM orders;

DROP TABLE orders;
ALTER TABLE orders_new RENAME TO orders;
