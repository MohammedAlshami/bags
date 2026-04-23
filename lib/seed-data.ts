/**
 * Data used to seed the database (products + landing metadata).
 * Arabic copy aligned with the public site.
 */

import { PRODUCTS } from "./products";
import type { BlogBlock } from "./blog";

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
    image: "",
    description: "طبقات لونية هادئة وخطوط بسيطة.",
  },
  {
    name: "ميزون",
    slug: "maison",
    image: "",
    description: "منتجات مختارة لروتين عصري.",
  },
  {
    name: "سهرة",
    slug: "soiree",
    image: "",
    description: "للمظهر المميز في المناسبات.",
  },
  {
    name: "أوبجكت",
    slug: "object",
    image: "",
    description: "تفاصيل دقيقة ترتقي بيومك.",
  },
  {
    name: "أرشيف",
    slug: "archive",
    image: "",
    description: "لمحات من أسلوب العلامة عبر الزمن.",
  },
  {
    name: "نورديك",
    slug: "nordic",
    image: "",
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

export const SEED_BLOG_POSTS: {
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string;
  authorName: string;
  status: "draft" | "published";
  content: BlogBlock[];
  seoTitle: string;
  seoDescription: string;
  tags: string[];
}[] = [
  {
    title: "كيف تختارين روتين عناية يناسب بشرتك في 5 خطوات",
    slug: "how-to-build-skin-care-routine",
    excerpt:
      "دليل بسيط يساعدك على ترتيب المنتجات الأساسية واختيار ما تحتاجه بشرتك فعلًا دون تعقيد.",
    coverImage: "/social/queen-deep-mask-thumb.jpg",
    authorName: "فريق الملكة جولد",
    status: "published",
    seoTitle: "روتين عناية يناسب بشرتك",
    seoDescription:
      "تعرفي على طريقة عملية لبناء روتين عناية يومي باستخدام الخطوات الأساسية فقط.",
    tags: ["بشرة", "روتين", "نصائح"],
    content: [
      { id: "blog-seed-1-1", type: "heading", level: 2, text: "ابدئي من النوع وليس من العدد" },
      {
        id: "blog-seed-1-2",
        type: "paragraph",
        text:
          "الخطوة الأولى هي فهم احتياج البشرة: هل هي دهنية، جافة، مختلطة، أم حساسة؟ بعد ذلك يصبح اختيار المنتجات أبسط بكثير.",
      },
      {
        id: "blog-seed-1-3",
        type: "callout",
        tone: "accent",
        text: "أضيفي منتجًا واحدًا جديدًا كل مرة، ثم راقبي الاستجابة لمدة أسبوعين على الأقل.",
      },
      {
        id: "blog-seed-1-4",
        type: "list",
        ordered: true,
        items: [
          "غسول لطيف",
          "سيروم أو علاج مناسب",
          "مرطب",
          "واقي شمس صباحًا",
          "مقشر خفيف مرة أو مرتين أسبوعيًا",
        ],
      },
    ],
  },
  {
    title: "أفضل 3 أخطاء تجعل العناية بالشعر أقل فاعلية",
    slug: "hair-care-mistakes",
    excerpt:
      "بعض التفاصيل الصغيرة في الاستخدام قد تمنعك من ملاحظة نتائج واضحة حتى مع المنتجات الجيدة.",
    coverImage: "/social/queen-cream-whitening-thumb.jpg",
    authorName: "فريق الملكة جولد",
    status: "published",
    seoTitle: "أخطاء شائعة في العناية بالشعر",
    seoDescription:
      "تعرفي على أكثر الأخطاء الشائعة في روتين الشعر وكيف تتجنبينها لتحصلي على نتائج أفضل.",
    tags: ["شعر", "نصائح", "روتين"],
    content: [
      {
        id: "blog-seed-2-1",
        type: "paragraph",
        text:
          "كثير من الناس يغيّرون المنتجات بسرعة بدل إعطاء كل منتج وقتًا كافيًا ليظهر أثره، وهذا يجعل التقييم صعبًا.",
      },
      { id: "blog-seed-2-2", type: "divider" },
      {
        id: "blog-seed-2-3",
        type: "heading",
        level: 2,
        text: "ركّزي على الفروة ثم الأطراف",
      },
      {
        id: "blog-seed-2-4",
        type: "quote",
        text: "الشعر الصحي يبدأ من فروة صحية، ثم من عناية متوازنة بالأطراف.",
        citation: "ملاحظة تحريرية",
      },
      {
        id: "blog-seed-2-5",
        type: "image",
        src: "/social/queen-bridal-box-thumb.jpg",
        alt: "روتين عناية",
        caption: "صورة توضيحية لروتين عناية متكامل.",
      },
    ],
  },
  {
    title: "متى تستخدمين المقشر ومتى تتوقفين عنه",
    slug: "when-to-use-exfoliator",
    excerpt:
      "المقشر مفيد عندما يستخدم بالطريقة الصحيحة، لكنه قد يسبب مشاكل إذا كان جزءًا مكررًا من الروتين اليومي.",
    coverImage: "/social/queen-deep-mask-thumb.jpg",
    authorName: "فريق الملكة جولد",
    status: "published",
    seoTitle: "متى تستخدمين المقشر",
    seoDescription:
      "مقال يوضح الاستخدام الصحيح للمقشر ومتى يكون من الأفضل التوقف أو تقليل التكرار.",
    tags: ["تقشير", "بشرة", "دليل"],
    content: [
      {
        id: "blog-seed-3-1",
        type: "paragraph",
        text:
          "المقشر ليس منتجًا يوميًا بالضرورة. الاستخدام الزائد قد يضعف الحاجز الطبيعي للبشرة ويزيد الحساسية.",
      },
      {
        id: "blog-seed-3-2",
        type: "callout",
        tone: "warning",
        text: "إذا لاحظتِ احمرارًا مستمرًا أو شدًا بعد التقشير، خففي عدد المرات أو أوقفيه مؤقتًا.",
      },
      {
        id: "blog-seed-3-3",
        type: "list",
        ordered: false,
        items: [
          "لبشرة حساسة: مرة أسبوعيًا",
          "لبشرة مختلطة: مرة إلى مرتين أسبوعيًا",
          "لبشرة دهنية: بحسب التحمل والاستجابة",
        ],
      },
    ],
  },
];

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
