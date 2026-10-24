-- Admin-managed discount codes (replaces the hardcoded QGB10 voucher).
CREATE TABLE discount_codes (
  id TEXT PRIMARY KEY NOT NULL,
  code TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL DEFAULT 'percent' CHECK (type IN ('percent', 'fixed')),
  value REAL NOT NULL,
  min_subtotal REAL NOT NULL DEFAULT 0,
  max_uses INTEGER,
  used_count INTEGER NOT NULL DEFAULT 0,
  starts_at TEXT,
  expires_at TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Keep the existing voucher working.
INSERT INTO discount_codes (id, code, type, value) VALUES ('seed-qgb10', 'QGB10', 'percent', 10);
