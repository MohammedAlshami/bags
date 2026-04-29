"use client";

import Link from "next/link";
import { useMemo } from "react";
import { SafeImage } from "@/app/components/SafeImage";
import { formatDualPrice, formatSizePrice, type ProductSizePrice } from "@/lib/price-format";
import { sans, pagePaddingX } from "@/lib/page-theme";

export type FeaturedProductItem = {
  slug: string;
  image: string;
  category: string;
  name: string;
  price: string;
  oldRiyal?: number | null;
  sizes?: ProductSizePrice[] | null;
};

function ProductCard({ item }: { item: FeaturedProductItem }) {
  const size = Array.isArray(item.sizes) && item.sizes.length > 0 ? item.sizes[0] : null;
  const priceLine = size ? formatSizePrice(size) : formatDualPrice(item.price, item.oldRiyal);
  return (
    <Link href={`/product/${item.slug}`} className="group flex flex-col" dir="rtl" style={sans}>
      <div className="relative aspect-[3/5] w-full overflow-hidden rounded-2xl bg-white">
        <SafeImage
          src={item.image}
          alt={item.name}
          fill
          className="object-cover object-center transition-transform duration-300 group-hover:scale-[1.03]"
          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
      </div>
      <div className="mt-4 flex flex-col gap-1 text-right">
        <span className="text-xs text-neutral-500">{item.category}</span>
        <span className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold text-neutral-900">{item.name}</span>
        <span className="text-sm text-neutral-900">{priceLine}</span>
      </div>
      <span className="mt-3 flex h-[34px] w-full items-center justify-center rounded-full bg-brand-primary text-[12px] font-semibold text-white transition-colors group-hover:bg-brand-dark">
        تفاصيل المنتج
      </span>
    </Link>
  );
}

export function FeaturedProductsClient({ products }: { products: FeaturedProductItem[] }) {
  const filteredProducts = useMemo(() => (products.length === 0 ? [] : products.slice(0, 8)), [products]);

  return (
    <section
      id="shop"
      className="w-full bg-white py-6 md:py-8"
      aria-label="منتجات مميزة"
      dir="rtl"
    >
      <div className={`mx-auto w-full max-w-[1600px] ${pagePaddingX}`}>
        <div className="mb-6 flex w-full flex-col gap-3 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="qgb-h2-section" style={sans}>
            مميز — مختارات الموسم
          </h2>
          <Link
            href="/shop"
            className="qgb-btn-outline w-fit"
            style={sans}
            prefetch
          >
            عرض الكل
          </Link>
        </div>

        {filteredProducts.length === 0 ? (
          <p className="text-center text-[13px] text-caption" style={sans}>
            لا توجد منتجات لعرضها.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-5 lg:grid-cols-4 lg:gap-6">
            {filteredProducts.map((item) => (
              <ProductCard key={item.slug} item={item} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
