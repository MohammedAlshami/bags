export type Product = {
  name: string;
  price: string;
  category: string;
  image: string;
  slug: string;
};

/** Seeded catalog — Arabic copy, prices in ر.س, images under /public */
export const PRODUCTS: Product[] = [
  {
    name: "خلطة أعشاب طبيعية",
    price: "242.00 ر.س",
    category: "أعشاب",
    image: "/losing_weigh_herbs.png",
    slug: "signature-tote",
  },
  {
    name: "تونر أساسي",
    price: "189.00 ر.س",
    category: "زيوت",
    image: "/Item pictures/basket_bag-removebg-preview.png",
    slug: "leather-crossbody",
  },
  {
    name: "سيروم نضارة البشرة",
    price: "119.00 ر.س",
    category: "سيروم",
    image: "/Item pictures/Black_bag-removebg-preview.png",
    slug: "travel-weekender",
  },
  {
    name: "كريم بيو ريتينول",
    price: "207.00 ر.س",
    category: "كريم",
    image: "/Item pictures/Blue_bag-removebg-preview.png",
    slug: "evening-clutch",
  },
  {
    name: "حقيبة يومية كلاسيكية",
    price: "298.00 ر.س",
    category: "عناية",
    image: "/Item pictures/2nd_Green_Bag-removebg-preview.png",
    slug: "classic-satchel",
  },
  {
    name: "ماسك ترطيب عميق",
    price: "165.00 ر.س",
    category: "ماسك",
    image: "/Item pictures/orange_bag-removebg-preview.png",
    slug: "leather-bucket-bag",
  },
  {
    name: "سيروم فيتامين سي",
    price: "210.00 ر.س",
    category: "سيروم",
    image: "/Item pictures/snake_skin_bag-removebg-preview.png",
    slug: "structured-shoulder",
  },
  {
    name: "غسول لطيف للوجه",
    price: "95.00 ر.س",
    category: "تنظيف",
    image: "/losing_weigh_herbs.png",
    slug: "mini-tote",
  },
  {
    name: "زيت أرغان للبشرة",
    price: "178.00 ر.س",
    category: "زيوت",
    image: "/Item pictures/basket_bag-removebg-preview.png",
    slug: "city-crossbody",
  },
  {
    name: "مجموعة سفر للعناية",
    price: "349.00 ر.س",
    category: "مجموعات",
    image: "/Item pictures/Black_bag-removebg-preview.png",
    slug: "overnight-bag",
  },
  {
    name: "كريم ليلي مجدد",
    price: "156.00 ر.س",
    category: "كريم",
    image: "/Item pictures/Blue_bag-removebg-preview.png",
    slug: "evening-mini",
  },
  {
    name: "تونر مهدئ بالورد",
    price: "132.00 ر.س",
    category: "تونر",
    image: "/Item pictures/2nd_Green_Bag-removebg-preview.png",
    slug: "woven-tote",
  },
];

export const CATEGORIES = [
  "أعشاب",
  "زيوت",
  "سيروم",
  "كريم",
  "عناية",
  "ماسك",
  "تنظيف",
  "مجموعات",
  "تونر",
] as const;
