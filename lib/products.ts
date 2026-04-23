export type Product = {
  name: string;
  price: string;
  category: string;
  image: string;
  slug: string;
};

export const PRODUCTS: Product[] = [
  { name: "كريم أر بوتين", price: "45 ر.س", category: "العناية بالبشرة", image: "/product_Images/WhatsApp Image 2026-04-07 at 5.24.41 PM (5).jpeg", slug: "product-001" },
  { name: "غسول الوجه المرطب", price: "21 ر.س", category: "العناية بالبشرة", image: "/product_Images/WhatsApp Image 2026-04-07 at 5.24.40 PM (3).jpeg", slug: "product-002" },
  { name: "ماسك البشرة", price: "15 ر.س", category: "العناية بالبشرة", image: "/product_Images/WhatsApp Image 2026-04-07 at 5.24.38 PM.jpeg", slug: "product-003" },
  { name: "ماء ميسلار", price: "21 ر.س", category: "العناية بالبشرة", image: "/product_Images/WhatsApp Image 2026-04-07 at 5.24.39 PM.jpeg", slug: "product-004" },
  { name: "المقشر البارد", price: "100 ر.س", category: "العناية بالبشرة", image: "/product_Images/WhatsApp Image 2026-04-07 at 5.24.36 PM.jpeg", slug: "product-005" },
  { name: "لوشن ترطيب الجسم", price: "35 ر.س", category: "العناية بالبشرة", image: "/product_Images/WhatsApp Image 2026-04-07 at 5.24.42 PM (3).jpeg", slug: "product-006" },
  { name: "كريم تصغير الأنف", price: "21 ر.س", category: "العناية بالبشرة", image: "/product_Images/WhatsApp Image 2026-04-07 at 5.24.48 PM (1).jpeg", slug: "product-007" },
  { name: "بودر الخدود", price: "18 ر.س", category: "العناية بالبشرة", image: "/product_Images/WhatsApp Image 2026-04-07 at 5.24.42 PM (2).jpeg", slug: "product-008" },
  { name: "سيروم الهالات", price: "21 ر.س", category: "العناية بالبشرة", image: "/product_Images/WhatsApp Image 2026-04-07 at 5.24.32 PM.jpeg", slug: "product-009" },
  { name: "بديل زيت الليزر", price: "18 ر.س", category: "العناية بالبشرة", image: "/product_Images/WhatsApp Image 2026-04-07 at 5.24.41 PM (7).jpeg", slug: "product-010" },
  { name: "شامبو عضوي", price: "18 ر.س", category: "العناية بالشعر", image: "/product_Images/WhatsApp Image 2026-04-07 at 5.24.37 PM.jpeg", slug: "product-011" },
  { name: "بلسم طبيعي", price: "18 ر.س", category: "العناية بالشعر", image: "/product_Images/WhatsApp Image 2026-04-07 at 5.24.37 PM (1).jpeg", slug: "product-012" },
  { name: "زيت الشعر", price: "18 ر.س", category: "العناية بالشعر", image: "/product_Images/WhatsApp Image 2026-04-07 at 5.24.41 PM (2).jpeg", slug: "product-013" },
  { name: "باكج العناية بالشعر", price: "49 ر.س", category: "العناية بالشعر", image: "/product_Images/WhatsApp Image 2026-04-07 at 5.24.36 PM (2).jpeg", slug: "product-014" },
  { name: "زيت الشعر 45", price: "18 ر.س", category: "العناية بالشعر", image: "/product_Images/WhatsApp Image 2026-04-07 at 5.24.39 PM (4).jpeg", slug: "product-015" },
  { name: "باكج الشعر", price: "49 ر.س", category: "العناية بالشعر", image: "/product_Images/WhatsApp Image 2026-04-07 at 5.24.48 PM (2).jpeg", slug: "product-016" },
  { name: "زيت لتطويل الشعر", price: "18 ر.س", category: "العناية بالشعر", image: "/product_Images/WhatsApp Image 2026-04-07 at 5.24.40 PM (2).jpeg", slug: "product-017" },
  { name: "عسل تسمين", price: "60 ر.س", category: "العناية بالجسم", image: "/product_Images/WhatsApp Image 2026-04-07 at 5.24.38 PM (2).jpeg", slug: "product-018" },
  { name: "أعشاب التنحيف", price: "38 ر.س", category: "العناية بالجسم", image: "/product_Images/WhatsApp Image 2026-04-07 at 5.24.39 PM (3).jpeg", slug: "product-019" },
  { name: "بذور الأنوثة", price: "50 ر.س", category: "العناية بالجسم", image: "/product_Images/WhatsApp Image 2026-04-07 at 5.24.48 PM.jpeg", slug: "product-020" },
  { name: "سيروم الرموش", price: "11 ر.س", category: "العناية والجمال", image: "/product_Images/WhatsApp Image 2026-04-07 at 5.24.38 PM (1).jpeg", slug: "product-021" },
  { name: "بودرة تبييض الأسنان", price: "18 ر.س", category: "العناية والجمال", image: "/product_Images/WhatsApp Image 2026-04-07 at 5.24.41 PM (4).jpeg", slug: "product-022" },
  { name: "سيروم الأظافر", price: "18 ر.س", category: "العناية والجمال", image: "/product_Images/WhatsApp Image 2026-04-07 at 5.24.41 PM (1).jpeg", slug: "product-023" },
  { name: "مزيل عرق طبيعي", price: "15 ر.س", category: "العناية والجمال", image: "/product_Images/WhatsApp Image 2026-04-07 at 5.24.36 PM (1).jpeg", slug: "product-024" },
  { name: "كحل أثمد", price: "11 ر.س", category: "العناية والجمال", image: "/product_Images/WhatsApp Image 2026-04-07 at 5.24.40 PM (1).jpeg", slug: "product-025" },
];

export const CATEGORIES = ["العناية بالبشرة", "العناية بالشعر", "العناية بالجسم", "العناية والجمال"] as const;
