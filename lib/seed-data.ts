/**
 * Data used to seed the database (products + landing metadata).
 * Arabic copy aligned with the public site.
 */

import { PRODUCTS } from "./products";

/** بيانات العميل التجريبي (اسم الدخول يبقى customer). */
export const SEED_CUSTOMER_PROFILE = {
  email: "customer@example.com",
  fullName: "عميل تجريبي",
  address:
    "شارع الملك عبدالعزيز، حي النخيل\nالرياض ١٢٣٤٥\nالمملكة العربية السعودية",
  phone: "+966 50 123 4567",
};

/** عنوان الشحن الافتراضي في الطلبات التجريبية */
export const SEED_SHIPPING_ADDRESS = {
  fullName: "عميل تجريبي",
  line1: "شارع الملك عبدالعزيز، حي النخيل",
  line2: "",
  city: "الرياض",
  state: "منطقة الرياض",
  postCode: "12345",
  country: "المملكة العربية السعودية",
};

export const SEED_COLLECTIONS = [
  {
    name: "أساسيات",
    slug: "essentials",
    image: "",
    description: "قطع أساسية للعناية اليومية.",
  },
  {
    name: "تعديل شتوي",
    slug: "winter-edit",
    image: "/Item pictures/2nd_Green_Bag-removebg-preview.png",
    description: "طبقات لونية هادئة وخطوط بسيطة.",
  },
  {
    name: "ميزون",
    slug: "maison",
    image: "/Item pictures/basket_bag-removebg-preview.png",
    description: "منتجات مختارة لروتين عصري.",
  },
  {
    name: "سهرة",
    slug: "soiree",
    image: "/Item pictures/Black_bag-removebg-preview.png",
    description: "للمظهر المميز في المناسبات.",
  },
  {
    name: "أوبجكت",
    slug: "object",
    image: "/Item pictures/Blue_bag-removebg-preview.png",
    description: "تفاصيل دقيقة ترتقي بيومك.",
  },
  {
    name: "أرشيف",
    slug: "archive",
    image: "/Item pictures/orange_bag-removebg-preview.png",
    description: "لمحات من أسلوب العلامة عبر الزمن.",
  },
  {
    name: "نورديك",
    slug: "nordic",
    image: "/Item pictures/snake_skin_bag-removebg-preview.png",
    description: "إلهام من الطبيعة الهادئة.",
  },
];

/** Map product category to collection slug. Every product must link to a collection. */
export const CATEGORY_TO_COLLECTION_SLUG: Record<string, string> = {
  أعشاب: "essentials",
  زيوت: "essentials",
  سيروم: "archive",
  كريم: "soiree",
  عناية: "maison",
  ماسك: "winter-edit",
  تنظيف: "essentials",
  مجموعات: "archive",
  تونر: "object",
};

const DEFAULT_COLLECTION_SLUG = "essentials";

export const SEED_PRODUCTS = PRODUCTS.map((p) => ({
  name: p.name,
  price: p.price,
  category: p.category,
  image: p.image,
  slug: p.slug,
  collectionSlug: CATEGORY_TO_COLLECTION_SLUG[p.category] ?? DEFAULT_COLLECTION_SLUG,
}));

export const SEED_LANDING = {
  type: "landing",
  hero: {
    title: "الملكة جولد",
    subtitle:
      "صُنعت بعناية من أجود المكوّنات. تحية للتراث والأناقة والعناية الحقيقية.",
    ctaText: "اكتشف المجموعة ←",
    ctaHref: "#shop",
    videoSrc: "/8798403-uhd_4096_2160_25fps.mp4",
  },
  carousel: {
    sectionTitle: "ألوان الموسم",
    sectionSubtitle: "المجموعات",
    items: [
      {
        title: "تعديل شتوي",
        category: "مجموعة",
        year: "٢٠٢٥",
        desc: "طبقات لونية هادئة وخطوط بسيطة.",
        image: "/Item pictures/2nd_Green_Bag-removebg-preview.png",
      },
      {
        title: "ميزون",
        category: "أساسيات",
        year: "٢٠٢٥",
        desc: "منتجات مختارة لروتين عصري.",
        image: "/Item pictures/basket_bag-removebg-preview.png",
      },
      {
        title: "سهرة",
        category: "محدود",
        year: "٢٠٢٥",
        desc: "للمظهر المميز في المناسبات.",
        image: "/Item pictures/Black_bag-removebg-preview.png",
      },
      {
        title: "أوبجكت",
        category: "إكسسوارات",
        year: "٢٠٢٤",
        desc: "تفاصيل دقيقة ترتقي بيومك.",
        image: "/Item pictures/Blue_bag-removebg-preview.png",
      },
      {
        title: "أرشيف",
        category: "تراث",
        year: "٢٠٢٤",
        desc: "لمحات من أسلوب العلامة عبر الزمن.",
        image: "/Item pictures/orange_bag-removebg-preview.png",
      },
      {
        title: "نورديك",
        category: "موسمي",
        year: "٢٠٢٥",
        desc: "إلهام من الطبيعة الهادئة.",
        image: "/Item pictures/snake_skin_bag-removebg-preview.png",
      },
    ],
  },
  banner: {
    imagePath: "/Pixalated.png",
    headline: "احملي اللحظة.",
  },
  navImages: [
    "/Item pictures/2nd_Green_Bag-removebg-preview.png",
    "/Item pictures/basket_bag-removebg-preview.png",
    "/Item pictures/Black_bag-removebg-preview.png",
  ],
};
