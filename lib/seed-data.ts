/**
 * Data used to seed the carol_Bouwer database (products + landing page).
 * Matches current landing page and shop content.
 */

import { PRODUCTS } from "./products";

export const SEED_COLLECTIONS = [
  { name: "Essentials", slug: "essentials", image: "", description: "Foundational pieces for every day." },
  { name: "Winter Edit", slug: "winter-edit", image: "/Item pictures/2nd_Green_Bag-removebg-preview.png", description: "A study in monochromatic layering and architectural silhouettes." },
  { name: "Maison", slug: "maison", image: "/Item pictures/basket_bag-removebg-preview.png", description: "Foundational pieces crafted for the modern global citizen." },
  { name: "Soirée", slug: "soiree", image: "/Item pictures/Black_bag-removebg-preview.png", description: "Evening wear redefined through precise tailoring." },
  { name: "Object", slug: "object", image: "/Item pictures/Blue_bag-removebg-preview.png", description: "Sculptural hardware and leather goods for daily elevation." },
  { name: "Archive", slug: "archive", image: "/Item pictures/orange_bag-removebg-preview.png", description: "A retrospective of the silhouettes that defined our house." },
  { name: "Nordic", slug: "nordic", image: "/Item pictures/snake_skin_bag-removebg-preview.png", description: "Inspired by the raw textures of Northern landscapes." },
];

/** Map product category to collection slug. Every product must link to a collection. */
export const CATEGORY_TO_COLLECTION_SLUG: Record<string, string> = {
  Handbags: "essentials",
  Travel: "archive",
  Evening: "soiree",
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
    title: "Carol Bouwer",
    subtitle:
      "Handcrafted in South Africa using the finest ethically sourced leathers. A tribute to heritage and style.",
    ctaText: "Discover the collection →",
    ctaHref: "#shop",
    videoSrc: "/8798403-uhd_4096_2160_25fps.mp4",
  },
  carousel: {
    sectionTitle: "Fall colors",
    sectionSubtitle: "Collections",
    items: [
      {
        title: "Winter Edit",
        category: "Collection",
        year: "2025",
        desc: "A study in monochromatic layering and architectural silhouettes.",
        image: "/Item pictures/2nd_Green_Bag-removebg-preview.png",
      },
      {
        title: "Maison",
        category: "Essentials",
        year: "2025",
        desc: "Foundational pieces crafted for the modern global citizen.",
        image: "/Item pictures/basket_bag-removebg-preview.png",
      },
      {
        title: "Soirée",
        category: "Limited",
        year: "2025",
        desc: "Evening wear redefined through precise tailoring.",
        image: "/Item pictures/Black_bag-removebg-preview.png",
      },
      {
        title: "Object",
        category: "Accessories",
        year: "2024",
        desc: "Sculptural hardware and leather goods for daily elevation.",
        image: "/Item pictures/Blue_bag-removebg-preview.png",
      },
      {
        title: "Archive",
        category: "Heritage",
        year: "2024",
        desc: "A retrospective of the silhouettes that defined our house.",
        image: "/Item pictures/orange_bag-removebg-preview.png",
      },
      {
        title: "Nordic",
        category: "Seasonal",
        year: "2025",
        desc: "Inspired by the raw textures of Northern landscapes.",
        image: "/Item pictures/snake_skin_bag-removebg-preview.png",
      },
    ],
  },
  banner: {
    imagePath: "/Pixalated.png",
    headline: "Carry the moment.",
  },
  navImages: [
    "/Item pictures/2nd_Green_Bag-removebg-preview.png",
    "/Item pictures/basket_bag-removebg-preview.png",
    "/Item pictures/Black_bag-removebg-preview.png",
  ],
};
