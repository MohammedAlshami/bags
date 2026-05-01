"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronUp } from "lucide-react";
import { SafeImage } from "@/app/components/SafeImage";
import { sans } from "@/lib/page-theme";
import { formatDualPrice } from "@/lib/price-format";
import {
  getProductPriceForFilter,
  type ShopPriceCurrency,
} from "@/lib/shop-product-price";

export type CatalogProduct = {
  name: string;
  price: string;
  oldRiyal?: number | null;
  sizes?: { label: string; sarPrice: number; oldRiyal: number }[] | null;
  category: string;
  categoryId: string | null;
  image: string;
  slug: string;
  collectionSlug: string | null;
};

export type CatalogCategory = {
  _id: string;
  name: string;
  products: CatalogProduct[];
};

type SortKey = "default" | "price-asc" | "price-desc" | "name";

function sortProducts(list: CatalogProduct[], key: SortKey, currency: ShopPriceCurrency): CatalogProduct[] {
  const out = [...list];
  if (key === "price-asc") {
    out.sort(
      (a, b) => getProductPriceForFilter(a, currency) - getProductPriceForFilter(b, currency)
    );
  } else if (key === "price-desc") {
    out.sort(
      (a, b) => getProductPriceForFilter(b, currency) - getProductPriceForFilter(a, currency)
    );
  } else if (key === "name") {
    out.sort((a, b) => a.name.localeCompare(b.name, "ar"));
  }
  return out;
}

function ProductCard({ product }: { product: CatalogProduct }) {
  const { name, price, oldRiyal, category, image, slug } = product;
  const size = Array.isArray(product.sizes) && product.sizes.length > 0 ? product.sizes[0] : null;
  const priceLine = size
    ? `${size.oldRiyal.toLocaleString("en-US")} ر ق / ${size.sarPrice} ر س`
    : formatDualPrice(price, oldRiyal);
  return (
    <Link href={`/product/${slug}`} className="group flex flex-col" dir="rtl">
      <div className="relative aspect-[3/5] w-full overflow-hidden rounded-2xl bg-neutral-50">
        <SafeImage
          src={image}
          alt={name}
          fill
          className="object-cover object-center transition-transform duration-300 group-hover:scale-[1.03]"
          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
        />
      </div>
      <div className="mt-4 flex flex-col gap-1.5 text-right">
        <span
          className="inline-flex h-7 min-w-0 max-w-full items-center justify-center self-start overflow-hidden text-ellipsis whitespace-nowrap rounded-full border border-brand-accent bg-white px-3 text-[12px] font-medium text-brand-primary transition-colors group-hover:bg-brand-light/25"
          style={sans}
          title={category}
        >
          {category}
        </span>
        <span className="text-base font-semibold text-neutral-900 sm:text-[17px]" style={sans}>
          {name}
        </span>
        <span className="text-base font-medium text-neutral-900" style={sans}>
          {priceLine}
        </span>
      </div>
    </Link>
  );
}

function FilterSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details
      open={defaultOpen}
      className="group border-b border-neutral-200 py-5 last:border-b-0 [&_summary::-webkit-details-marker]:hidden"
    >
      <summary className="flex w-full cursor-pointer list-none items-center justify-between gap-3">
        <span
          className="min-w-0 text-end text-sm font-bold tracking-[0.14em] text-neutral-950 md:text-[15px]"
          style={sans}
        >
          {title}
        </span>
        <ChevronUp
          className="size-4 shrink-0 text-neutral-500 transition-transform duration-200 group-open:rotate-180 md:size-5"
          strokeWidth={2}
          aria-hidden
        />
      </summary>
      <div className="mt-5 space-y-4" dir="rtl">
        {children}
      </div>
    </details>
  );
}

function FilterToggle({
  open,
  onToggle,
}: {
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="mb-6 flex items-center justify-between gap-4 lg:hidden" style={sans}>
      <span className="text-sm font-normal text-neutral-900 md:text-[15px]">عرض الفلاتر</span>
      <button
        type="button"
        role="switch"
        aria-checked={open}
        onClick={onToggle}
        className="relative h-8 w-[52px] shrink-0 rounded-full bg-neutral-900 transition-colors"
      >
        <span
          className={`absolute top-1 size-6 rounded-full bg-white shadow-sm transition-[inset-inline-start] ${
            open ? "start-1" : "end-1"
          }`}
        />
      </button>
    </div>
  );
}

export function ShopCatalogClient({
  categories,
  initialCategoryId,
  initialCollectionSlug,
}: {
  categories: CatalogCategory[];
  initialCategoryId: string | null;
  initialCollectionSlug: string | null;
}) {
  const allCategoryIds = useMemo(() => new Set(categories.map((c) => c._id)), [categories]);

  const flatProducts = useMemo(
    () => categories.flatMap((c) => c.products),
    [categories]
  );

  const [priceCurrency, setPriceCurrency] = useState<ShopPriceCurrency>("SAR");

  const { minBound, maxBound } = useMemo(() => {
    if (flatProducts.length === 0) return { minBound: 0, maxBound: 500 };
    const vals = flatProducts.map((p) => getProductPriceForFilter(p, priceCurrency));
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    if (min === max) return { minBound: Math.max(0, min - 1), maxBound: max + 1 };
    return { minBound: min, maxBound: max };
  }, [flatProducts, priceCurrency]);

  const [filtersOpen, setFiltersOpen] = useState(true);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<Set<string>>(() => {
    const all = new Set(categories.map((c) => c._id));
    if (initialCategoryId && all.has(initialCategoryId)) return new Set([initialCategoryId]);
    return all;
  });
  const [priceMin, setPriceMin] = useState(() => {
    if (flatProducts.length === 0) return 0;
    const vals = flatProducts.map((p) => getProductPriceForFilter(p, "SAR"));
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    if (min === max) return Math.max(0, min - 1);
    return min;
  });
  const [priceMax, setPriceMax] = useState(() => {
    if (flatProducts.length === 0) return 500;
    const vals = flatProducts.map((p) => getProductPriceForFilter(p, "SAR"));
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    if (min === max) return max + 1;
    return max;
  });
  const [sort, setSort] = useState<SortKey>("default");
  const [activeCollectionSlug, setActiveCollectionSlug] = useState<string | null>(
    initialCollectionSlug ?? null
  );

  useEffect(() => {
    setActiveCollectionSlug(initialCollectionSlug ?? null);
  }, [initialCollectionSlug]);

  useEffect(() => {
    const all = new Set(categories.map((c) => c._id));
    if (initialCategoryId && all.has(initialCategoryId)) {
      setSelectedCategoryIds(new Set([initialCategoryId]));
    } else {
      setSelectedCategoryIds(all);
    }
  }, [initialCategoryId, categories]);

  useEffect(() => {
    setPriceMin(minBound);
    setPriceMax(maxBound);
  }, [minBound, maxBound]);

  const toggleCategory = useCallback(
    (id: string) => {
      setSelectedCategoryIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        if (next.size === 0) return new Set(allCategoryIds);
        return next;
      });
    },
    [allCategoryIds]
  );

  const filteredBlocks = useMemo(() => {
    const lo = Math.min(priceMin, priceMax);
    const hi = Math.max(priceMin, priceMax);
    return categories
      .filter((cat) => selectedCategoryIds.has(cat._id))
      .map((cat) => {
        let list = cat.products.filter((p) => {
          const v = getProductPriceForFilter(p, priceCurrency);
          if (v < lo || v > hi) return false;
          if (activeCollectionSlug) {
            if (!p.collectionSlug || p.collectionSlug !== activeCollectionSlug) return false;
          }
          return true;
        });
        list = sortProducts(list, sort, priceCurrency);
        return { ...cat, products: list };
      })
      .filter((b) => b.products.length > 0);
  }, [
    categories,
    selectedCategoryIds,
    priceMin,
    priceMax,
    priceCurrency,
    sort,
    activeCollectionSlug,
  ]);

  const resultCount = useMemo(
    () => filteredBlocks.reduce((n, b) => n + b.products.length, 0),
    [filteredBlocks]
  );

  const resetFilters = useCallback(() => {
    setSelectedCategoryIds(new Set(categories.map((c) => c._id)));
    setActiveCollectionSlug(null);
    setPriceCurrency("SAR");
    setSort("default");
    if (flatProducts.length === 0) {
      setPriceMin(0);
      setPriceMax(500);
      return;
    }
    const vals = flatProducts.map((p) => getProductPriceForFilter(p, "SAR"));
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    if (min === max) {
      setPriceMin(Math.max(0, min - 1));
      setPriceMax(max + 1);
    } else {
      setPriceMin(min);
      setPriceMax(max);
    }
  }, [categories, flatProducts]);

  return (
    <div className={`mx-auto max-w-[1920px] px-4 pt-8 sm:px-8 md:px-14 md:pt-10 lg:px-24`}>
      <FilterToggle open={filtersOpen} onToggle={() => setFiltersOpen((v) => !v)} />

      <div className="mb-6 flex flex-col gap-4 border-b border-neutral-200 pb-6 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-neutral-600 md:text-[15px]" style={sans}>
          <span className="font-bold text-neutral-950">{resultCount.toLocaleString("ar-SA")}</span>{" "}
          نتيجة
        </p>
        <div className="flex flex-wrap items-center gap-3 md:gap-4">
          <label className="flex flex-wrap items-center gap-2 text-sm text-neutral-800 md:text-[15px]" style={sans}>
            <span className="shrink-0">ترتيب حسب</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="min-w-[10rem] rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 md:text-[15px]"
              style={sans}
            >
              <option value="default">الافتراضي</option>
              <option value="name">الاسم</option>
              <option value="price-asc">السعر: من الأقل للأعلى</option>
              <option value="price-desc">السعر: من الأعلى للأقل</option>
            </select>
          </label>
        </div>
      </div>

      <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-12">
        <aside
          className={`w-full shrink-0 lg:sticky lg:top-28 lg:w-[min(100%,320px)] lg:self-start ${
            filtersOpen ? "block" : "max-lg:hidden"
          } lg:block`}
          aria-label="فلاتر المتجر"
          dir="rtl"
        >
          <div className="px-0 py-0" style={sans}>
            <div className="mb-2 flex items-center justify-between gap-3 pb-4">
              <h2 className="text-lg font-bold text-neutral-950 md:text-xl">الفلاتر</h2>
              <Link
                href="/shop"
                className="text-sm font-semibold text-neutral-900 underline decoration-neutral-400 underline-offset-4 hover:decoration-neutral-900 md:text-[15px]"
                onClick={resetFilters}
              >
                إعادة التعيين
              </Link>
            </div>

            <FilterSection title={priceCurrency === "SAR" ? "السعر (ر.س)" : "السعر (ر.ق)"}>
              <div className="flex flex-wrap gap-4">
                <label className="flex cursor-pointer items-center gap-2 text-sm text-neutral-950 md:text-[15px]">
                  <input
                    type="radio"
                    name="shop-filter-currency"
                    checked={priceCurrency === "SAR"}
                    onChange={() => setPriceCurrency("SAR")}
                    className="size-4 shrink-0 border-2 border-neutral-900 accent-neutral-900 md:size-[18px]"
                  />
                  <span className="min-w-0">ر.س — الريال السعودي</span>
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-sm text-neutral-950 md:text-[15px]">
                  <input
                    type="radio"
                    name="shop-filter-currency"
                    checked={priceCurrency === "YER"}
                    onChange={() => setPriceCurrency("YER")}
                    className="size-4 shrink-0 border-2 border-neutral-900 accent-neutral-900 md:size-[18px]"
                  />
                  <span className="min-w-0">ر.ق — الريال اليمني</span>
                </label>
              </div>
              <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-end sm:gap-4">
                <div className="flex min-w-[8rem] flex-1 flex-col gap-2">
                  <span className="text-xs font-medium text-neutral-500 md:text-sm">من</span>
                  <div className="flex items-center gap-2 rounded-lg bg-[#f5f5f5] px-3 py-2.5 md:py-3">
                    <input
                      type="number"
                      min={minBound}
                      max={maxBound}
                      value={Math.round(priceMin)}
                      onChange={(e) => setPriceMin(Number(e.target.value) || minBound)}
                      className="min-w-0 flex-1 border-0 bg-transparent text-right text-base font-medium text-neutral-800 outline-none md:text-lg"
                    />
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-neutral-300 text-[10px] font-bold text-white md:size-8 md:text-xs">
                      {priceCurrency === "SAR" ? "س" : "ق"}
                    </span>
                  </div>
                </div>
                <div className="flex min-w-[8rem] flex-1 flex-col gap-2">
                  <span className="text-xs font-medium text-neutral-500 md:text-sm">إلى</span>
                  <div className="flex items-center gap-2 rounded-lg bg-[#f5f5f5] px-3 py-2.5 md:py-3">
                    <input
                      type="number"
                      min={minBound}
                      max={maxBound}
                      value={Math.round(priceMax)}
                      onChange={(e) => setPriceMax(Number(e.target.value) || maxBound)}
                      className="min-w-0 flex-1 border-0 bg-transparent text-right text-base font-medium text-neutral-800 outline-none md:text-lg"
                    />
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-neutral-300 text-[10px] font-bold text-white md:size-8 md:text-xs">
                      {priceCurrency === "SAR" ? "س" : "ق"}
                    </span>
                  </div>
                </div>
              </div>
              <p className="mt-3 text-xs text-neutral-500 md:text-sm">
                بين {minBound.toLocaleString("ar-SA")} و {maxBound.toLocaleString("ar-SA")}{" "}
                {priceCurrency === "SAR" ? "ر.س" : "ر.ق"}
              </p>
            </FilterSection>

            <FilterSection title="التوفر">
              <div className="flex w-full items-center gap-2.5 text-sm text-neutral-950 md:text-[15px]">
                <input
                  type="radio"
                  name="availability"
                  checked
                  disabled
                  className="size-4 shrink-0 border-2 border-neutral-900 opacity-100 accent-neutral-900 md:size-[18px]"
                  aria-label="متوفر"
                />
                <span className="min-w-0">متوفر</span>
              </div>
              <p className="text-end text-sm text-neutral-400 md:text-[15px]">غير متوفر — قريبًا</p>
            </FilterSection>

            <FilterSection title="الفئة">
              <div className="max-h-56 space-y-3 overflow-y-auto pe-1 cute-scrollbar">
                {categories.map((cat) => (
                  <label
                    key={cat._id}
                    className="flex w-full cursor-pointer items-center gap-2.5 text-sm text-neutral-950 md:text-[15px]"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCategoryIds.has(cat._id)}
                      onChange={() => toggleCategory(cat._id)}
                      className="size-4 shrink-0 accent-neutral-900 md:size-[18px]"
                    />
                    <span className="min-w-0 truncate">{cat.name}</span>
                  </label>
                ))}
              </div>
            </FilterSection>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          {filteredBlocks.length === 0 ? (
            <p
              className="px-4 py-16 text-center text-lg text-neutral-600 md:text-xl"
              style={sans}
            >
              لا توجد منتجات مطابقة للفلاتر. جرّبي تغيير السعر أو الفئة.
            </p>
          ) : (
            filteredBlocks.map((block) => (
              <section
                key={block._id}
                className="mb-14 scroll-mt-36 md:scroll-mt-40"
                id={`cat-${block._id}`}
              >
                <h2
                  className="mb-6 text-right text-2xl font-bold text-neutral-950 md:mb-8 md:text-3xl"
                  style={sans}
                >
                  {block.name}
                </h2>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-5 lg:grid-cols-3 lg:gap-6 xl:grid-cols-4">
                  {block.products.map((product) => (
                    <ProductCard key={product.slug} product={product} />
                  ))}
                </div>
              </section>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
