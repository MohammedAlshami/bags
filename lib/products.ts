export type Product = {
  name: string;
  saudiRiyal: number;
  category: string;
  image: string;
  slug: string;
};

export const PRODUCTS: Product[] = [
  { name: "كريم أر بوتين", saudiRiyal: 45, category: "العناية بالبشرة", image: "/product_Images/product-001-arbutin-cream.jpeg", slug: "product-001" },
  { name: "غسول الوجه المرطب", saudiRiyal: 21, category: "العناية بالبشرة", image: "/product_Images/product-002-moisturizing-face-cleanser.jpeg", slug: "product-002" },
  { name: "ماسك البشرة", saudiRiyal: 15, category: "العناية بالبشرة", image: "/product_Images/WhatsApp Image 2026-04-07 at 5.24.38 PM.jpeg", slug: "product-003" },
  { name: "ماء ميسلار", saudiRiyal: 21, category: "العناية بالبشرة", image: "/product_Images/product-004-micellar-water.jpeg", slug: "product-004" },
  { name: "المقشر البارد", saudiRiyal: 100, category: "العناية بالبشرة", image: "/product_Images/product-005-cold-exfoliator.jpeg", slug: "product-005" },
  { name: "لوشن ترطيب الجسم", saudiRiyal: 35, category: "العناية بالبشرة", image: "/product_Images/product-006-body-lotion.jpeg", slug: "product-006" },
  { name: "كريم تصغير الأنف", saudiRiyal: 21, category: "العناية بالبشرة", image: "/product_Images/product-007-nose-cream.jpeg", slug: "product-007" },
  { name: "بودر الخدود", saudiRiyal: 18, category: "العناية بالبشرة", image: "/product_Images/product-008-cheek-powder.jpeg", slug: "product-008" },
  { name: "سيروم الهالات", saudiRiyal: 21, category: "العناية بالبشرة", image: "/product_Images/product-009-eye-serum.jpeg", slug: "product-009" },
  { name: "بديل زيت الليزر", saudiRiyal: 18, category: "العناية بالبشرة", image: "/product_Images/product-010-laser-oil-alternative.jpeg", slug: "product-010" },
  { name: "شامبو عضوي", saudiRiyal: 18, category: "العناية بالشعر", image: "/product_Images/product-011-organic-shampoo.jpeg", slug: "product-011" },
  { name: "بلسم طبيعي", saudiRiyal: 18, category: "العناية بالشعر", image: "/product_Images/product-012-natural-conditioner.jpeg", slug: "product-012" },
  { name: "زيت الشعر", saudiRiyal: 18, category: "العناية بالشعر", image: "/product_Images/product-013-hair-oil.jpeg", slug: "product-013" },
  { name: "باكج العناية بالشعر", saudiRiyal: 49, category: "العناية بالشعر", image: "/product_Images/product-014-hair-care-bundle.jpeg", slug: "product-014" },
  { name: "زيت الشعر 45", saudiRiyal: 18, category: "العناية بالشعر", image: "/product_Images/product-015-hair-oil-45.jpeg", slug: "product-015" },
  { name: "باكج الشعر", saudiRiyal: 49, category: "العناية بالشعر", image: "/product_Images/product-016-hair-bundle.jpeg", slug: "product-016" },
  { name: "زيت لتطويل الشعر", saudiRiyal: 18, category: "العناية بالشعر", image: "/product_Images/product-017-hair-growth-oil.jpeg", slug: "product-017" },
  { name: "عسل تسمين", saudiRiyal: 60, category: "العناية بالجسم", image: "/product_Images/product-018-fattening-honey.jpeg", slug: "product-018" },
  { name: "أعشاب التنحيف", saudiRiyal: 38, category: "العناية بالجسم", image: "/product_Images/product-019-slimming-herbs.jpeg", slug: "product-019" },
  { name: "بذور الأنوثة", saudiRiyal: 50, category: "العناية بالجسم", image: "/product_Images/product-020-femininity-seeds.jpeg", slug: "product-020" },
  { name: "سيروم الرموش", saudiRiyal: 11, category: "العناية والجمال", image: "/product_Images/product-021-eyelash-serum.jpeg", slug: "product-021" },
  { name: "بودرة تبييض الأسنان", saudiRiyal: 18, category: "العناية والجمال", image: "/product_Images/product-022-tooth-whitening-powder.jpeg", slug: "product-022" },
  { name: "سيروم الأظافر", saudiRiyal: 18, category: "العناية والجمال", image: "/product_Images/product-023-nail-serum.jpeg", slug: "product-023" },
  { name: "مزيل عرق طبيعي", saudiRiyal: 15, category: "العناية والجمال", image: "/product_Images/product-024-natural-deodorant.jpeg", slug: "product-024" },
  { name: "كحل أثمد", saudiRiyal: 11, category: "العناية والجمال", image: "/product_Images/product-025-ithmid-kohl.jpeg", slug: "product-025" },
];

export const CATEGORIES = ["العناية بالبشرة", "العناية بالشعر", "العناية بالجسم", "العناية والجمال"] as const;
