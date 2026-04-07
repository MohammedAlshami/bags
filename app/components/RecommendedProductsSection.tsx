"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { sans } from "@/lib/page-theme";

type RecProduct = { name: string; price: string; category: string; image: string; slug: string };

function parseRecommended(data: unknown, excludeSlug: string): RecProduct[] {
  if (!Array.isArray(data)) return [];
  const out: RecProduct[] = [];
  for (const item of data) {
    if (typeof item !== "object" || item === null) continue;
    const o = item as Record<string, unknown>;
    const slug = o.slug;
    if (typeof slug !== "string" || slug === excludeSlug) continue;
    const name = o.name;
    if (typeof name !== "string") continue;
    out.push({
      name,
      slug,
      price: String(o.price ?? ""),
      category: String(o.category ?? ""),
      image: String(o.image ?? ""),
    });
    if (out.length >= 4) break;
  }
  return out;
}

function ProductCard({ product }: { product: RecProduct }) {
  return (
    <Link href={`/product/${product.slug}`} className="group flex flex-col">
      <div className="relative aspect-[3/5] w-full overflow-hidden rounded-2xl bg-white">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover object-center transition-transform duration-300 group-hover:scale-[1.03]"
          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
      </div>
      <div className="mt-4 flex flex-col gap-1 text-center">
        <span className="text-xs text-neutral-500" style={sans}>
          {product.category}
        </span>
        <span className="text-sm font-semibold text-neutral-900" style={sans}>
          {product.name}
        </span>
        <span className="text-sm text-neutral-900" style={sans}>
          {product.price}
        </span>
      </div>
    </Link>
  );
}

export function RecommendedProductsSection({ excludeSlug }: { excludeSlug: string }) {
  const [items, setItems] = useState<RecProduct[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/products")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || data === null) return;
        setItems(parseRecommended(data, excludeSlug));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [excludeSlug]);

  if (items.length === 0) return null;

  return (
    <section className="border-t border-neutral-200/80 bg-white py-16 md:py-24" aria-label="منتجات مقترحة" dir="rtl">
      <div className="mx-auto max-w-[1920px] px-4 sm:px-8 md:px-14 lg:px-24">
        <h2
          className="text-center text-xl font-medium leading-snug text-neutral-900 md:text-2xl"
          style={sans}
        >
          قد يعجبك أيضاً
        </h2>
        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5 lg:gap-6">
          {items.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
