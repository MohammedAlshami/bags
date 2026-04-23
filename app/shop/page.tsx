"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Sparkles } from "lucide-react";
import { SafeImage } from "@/app/components/SafeImage";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import { CATEGORIES, PRODUCTS, type Product } from "@/lib/products";
import { sans, pagePaddingX } from "@/lib/page-theme";

function ProductCard({ product }: { product: Product }) {
  const { name, price, category, image, slug } = product;
  return (
    <Link href={`/product/${slug}`} className="group flex flex-col" dir="rtl">
      <div className="relative aspect-[3/5] w-full overflow-hidden rounded-2xl bg-white">
        <SafeImage
          src={image}
          alt={name}
          fill
          className="object-cover object-center transition-transform duration-300 group-hover:scale-[1.03]"
          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
        />
      </div>
      <div className="mt-4 flex flex-col gap-1 text-center">
        <span className="text-xs text-neutral-500" style={sans}>
          {category}
        </span>
        <span className="text-sm font-semibold text-neutral-900" style={sans}>
          {name}
        </span>
        <span className="text-sm text-neutral-900" style={sans}>
          {price}
        </span>
      </div>
    </Link>
  );
}

function CategoryHeader({ category }: { category: string }) {
  return (
    <div className="mb-5 w-full overflow-hidden rounded-3xl bg-[#d44c7d] px-5 py-4 md:px-6 md:py-5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Sparkles className="h-4 w-4 shrink-0 text-white" aria-hidden />
          <h2 className="text-xl font-black tracking-wide text-white md:text-2xl" style={sans}>
            {category}
          </h2>
        </div>
      </div>
    </div>
  );
}

function CategorySection({ category, products }: { category: string; products: Product[] }) {
  return (
    <section className="mb-10">
      <CategoryHeader category={category} />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-5 lg:grid-cols-4 lg:gap-6 xl:grid-cols-5">
        {products.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>
    </section>
  );
}

export default function ShopPage() {
  const productsByCategory = useMemo(
    () =>
      Object.fromEntries(
        CATEGORIES.map((category) => [category, PRODUCTS.filter((product) => product.category === category)])
      ) as Record<(typeof CATEGORIES)[number], Product[]>,
    []
  );

  return (
    <main className="min-h-screen bg-white pb-24 pt-24 transition-colors md:pb-32 md:pt-32" dir="rtl">
      <div className={`mx-auto max-w-[1920px] ${pagePaddingX}`}>
        <Breadcrumbs items={[{ label: "الرئيسية", href: "/" }, { label: "المتجر" }]} />
        {CATEGORIES.map((category) => (
          <CategorySection key={category} category={category} products={productsByCategory[category]} />
        ))}
      </div>
    </main>
  );
}
