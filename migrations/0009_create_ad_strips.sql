CREATE TABLE IF NOT EXISTS ad_strips (
  id TEXT PRIMARY KEY,
  text TEXT NOT NULL DEFAULT '',
  is_active INTEGER NOT NULL DEFAULT 1,
  bg_color TEXT,
  text_color TEXT,
  link_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT INTO ad_strips (id, text, is_active, sort_order) VALUES
('default', 'منتجات الملكة جولد للعناية فرع اليمن', 1, 0);
