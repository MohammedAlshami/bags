"use client";

import Link from "next/link";
import Image from "next/image";
import { CarouselSection } from "./CarouselSection";
import { CategoryGridSection } from "./CategoryGridSection";

const IMAGES = {
  tote: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=85&fit=crop",
  crossbody: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&q=85&fit=crop",
  weekender: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=85&fit=crop",
  satchel: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=85&fit=crop",
  bucket: "https://images.unsplash.com/photo-1591561954657-c8b331b96b52?w=800&q=85&fit=crop",
  shoulder: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=85&fit=crop",
};

// Collection banner background image (in public folder)
const COLLECTION_BANNER_IMAGE = "/Pixalated.png";

const PRODUCTS = [
  // Row 1
  { name: "The Signature Tote", price: "$1,280", category: "Handbags", image: IMAGES.tote, slug: "signature-tote" },
  { name: "Leather Crossbody", price: "$980", category: "Handbags", image: IMAGES.crossbody, slug: "leather-crossbody" },
  { name: "Travel Weekender", price: "$1,450", category: "Travel", image: IMAGES.weekender, slug: "travel-weekender" },
  { name: "Evening Clutch", price: "$720", category: "Evening", image: IMAGES.tote, slug: "evening-clutch" },
  // Row 2
  { name: "Classic Satchel", price: "$1,120", category: "Handbags", image: IMAGES.satchel, slug: "classic-satchel" },
  { name: "Leather Bucket Bag", price: "$890", category: "Handbags", image: IMAGES.bucket, slug: "leather-bucket-bag" },
  { name: "Structured Shoulder", price: "$1,050", category: "Handbags", image: IMAGES.shoulder, slug: "structured-shoulder" },
  { name: "Mini Tote", price: "$650", category: "Handbags", image: IMAGES.tote, slug: "mini-tote" },
  // Row 3
  { name: "City Crossbody", price: "$780", category: "Handbags", image: IMAGES.crossbody, slug: "city-crossbody" },
  { name: "Overnight Bag", price: "$1,380", category: "Travel", image: IMAGES.weekender, slug: "overnight-bag" },
  { name: "Evening Mini", price: "$580", category: "Evening", image: IMAGES.bucket, slug: "evening-mini" },
  { name: "Woven Tote", price: "$920", category: "Handbags", image: IMAGES.shoulder, slug: "woven-tote" },
];

const serif = { fontFamily: "var(--font-cormorant), serif" };
const bgWhite = { backgroundColor: "#ffffff" };

function ProductCard({
  name,
  price,
  category,
  image,
  slug,
  className = "",
  imageClass = "aspect-[3/4]",
}: {
  name: string;
  price: string;
  category: string;
  image: string;
  slug: string;
  className?: string;
  imageClass?: string;
}) {
  return (
    <Link href={`/product/${slug}`} className={`group block ${className}`}>
      <div className={`relative overflow-hidden ${imageClass}`}>
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      </div>
      <div className="mt-4 flex flex-col gap-0.5">
        <span className="text-[10px] uppercase tracking-[0.2em] text-gray-500">{category}</span>
        <span className="text-sm font-medium text-black/90">{name}</span>
        <span className="text-sm text-black/60">{price}</span>
      </div>
    </Link>
  );
}

export function ProductsSection() {
  return (
    <section className="pt-6 pb-24 md:pt-8 md:pb-32" style={bgWhite} aria-label="Products">
      {/* Carousel first */}
      <CarouselSection />
      {/* Banner with same inset as navbar / carousel */}
      <div className="mx-10 md:mx-20">
        <div className="relative aspect-[21/9] w-full overflow-hidden md:aspect-[3/1]">
          <Image
            src={COLLECTION_BANNER_IMAGE}
            alt="The Collection — Carry the moment"
            fill
            className="object-cover object-[50%_88%]"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <div className="text-center text-white">
              <h2 className="text-4xl font-light md:text-6xl" style={serif}>
                Carry the moment.
              </h2>
            </div>
          </div>
        </div>
      </div>
      {/* Category grid (white-framed images, yellow labels) */}
      <CategoryGridSection />
      {/* Product grid — same width as category cards above */}
      <div className="mx-10 mt-20 md:mx-20">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {PRODUCTS.map((p) => (
            <ProductCard key={p.name} name={p.name} price={p.price} category={p.category} image={p.image} slug={p.slug} />
          ))}
        </div>
      </div>
    </section>
  );
}
