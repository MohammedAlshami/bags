"use client";

import { useParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { sans, pagePaddingX, IMAGE_WELL } from "@/lib/page-theme";

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

const DEFAULT_STORY =
  "كل منتج في هذه المجموعة يُختار بعناية ليدعم روتينكِ اليومي — بأسلوب بسيط وأنيق يدوم.";
const DEFAULT_MATERIAL =
  "مكوّنات موثوقة ومصادر نعتمد عليها بعناية. نركز على التفاصيل من التركيبة إلى التغليف.";
const DEFAULT_QUALITY =
  "نلتزم بالجودة والشفافية، ونقدّم لكِ دعماً واضحاً في الشحن والإرجاع.";

function ProductCard({ name, price, category, image, slug }: ProductItem) {
  return (
    <Link href={`/product/${slug}`} className="group flex flex-col" dir="rtl">
      <div
        className="relative aspect-[3/5] w-full overflow-hidden rounded-2xl p-4 sm:p-5"
        style={{ backgroundColor: IMAGE_WELL }}
      >
        <Image
          src={image}
          alt={name}
          fill
          className="object-contain object-center p-3 transition-transform duration-300 group-hover:scale-[1.03] sm:p-4"
          sizes="(max-width: 768px) 50vw, 33vw"
        />
      </div>
      <div className="mt-4 flex flex-col gap-1 text-center">
        <span className="text-xs text-neutral-500" style={sans}>
          {category}
        </span>
        <span className="text-sm font-semibold text-neutral-900" style={sans}>
          {name}
        </span>
        <span className="text-sm text-neutral-800" style={sans}>
          {price}
        </span>
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
      className={`px-6 py-20 md:px-12 md:py-28 ${isDark ? "bg-neutral-900 text-white" : "bg-white text-neutral-900"}`}
      dir="rtl"
    >
      <div className="mx-auto grid max-w-screen-xl grid-cols-1 gap-10 md:grid-cols-12 md:gap-12">
        <div className="md:sticky md:top-32 md:col-span-4 md:self-start lg:col-span-3">
          <span className={`mb-2 block text-xs font-semibold ${isDark ? "text-white/50" : "text-neutral-400"}`} style={sans}>
            {number}
          </span>
          <h2 className="text-2xl font-medium md:text-3xl" style={sans}>
            {title}
          </h2>
        </div>
        <div className="md:col-span-8 md:col-start-5 lg:col-span-8 lg:col-start-5">
          <p
            className={`text-lg font-normal leading-relaxed md:text-xl ${isDark ? "text-white/90" : "text-neutral-600"}`}
            style={sans}
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
      if (res.status === 404) throw new Error("المجموعة غير موجودة");
      if (!res.ok) throw new Error("تعذّر تحميل المجموعة");
      return res.json();
    });
  }, [slug]);

  const fetchProducts = useCallback(() => {
    if (!slug) return Promise.resolve([]);
    return fetch(`/api/products?collection=${encodeURIComponent(slug)}`)
      .then((res) => {
        if (!res.ok) throw new Error("تعذّر تحميل المنتجات");
        return res.json();
      })
      .then((data: ProductItem[]) => data);
  }, [slug]);

  useEffect(() => {
    if (!slug) {
      setLoadError("رابط غير صالح");
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
      .catch((err) => setLoadError(err instanceof Error ? err.message : "حدث خطأ"));
  }, [slug, fetchCollection, fetchProducts]);

  if (loadError) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white pb-24 pt-24" dir="rtl">
        <p className="text-neutral-600" style={sans}>
          {loadError}
        </p>
        <Link href="/collections" className="text-sm text-neutral-500 underline hover:text-black" style={sans}>
          العودة إلى المجموعات
        </Link>
      </main>
    );
  }

  if (collection === null) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white pb-24 pt-24" dir="rtl">
        <p className="text-neutral-500" style={sans}>
          جاري التحميل…
        </p>
      </main>
    );
  }

  const productList = products ?? [];
  const storyText = collection.story?.trim() ? collection.story : DEFAULT_STORY;
  const materialText = collection.material?.trim() ? collection.material : DEFAULT_MATERIAL;
  const qualityText = collection.quality?.trim() ? collection.quality : DEFAULT_QUALITY;

  const pieceCount =
    productList.length === 0 ? "لا منتجات" : productList.length === 1 ? "منتج واحد" : `${productList.length} منتجات`;

  return (
    <main className="min-h-screen bg-white" dir="rtl">
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
          <div className="absolute inset-0 flex items-center justify-center text-3xl text-neutral-400" style={sans}>
            {collection.name}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 flex w-full flex-col justify-end p-8 md:p-16 lg:p-24">
          <p className="mb-4 text-xs text-white/80" style={sans}>
            مجموعة
          </p>
          <h1 className="mb-6 text-5xl font-medium text-white md:text-7xl" style={sans}>
            {collection.name}
          </h1>
          {collection.description && (
            <p className="max-w-xl text-lg leading-relaxed text-white/90 md:text-xl" style={sans}>
              {collection.description}
            </p>
          )}
        </div>
      </section>

      <Section number="٠١" title="الفكرة" content={storyText} theme="light" />
      <Section number="٠٢" title="المكوّنات والعناية" content={materialText} theme="light" />
      <Section number="٠٣" title="وعدنا لكِ" content={qualityText} theme="dark" />

      <section className={`bg-white py-20 md:py-28 ${pagePaddingX}`}>
        <div className="mx-auto max-w-screen-xl">
          <div className="mb-10 flex flex-col justify-between gap-6 md:mb-16 md:flex-row md:items-end">
            <div>
              <p className="mb-4 text-xs text-neutral-500" style={sans}>
                المتجر
              </p>
              <h2 className="text-3xl font-medium text-neutral-900 md:text-4xl" style={sans}>
                المنتجات
              </h2>
            </div>
            <p className="text-sm text-neutral-500" style={sans}>
              {pieceCount}
            </p>
          </div>

          {productList.length > 0 ? (
            <div className="grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
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
            <div className="border-t border-neutral-100 py-24 text-center">
              <p className="mb-4 text-neutral-500" style={sans}>
                لا توجد منتجات في هذه المجموعة بعد.
              </p>
              <Link href="/shop" className="text-sm text-black underline hover:opacity-70" style={sans}>
                تصفحي كل المنتجات
              </Link>
            </div>
          )}

          <div className="mt-24 flex justify-center border-t border-neutral-100 pt-12">
            <Link
              href="/collections"
              className="text-xs text-neutral-500 transition-colors hover:text-black"
              style={sans}
            >
              كل المجموعات
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
