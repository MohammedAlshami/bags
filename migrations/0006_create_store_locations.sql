-- Creates store_locations table for dynamic point-of-sale management.
-- Run via: wrangler d1 migrations apply goldqueen --remote

CREATE TABLE IF NOT EXISTS store_locations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT '',
  country TEXT NOT NULL DEFAULT 'اليمن',
  address TEXT NOT NULL DEFAULT '',
  phone TEXT,
  lat REAL NOT NULL,
  lon REAL NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- All 14 store locations (no shipping offices; they were removed in 0007)
INSERT INTO store_locations (id, name, city, country, address, phone, lat, lon, sort_order) VALUES
('sanaa-al-kumaym', 'نسمة الربيع', 'صنعاء', 'اليمن', 'الكميم', NULL, 15.3694, 44.191, 2),
('sanaa-sixty-st', 'تاتشز', 'صنعاء', 'اليمن', 'شارع الستين (بجانب سيتي ماكس)', NULL, 15.3789, 44.2138, 3),
('sanaa-flora', 'فلورا', 'صنعاء', 'اليمن', 'سعوان — المدينة السكنية، جوار مركز وير نايس، مول الزهراء', NULL, 15.3982, 44.2306, 4),
('taiz-city-mall', 'أنت لك', 'تعز (المدينة)', 'اليمن', 'سيتي مول — الدور الثاني', '776846456', 13.5789, 44.0209, 5),
('marib-star', 'الطيف ستار', 'مأرب', 'اليمن', 'سيتي مول سنتر — شارع الأربعين', '780093653', 15.47, 45.32, 6),
('ataq-mariam', 'مريم', 'شبوة (عتق)', 'اليمن', 'سوق البلد — الدور الأول، شارع المرور، خط الثلاثين', '737948953', 14.55, 46.83, 7),
('ib-paris-rose', 'باريس روز', 'إب', 'اليمن', 'شارع العدين — مجمع جرعان التجاري', '777158717', 13.97, 44.18, 8),
('mukalla-sabaya', 'صبايا', 'المكلا', 'اليمن', 'مقابل العماري للذهب', '730944448', 14.5425, 49.1242, 9),
('al-mahra-sabaya', 'صبايا', 'المهرة', 'اليمن', 'سوق النساء — بجانب مسجد باصفار ومحلات وادي جب', '780044447', 16.73, 52.83, 10),
('al-hudaydah-ameer', 'أمير الرافدين', 'الحديدة', 'اليمن', 'شارع صدام — أمام شركة بن حريش للصرافة', '772464139', 14.797, 42.95, 11),
('aden-albayraq', 'أطياف العطور', 'عدن', 'اليمن', 'المنصورة — البيرق مول، شارع 50', '771203768', 12.8, 45.03, 12),
('omran-al-babily', 'البابلي', 'عمران', 'اليمن', 'سوق عمران — جوار البابلي للخياطة', '774052218', 15.66, 43.94, 13),
('dhamar-al-majid', 'الماجد للعطور', 'ذمار', 'اليمن', 'شارع المعارض — أمام مدرسة بلقيس', '777150077', 14.55, 44.38, 14),
('taiz-al-huban', 'القوة السحرية', 'تعز (الحوبان والمسبح)', 'اليمن', 'فرع المسبح: مقابل مطعم الشميري | فرع الحوبان: مركز الجوهرة مول، الدور الثاني', '776329097', 13.58, 44.02, 15);
