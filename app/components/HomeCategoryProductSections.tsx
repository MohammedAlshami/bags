"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { FeaturedProductCard, type FeaturedProductItem } from "./FeaturedProductsClient";
import { sans, pagePaddingX } from "@/lib/page-theme";

export type HomeCategorySectionData = {
  categoryId: string;
  categoryName: string;
  products: FeaturedProductItem[];
};

type HomeCategoryProductSectionsProps = {
  sections: HomeCategorySectionData[];
};

const ARROW_BTN =
  "inline-flex size-10 items-center justify-center rounded-full border-[1.5px] border-brand-primary bg-white text-brand-primary transition-colors hover:bg-brand-light disabled:pointer-events-none disabled:opacity-35";

function CategoryProductCarousel({
  categoryId,
  categoryName,
  headingId,
  products,
  shopHref,
}: {
  categoryId: string;
  categoryName: string;
  headingId: string;
  products: FeaturedProductItem[];
  shopHref: string;
}) {
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [index, setIndex] = useState(0);

  const n = products.length;

  useEffect(() => {
    setIndex((i) => Math.min(i, Math.max(0, n - 1)));
  }, [n, categoryId]);

  const scrollTo = useCallback(
    (i: number) => {
      if (n === 0) return;
      const next = Math.max(0, Math.min(i, n - 1));
      setIndex(next);
      cardRefs.current[next]?.scrollIntoView({ behavior: "smooth", inline: "nearest", block: "nearest" });
    },
    [n]
  );

  const goNext = useCallback(() => scrollTo(index + 1), [index, scrollTo]);
  const goPrev = useCallback(() => scrollTo(index - 1), [index, scrollTo]);

  if (n === 0) return null;

  return (
    <>
      <div className="mb-6 flex w-full flex-col gap-3 border-b border-neutral-100 pb-5 sm:mb-7 sm:flex-row sm:items-end sm:justify-between sm:pb-6">
        <div className="min-w-0 space-y-1">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-brand-primary/80" style={sans}>
            تسوقي حسب الفئة
          </p>
          <h2 id={headingId} className="qgb-h2-section" style={sans}>
            {categoryName}
          </h2>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
          {n > 1 ? (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={goNext}
                disabled={index >= n - 1}
                className={ARROW_BTN}
                aria-label="التالي"
              >
                <ChevronRight className="size-5" strokeWidth={1.5} aria-hidden />
              </button>
              <button
                type="button"
                onClick={goPrev}
                disabled={index <= 0}
                className={ARROW_BTN}
                aria-label="السابق"
              >
                <ChevronLeft className="size-5" strokeWidth={1.5} aria-hidden />
              </button>
            </div>
          ) : null}
          <Link href={shopHref} className="qgb-btn-outline w-fit shrink-0" style={sans} prefetch>
            عرض الكل
          </Link>
        </div>
      </div>

      <div
        className="-mx-1 overflow-x-auto overflow-y-visible overscroll-x-contain pb-3 pt-1 [-ms-overflow-style:none] [scrollbar-width:none] [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden md:-mx-0"
        role="region"
        aria-roledescription="carousel"
        aria-label="منتجات الفئة"
      >
        <div className="flex w-max flex-nowrap gap-4 snap-x snap-mandatory md:gap-5 lg:gap-6">
          {products.map((item, idx) => (
            <div
              key={`${categoryId}-${item.slug}`}
              ref={(el) => {
                cardRefs.current[idx] = el;
              }}
              className="w-[148px] shrink-0 snap-start sm:w-[168px] md:w-[188px] lg:w-[208px] xl:w-[220px]"
            >
              <FeaturedProductCard item={item} />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export function HomeCategoryProductSections({ sections }: HomeCategoryProductSectionsProps) {
  if (sections.length === 0) {
    return (
      <section
        id="shop"
        className="w-full bg-white py-6 md:py-8"
        aria-label="منتجات حسب الفئة"
        dir="rtl"
      >
        <div className={`mx-auto w-full max-w-[1600px] ${pagePaddingX}`}>
          <p className="text-center text-[13px] text-caption" style={sans}>
            لا توجد منتجات لعرضها حالياً.
          </p>
        </div>
      </section>
    );
  }

  return (
    <>
      {sections.map((section, index) => {
        const isFirst = index === 0;
        const shopHref = `/shop#cat-${section.categoryId}`;
        const band = index % 2 === 0 ? "bg-white" : "bg-[#faf8fa]";

        return (
          <section
            key={section.categoryId}
            id={isFirst ? "shop" : undefined}
            className={`w-full scroll-mt-36 py-7 md:scroll-mt-40 md:py-9 ${band}`}
            aria-labelledby={`category-heading-${section.categoryId}`}
            dir="rtl"
          >
            <div className={`mx-auto w-full max-w-[1600px] ${pagePaddingX}`}>
              <CategoryProductCarousel
                categoryId={section.categoryId}
                categoryName={section.categoryName}
                headingId={`category-heading-${section.categoryId}`}
                products={section.products}
                shopHref={shopHref}
              />
            </div>
          </section>
        );
      })}
    </>
  );
}
