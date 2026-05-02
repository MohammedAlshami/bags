CREATE TABLE IF NOT EXISTS packages (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  image TEXT NOT NULL DEFAULT '',
  product_ids TEXT NOT NULL DEFAULT '[]',
  price TEXT NOT NULL,
  old_riyal REAL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS packages_created_at_idx
  ON packages (created_at DESC);
