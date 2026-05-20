CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  author TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL DEFAULT '',
  product_id TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT INTO reviews (id, author, body, sort_order) VALUES
('rev_01', 'نورة ع.', 'النتيجة فاقت التوقعات؛ بشرتي أصبحت أكثر نعومة ولمعاناً منذ أسبوعين. التغليف أنيق والتوصيل سريع.', 0),
('rev_02', 'لينا م.', 'أول مرة أجرب منتجات محلية بهذه الجودة. رائحة خفيفة مريحة والتركيبة لا تثقل البشرة.', 1),
('rev_03', 'ريم س.', 'طلبت للعائلة والجميع راضٍ. خدمة العملاء على الواتساب استجابت بسرعة وساعدتني في اختيار المناسب.', 2),
('rev_04', 'هند أ.', 'أستخدم السيروم يومياً مع الكريم؛ الهالات خفت بشكل ملحوظ. أنصح به بصراحة.', 3),
('rev_05', 'دانة ك.', 'الشحن وصل قبل الموعد والمنتج مطابق للصور. أعد الطلب بكل ثقة.', 4);
