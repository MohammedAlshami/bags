"use client";

import Link from "next/link";
import { useMemo } from "react";
import { SafeImage } from "@/app/components/SafeImage";
import { useCart } from "@/app/context/CartContext";
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
  /** 0–5; shown on the image chip, defaults to 5.0 */
  rating?: number | null;
};

function StarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

function ProductCard({ item }: { item: FeaturedProductItem }) {
  const { addToCart } = useCart();
  const size = Array.isArray(item.sizes) && item.sizes.length > 0 ? item.sizes[0] : null;
  const priceLine = size ? formatSizePrice(size) : formatDualPrice(item.price, item.oldRiyal);
  const rawRating = item.rating ?? 5;
  const rating = Math.min(5, Math.max(0, Number.isFinite(rawRating) ? rawRating : 5));
  const ratingText = rating.toFixed(1);

  const productHref = `/product/${item.slug}`;

  const handleAddToCart = () => {
    addToCart({
      slug: item.slug,
      name: size ? `${item.name} - ${size.label}` : item.name,
      price: size ? `${size.sarPrice} ر.س` : item.price,
      image: item.image,
    });
  };

  return (
    <div className="group flex flex-col" dir="rtl" style={sans}>
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-white">
        <Link href={productHref} className="absolute inset-0 z-0 block" aria-label={item.name}>
          <SafeImage
            src={item.image}
            alt={item.name}
            fill
            className="object-cover object-center transition-transform duration-300 group-hover:scale-[1.03]"
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        </Link>
        <div
          className="pointer-events-none absolute right-2 top-2 z-10 flex items-center gap-1 rounded-full bg-white px-2 py-0.5"
          dir="ltr"
          role="img"
          aria-label={`تقييم ${ratingText} من 5`}
        >
          <StarIcon className="size-3.5 shrink-0 text-amber-500" />
          <span className="text-[12px] font-semibold tabular-nums text-neutral-900">{ratingText}</span>
        </div>
        <div className="pointer-events-none absolute inset-x-2 bottom-3 z-20 opacity-0 transition-opacity duration-300 group-hover:pointer-events-auto group-hover:opacity-100">
          <button
            type="button"
            onClick={handleAddToCart}
            className="pointer-events-auto inline-flex h-10 min-h-10 w-full cursor-pointer items-center justify-center rounded-full border-[1.5px] border-brand-primary bg-white px-5 text-[13px] font-semibold text-brand-primary transition-colors hover:border-brand-dark hover:bg-brand-dark hover:text-white"
            style={sans}
          >
            أضف إلى السلة
          </button>
        </div>
      </div>
      <Link
        href={productHref}
        className="mt-4 flex flex-col items-start gap-1 text-right text-inherit no-underline"
        style={sans}
      >
        <span className="inline-flex w-fit max-w-full items-center rounded-full border border-neutral-200 bg-white px-2.5 py-0.5 text-xs text-neutral-600 transition-colors hover:bg-neutral-100">
          {item.category}
        </span>
        <span className="line-clamp-2 text-sm font-semibold text-neutral-900">{item.name}</span>
        <span className="text-sm text-neutral-900">{priceLine}</span>
      </Link>
    </div>
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
