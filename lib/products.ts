export const IMAGES = {
  tote: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=85&fit=crop",
  crossbody: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&q=85&fit=crop",
  weekender: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=85&fit=crop",
  satchel: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=85&fit=crop",
  bucket: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=85&fit=crop",
  shoulder: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=85&fit=crop",
  eveningMini: "https://i.ebayimg.com/images/g/6t4AAOSwtBlkCZ5i/s-l1200.jpg",
} as const;

export type Product = {
  name: string;
  price: string;
  category: string;
  image: string;
  slug: string;
};

export const PRODUCTS: Product[] = [
  { name: "The Signature Tote", price: "$1,280", category: "Handbags", image: IMAGES.tote, slug: "signature-tote" },
  { name: "Leather Crossbody", price: "$980", category: "Handbags", image: IMAGES.crossbody, slug: "leather-crossbody" },
  { name: "Travel Weekender", price: "$1,450", category: "Travel", image: IMAGES.weekender, slug: "travel-weekender" },
  { name: "Evening Clutch", price: "$720", category: "Evening", image: IMAGES.tote, slug: "evening-clutch" },
  { name: "Classic Satchel", price: "$1,120", category: "Handbags", image: IMAGES.satchel, slug: "classic-satchel" },
  { name: "Leather Bucket Bag", price: "$890", category: "Handbags", image: IMAGES.bucket, slug: "leather-bucket-bag" },
  { name: "Structured Shoulder", price: "$1,050", category: "Handbags", image: IMAGES.shoulder, slug: "structured-shoulder" },
  { name: "Mini Tote", price: "$650", category: "Handbags", image: IMAGES.tote, slug: "mini-tote" },
  { name: "City Crossbody", price: "$780", category: "Handbags", image: IMAGES.crossbody, slug: "city-crossbody" },
  { name: "Overnight Bag", price: "$1,380", category: "Travel", image: IMAGES.weekender, slug: "overnight-bag" },
  { name: "Evening Mini", price: "$580", category: "Evening", image: IMAGES.eveningMini, slug: "evening-mini" },
  { name: "Woven Tote", price: "$920", category: "Handbags", image: IMAGES.shoulder, slug: "woven-tote" },
];

export const CATEGORIES = ["Handbags", "Travel", "Evening"] as const;
