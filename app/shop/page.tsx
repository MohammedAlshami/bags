"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";

type ProductItem = { name: string; price: string; category: string; image: string; slug: string };

const serif = { fontFamily: "var(--font-cormorant), serif" };
const bgWhite = { backgroundColor: "#ffffff" };

function buildProductsUrl(search: string, categories: Set<string>): string {
  const params = new URLSearchParams();
  if (search.trim()) params.set("search", search.trim());
  categories.forEach((c) => params.append("category", c));
  const q = params.toString();
  return "/api/products" + (q ? `?${q}` : "");
}

function ProductCard({
  name,
  price,
  category,
  image,
  slug,
}: {
  name: string;
  price: string;
  category: string;
  image: string;
  slug: string;
}) {
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

export default function ShopPage() {
  const [products, setProducts] = useState<ProductItem[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [categories, setCategories] = useState<Set<string>>(new Set());
  const [categoryList, setCategoryList] = useState<string[]>([]);

  const fetchProducts = useCallback((searchTerm: string, selectedCats: Set<string>) => {
    const url = buildProductsUrl(searchTerm, selectedCats);
    return fetch(url)
      .then((res) => { if (!res.ok) throw new Error("Failed to load products"); return res.json(); })
      .then((data: ProductItem[]) => data);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    setProducts(null);
    fetchProducts(search, categories)
      .then((data) => {
        setProducts(data);
        if (search === "" && categories.size === 0) {
          setCategoryList(Array.from(new Set(data.map((p) => p.category))).sort());
        }
      })
      .catch((err) => setLoadError(err instanceof Error ? err.message : "Failed to load"));
  }, [search, categories, fetchProducts]);

  const toggleCategory = (cat: string) => {
    setCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const clearFilters = () => {
    setSearch("");
    setSearchInput("");
    setCategories(new Set());
  };

  const hasActiveFilters = searchInput.trim() !== "" || categories.size > 0;

  const COLLECTION_BANNER_IMAGE = "/Pixalated.png";

  if (loadError) {
    return (
      <main className="min-h-screen pt-24 pb-24 flex items-center justify-center" style={bgWhite}>
        <p className="text-neutral-600" style={serif}>{loadError}</p>
      </main>
    );
  }

  if (products === null) {
    return (
      <main className="min-h-screen pt-24 pb-24 flex items-center justify-center" style={bgWhite}>
        <p className="text-neutral-500" style={serif}>Loading…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-24 pb-24 md:pt-32 md:pb-32" style={bgWhite}>
      <div className="mx-10 md:mx-20">
        {/* Banner — same as landing page */}
        <div className="relative aspect-[21/9] w-full overflow-hidden md:aspect-[3/1] mb-10 md:mb-12">
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

        {/* Page title */}
        <div className="mb-8">
          <p className="text-[10px] uppercase tracking-[0.35em] text-gray-500">Shop</p>
          <h1 className="mt-2 text-4xl font-light text-neutral-900 md:text-5xl" style={serif}>
            All pieces
          </h1>
        </div>

        {/* Search bar */}
        <div className="mb-8">
          <label htmlFor="shop-search" className="sr-only">
            Search products
          </label>
          <input
            id="shop-search"
            type="search"
            placeholder="Search by name or category..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full max-w-xl border-b border-neutral-200 bg-transparent py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-10 lg:flex-row">
          {/* Filters sidebar */}
          <aside className="w-full shrink-0 lg:w-56">
            <div className="border-t border-neutral-100 pt-6 lg:border-0 lg:pt-0">
              <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-500 mb-4">Category</p>
              <ul className="space-y-3">
                {categoryList.map((cat) => (
                  <li key={cat}>
                    <button
                      type="button"
                      onClick={() => toggleCategory(cat)}
                      className={`flex w-full items-center gap-3 text-left text-sm font-medium transition-colors hover:text-black ${
                        categories.has(cat) ? "text-black" : "text-neutral-500"
                      }`}
                    >
                      <span
                        className={`h-3.5 w-3.5 shrink-0 rounded-sm border ${
                          categories.has(cat)
                            ? "border-[#facc15] bg-[#facc15]"
                            : "border-neutral-300 bg-transparent"
                        }`}
                      />
                      {cat}
                    </button>
                  </li>
                ))}
              </ul>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-6 text-xs font-medium uppercase tracking-widest text-neutral-500 underline underline-offset-2 hover:text-black"
                >
                  Clear all
                </button>
              )}
            </div>
          </aside>

          {/* Product grid */}
          <div className="min-w-0 flex-1">
            <p className="mb-4 text-xs text-neutral-500">
              {(products?.length ?? 0)} {(products?.length ?? 0) === 1 ? "piece" : "pieces"}
            </p>
            {(products?.length ?? 0) > 0 ? (
              <div className="grid grid-cols-2 gap-6 gap-y-10 sm:grid-cols-3 xl:grid-cols-4">
                {(products ?? []).map((p) => (
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
              <p className="py-16 text-center text-sm text-neutral-500" style={serif}>
                No pieces match your filters. Try adjusting your search or categories.
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
