"use client";

import Link from "next/link";
import { useMemo } from "react";
import { SafeImage } from "@/app/components/SafeImage";

export type FeaturedProductItem = {
  slug: string;
  image: string;
  category: string;
  name: string;
  price: string;
};

function ProductCard({ item }: { item: FeaturedProductItem }) {
  return (
    <Link href={`/product/${item.slug}`} className="group flex flex-col">
      <div className="relative aspect-[3/5] w-full overflow-hidden rounded-xl bg-white">
        <SafeImage
          src={item.image}
          alt={item.name}
          fill
          className="object-cover object-center transition-transform duration-300 group-hover:scale-[1.03]"
          sizes="(max-width: 768px) 50vw, 25vw"
        />
      </div>
      <div className="mt-4 flex flex-col gap-1 text-center">
        <span className="text-xs text-neutral-500">{item.category}</span>
        <span className="text-sm font-semibold text-neutral-900">{item.name}</span>
        <span className="text-sm text-neutral-900">{item.price}</span>
      </div>
    </Link>
  );
}

export function FeaturedProductsClient({ products }: { products: FeaturedProductItem[] }) {
  const filteredProducts = useMemo(() => (products.length === 0 ? [] : products.slice(0, 8)), [products]);

  return (
    <section className="w-full bg-white py-12 md:py-16" aria-label="منتجات مميزة" dir="rtl">
      <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12">
        <div className="mb-10 flex w-full justify-start">
          <h2 className="max-w-2xl text-left text-xl font-normal leading-snug italic text-neutral-800 md:text-2xl">
            <span>مختاراتنا </span>
            <span>لموسم العطلات</span>
          </h2>
        </div>

        {filteredProducts.length === 0 ? (
          <p className="text-center text-sm text-neutral-500">لا توجد منتجات لعرضها.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 md:gap-5 lg:gap-6">
            {filteredProducts.map((item) => (
              <ProductCard key={item.slug} item={item} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
