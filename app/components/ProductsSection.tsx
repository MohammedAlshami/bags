"use client";

import Link from "next/link";
import Image from "next/image";
import { CarouselSection } from "./CarouselSection";

export type ProductItem = { name: string; price: string; category: string; image: string; slug: string };

// Collection banner background image (in public folder)
const COLLECTION_BANNER_IMAGE = "/Pixalated.png";

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

export function ProductsSection({ products }: { products: ProductItem[] }) {
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
          <div
            className="absolute inset-2 border-4 pointer-events-none"
            style={{ borderColor: "#facc15" }}
            aria-hidden
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
      {/* Product grid */}
      <div className="mx-10 mt-20 md:mx-20">
        <div className="mb-8">
          <p className="text-[10px] uppercase tracking-[0.35em] text-gray-500">Handbags &amp; accessories</p>
          <h2 className="mt-2 text-3xl font-light text-neutral-900 md:text-4xl" style={serif}>
            Shop the collection
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.slug} name={p.name} price={p.price} category={p.category} image={p.image} slug={p.slug} />
          ))}
        </div>
      </div>
    </section>
  );
}
