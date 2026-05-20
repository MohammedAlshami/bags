CREATE TABLE IF NOT EXISTS faq_items (
  id TEXT PRIMARY KEY,
  question TEXT NOT NULL DEFAULT '',
  answer TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT INTO faq_items (id, question, answer, sort_order) VALUES
('faq_01', 'ما هي مكوّنات منتجات الملكة جولد؟', 'نختار مكوّنات طبيعية وآمنة، مع شفافية في الوصف. التفاصيل الكاملة تجدينها على صفحة كل منتج.', 0),
('faq_02', 'متى يصل طلبي؟', 'مدة التوصيل تعتمد على منطقتك. بعد تأكيد الطلب ستصلك تفاصيل التتبع عند الشحن.', 1),
('faq_03', 'كيف ألغي طلباً؟', 'تواصلي مع خدمة العملاء عبر الواتساب في أقرب وقت بعد الطلب إن رغبتِ بالإلغاء قبل الشحن.', 2),
('faq_04', 'كم سعر المنتج؟', 'الأسعار معروضة على كل منتج في المتجر بالريال، وقد تتوفر عروض موسمية.', 3),
('faq_05', 'ماذا لو لم أكن متواجدة لاستلام الطلب؟', 'يُعاد التوصيل حسب سياسة شركة الشحن أو يُترك إشعار للاستلام من نقطة التسليم.', 4),
('faq_06', 'هل يمكنني تتبع الطلب؟', 'نعم، عند الشحن يُرسل رقم تتبع يمكنك متابعته من صفحة الطلب أو الرسالة النصية.', 5);
