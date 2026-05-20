CREATE TABLE IF NOT EXISTS social_links (
  id TEXT PRIMARY KEY,
  platform TEXT NOT NULL,
  label TEXT NOT NULL DEFAULT '',
  url TEXT NOT NULL,
  icon TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT INTO social_links (id, platform, label, url, display_order) VALUES
('whatsapp', 'whatsapp', 'واتساب', 'https://wa.me/967782183149', 0),
('instagram', 'instagram', 'إنستغرام', 'https://www.instagram.com/queen__007696', 1),
('whatsapp_channel', 'whatsapp_channel', 'قناة الواتساب', 'https://whatsapp.com/channel/0029Vb6EdFc3GJP6WMzfXn2N', 2);
