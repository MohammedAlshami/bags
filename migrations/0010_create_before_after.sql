CREATE TABLE IF NOT EXISTS before_after_images (
  id TEXT PRIMARY KEY,
  image_url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT INTO before_after_images (id, image_url, sort_order) VALUES
('ba_01', '/images/before-after/WhatsApp Image 2026-05-16 at 10.34.42 PM.jpeg', 0),
('ba_02', '/images/before-after/WhatsApp Image 2026-05-16 at 10.34.42 PM (1).jpeg', 1),
('ba_03', '/images/before-after/WhatsApp Image 2026-05-16 at 10.34.42 PM (2).jpeg', 2),
('ba_04', '/images/before-after/WhatsApp Image 2026-05-16 at 10.34.43 PM.jpeg', 3),
('ba_05', '/images/before-after/WhatsApp Image 2026-05-16 at 10.34.43 PM (1).jpeg', 4),
('ba_06', '/images/before-after/WhatsApp Image 2026-05-16 at 10.34.44 PM.jpeg', 5),
('ba_07', '/images/before-after/WhatsApp Image 2026-05-16 at 10.34.44 PM (1).jpeg', 6),
('ba_08', '/images/before-after/WhatsApp Image 2026-05-16 at 10.34.44 PM (2).jpeg', 7),
('ba_09', '/images/before-after/WhatsApp Image 2026-05-16 at 10.34.44 PM (3).jpeg', 8),
('ba_10', '/images/before-after/WhatsApp Image 2026-05-16 at 10.34.45 PM.jpeg', 9),
('ba_11', '/images/before-after/WhatsApp Image 2026-05-16 at 10.34.45 PM (1).jpeg', 10),
('ba_12', '/images/before-after/WhatsApp Image 2026-05-16 at 10.34.45 PM (2).jpeg', 11),
('ba_13', '/images/before-after/WhatsApp Image 2026-05-16 at 10.34.45 PM (3).jpeg', 12);
