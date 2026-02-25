"use client";

import { useParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";

type CollectionDoc = {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  description?: string;
  story?: string;
  material?: string;
  quality?: string;
};
type ProductItem = { name: string; price: string; category: string; image: string; slug: string };

const serif = { fontFamily: "var(--font-cormorant), serif" };
const bgWhite = { backgroundColor: "#ffffff" };

const DEFAULT_STORY =
  "Each piece in this collection is designed for the modern journey—rooted in heritage and made to last. We believe in fewer, better things.";
const DEFAULT_MATERIAL =
  "Full-grain leather, ethically sourced. Solid brass hardware. Every detail is considered, from the hide to the finish. Handmade in Cape Town.";
const DEFAULT_QUALITY =
  "Crafted to age beautifully. Reinforced stitching, careful edge finishing, and a commitment to durability without compromise.";

function ProductCard({ name, price, category, image, slug }: ProductItem) {
  return (
    <Link href={`/product/${slug}`} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
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

function Section({
  number,
  title,
  content,
  theme = "light",
}: {
  number: string;
  title: string;
  content: string;
  theme?: "light" | "dark";
}) {
  const isDark = theme === "dark";
  return (
    <section
      className={`py-24 md:py-32 px-6 md:px-12 ${
        isDark ? "bg-neutral-900 text-white" : "bg-white text-black"
      }`}
    >
      <div className="max-w-screen-xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12">
        <div className="md:col-span-3 md:sticky md:top-32 self-start">
          <span
            className={`text-xs font-bold tracking-widest uppercase block mb-2 ${
              isDark ? "text-white/50" : "text-black/40"
            }`}
          >
            {number}
          </span>
          <h2 className="text-2xl md:text-3xl font-light italic" style={serif}>
            {title}
          </h2>
        </div>
        <div className="md:col-span-8 md:col-start-5">
          <p
            className={`text-xl md:text-2xl font-light leading-relaxed whitespace-pre-line ${
              isDark ? "text-white/90" : "text-black/80"
            }`}
            style={serif}
          >
            {content}
          </p>
        </div>
      </div>
    </section>
  );
}

export default function CollectionPage() {
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : "";
  const [collection, setCollection] = useState<CollectionDoc | null>(null);
  const [products, setProducts] = useState<ProductItem[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const fetchCollection = useCallback(() => {
    if (!slug) return Promise.resolve(null);
    return fetch(`/api/collections/${encodeURIComponent(slug)}`).then((res) => {
      if (res.status === 404) throw new Error("Collection not found");
      if (!res.ok) throw new Error("Failed to load collection");
      return res.json();
    });
  }, [slug]);

  const fetchProducts = useCallback(() => {
    if (!slug) return Promise.resolve([]);
    return fetch(`/api/products?collection=${encodeURIComponent(slug)}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load products");
        return res.json();
      })
      .then((data: ProductItem[]) => data);
  }, [slug]);

  useEffect(() => {
    if (!slug) {
      setLoadError("Invalid collection");
      return;
    }
    setCollection(null);
    setProducts(null);
    setLoadError(null);
    Promise.all([fetchCollection(), fetchProducts()])
      .then(([col, prods]) => {
        setCollection(col);
        setProducts(Array.isArray(prods) ? prods : []);
      })
      .catch((err) =>
        setLoadError(err instanceof Error ? err.message : "Something went wrong")
      );
  }, [slug, fetchCollection, fetchProducts]);

  if (loadError) {
    return (
      <main
        className="min-h-screen pt-24 pb-24 flex flex-col items-center justify-center gap-4"
        style={bgWhite}
      >
        <p className="text-neutral-600" style={serif}>
          {loadError}
        </p>
        <Link
          href="/collections"
          className="text-sm underline text-neutral-500 hover:text-black"
        >
          Back to collections
        </Link>
      </main>
    );
  }

  if (collection === null) {
    return (
      <main
        className="min-h-screen pt-24 pb-24 flex items-center justify-center"
        style={bgWhite}
      >
        <p className="text-neutral-500" style={serif}>
          Loading…
        </p>
      </main>
    );
  }

  const productList = products ?? [];
  const storyText =
    collection.story && collection.story.trim()
      ? collection.story
      : DEFAULT_STORY;
  const materialText =
    collection.material && collection.material.trim()
      ? collection.material
      : DEFAULT_MATERIAL;
  const qualityText =
    collection.quality && collection.quality.trim()
      ? collection.quality
      : DEFAULT_QUALITY;

  return (
    <main className="min-h-screen bg-white">
      {/* 1. Hero Section */}
      <section className="relative h-[85vh] w-full bg-neutral-100">
        {collection.image ? (
          <Image
            src={collection.image}
            alt={collection.name}
            fill
            className="object-cover object-center"
            sizes="100vw"
            priority
          />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center text-neutral-400 text-3xl"
            style={serif}
          >
            {collection.name}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 w-full p-8 md:p-16 lg:p-24 flex flex-col justify-end">
          <p className="text-white/80 text-xs uppercase tracking-[0.3em] mb-4">
            Collection
          </p>
          <h1
            className="text-white text-6xl md:text-8xl font-light mb-6"
            style={serif}
          >
            {collection.name}
          </h1>
          {collection.description && (
            <p
              className="text-white/90 text-lg md:text-xl max-w-xl leading-relaxed"
              style={serif}
            >
              {collection.description}
            </p>
          )}
        </div>
      </section>

      {/* 2. Story Section */}
      <Section
        number="01"
        title="The Concept"
        content={storyText}
        theme="light"
      />

      {/* 3. Material Section */}
      <Section
        number="02"
        title="Material & Craft"
        content={materialText}
        theme="light" // Kept light for clean look, could be dark if preferred
      />

      {/* 4. Quality Section */}
      <Section
        number="03"
        title="Our Promise"
        content={qualityText}
        theme="dark"
      />

      {/* 5. Products Section */}
      <section className="py-24 md:py-32 px-6 md:px-12 bg-white">
        <div className="max-w-screen-xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <p className="text-[10px] uppercase tracking-[0.35em] text-gray-500 mb-4">
                Shop
              </p>
              <h2
                className="text-4xl md:text-5xl font-light text-neutral-900"
                style={serif}
              >
                The Collection
              </h2>
            </div>
            <p className="text-neutral-500 text-sm">
              {productList.length}{" "}
              {productList.length === 1 ? "piece" : "pieces"}
            </p>
          </div>

          {productList.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
              {productList.map((p) => (
                <ProductCard
                  key={p.slug}
                  name={p.name}
                  price={p.price}
                  category={p.category}
                  image={p.image}
                  slug={p.slug}
                />
              ))}
            </div>
          ) : (
            <div className="py-24 text-center border-t border-neutral-100">
              <p className="text-neutral-500 mb-4" style={serif}>
                No pieces in this collection yet.
              </p>
              <Link
                href="/shop"
                className="text-sm underline text-black hover:opacity-70"
              >
                Browse all products
              </Link>
            </div>
          )}

          <div className="mt-32 pt-12 border-t border-neutral-100 flex justify-center">
            <Link
              href="/collections"
              className="text-xs uppercase tracking-widest text-neutral-500 hover:text-black transition-colors"
            >
              View all collections
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
