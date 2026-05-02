"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { SafeImage } from "@/app/components/SafeImage";
import { useCart } from "@/app/context/CartContext";
import { RecommendedProductsSection } from "@/app/components/RecommendedProductsSection";
import { formatDualDiscountPrice, formatDualPrice, type ProductSizePrice } from "@/lib/price-format";
import { sans } from "@/lib/page-theme";

type PackageProduct = {
  _id: string;
  name: string;
  price: string;
  oldRiyal?: number | null;
  beforeDiscountPrice?: string | null;
  beforeDiscountOldRiyal?: number | null;
  sizes?: ProductSizePrice[] | null;
  category: string;
  image: string;
  slug: string;
};

type PackageDeal = {
  _id: string;
  name: string;
  description: string;
  introAr: string;
  contentsAr: Array<{ title: string; body: string }>;
  closingAr: string;
  image: string;
  price: string;
  oldRiyal?: number | null;
  beforeDiscountPrice?: string | null;
  beforeDiscountOldRiyal?: number | null;
  products: PackageProduct[];
};

const FALLBACK_DESCRIPTION =
  "مجموعة مختارة بعناية لتمنحك روتين عناية متكامل بسعر خاص، مع منتجات متناسقة يمكن استخدامها معاً للحصول على تجربة كاملة من الملكة جولد.";

function PackageMainSection({ packageDeal }: { packageDeal: PackageDeal }) {
  const { addToCart } = useCart();
  const heroImage = packageDeal.image || packageDeal.products[0]?.image || "";
  const description = packageDeal.introAr?.trim() || packageDeal.description?.trim() || FALLBACK_DESCRIPTION;
  const displayPrice = formatDualDiscountPrice({
    price: packageDeal.price,
    oldRiyal: packageDeal.oldRiyal ?? null,
    beforeDiscountPrice: packageDeal.beforeDiscountPrice,
    beforeDiscountOldRiyal: packageDeal.beforeDiscountOldRiyal,
  });
  const regularTotal = useMemo(
    () =>
      packageDeal.products.reduce((sum, product) => {
        const match = product.price.match(/[\d.,]+/);
        return sum + (match ? Number(match[0].replace(/,/g, "")) || 0 : 0);
      }, 0),
    [packageDeal.products]
  );

  return (
    <div className="mx-auto max-w-[1920px] px-4 py-10 pt-20 sm:px-6 md:px-14 md:pt-28 lg:px-24">
      <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-7">
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-neutral-100">
            {heroImage ? (
              <SafeImage
                src={heroImage}
                alt={packageDeal.name}
                fill
                className="object-cover object-center"
                sizes="(max-width: 1024px) 100vw, 58vw"
                priority
              />
            ) : null}
          </div>
        </div>

        <div className="lg:col-span-5 lg:sticky lg:top-32 lg:h-fit lg:self-start lg:ps-10" dir="rtl">
          <span className="text-xs text-neutral-500" style={sans}>
            باقة منتجات
          </span>
          <h1 className="mt-3 text-3xl font-medium leading-tight tracking-tight text-neutral-900 md:text-4xl lg:text-[2.75rem]" style={sans}>
            {packageDeal.name}
          </h1>
          <div className="mt-5 text-lg font-medium text-neutral-900 md:text-2xl" style={sans}>
            {displayPrice.current}
          </div>
          {displayPrice.before ? (
            <div className="mt-2 text-base text-neutral-400 line-through md:text-lg" style={sans}>
              {displayPrice.before}
            </div>
          ) : null}

          <p className="mt-8 text-sm leading-relaxed text-neutral-600 md:text-base" style={sans}>
            {description}
          </p>

          <div className="mt-8 space-y-8 border-t border-neutral-200/90 pt-8 md:mt-10">
            {packageDeal.contentsAr.length > 0 ? (
              <section className="space-y-3">
                <h2 className="text-sm font-semibold text-neutral-900 md:text-base" style={sans}>
                  يحتوي البوكس على
                </h2>
                <div className="space-y-3">
                  {packageDeal.contentsAr.map((item) => (
                    <div key={`${item.title}-${item.body}`} className="flex items-start gap-3 text-sm text-neutral-700 md:text-base" style={sans}>
                      <span className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-neutral-400" aria-hidden />
                      <span>
                        {item.title ? <strong className="font-semibold text-neutral-900">{item.title}: </strong> : null}
                        {item.body}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {packageDeal.closingAr ? (
              <section className="space-y-3">
                <h2 className="text-sm font-semibold text-neutral-900 md:text-base" style={sans}>
                  النتيجة
                </h2>
                <p className="text-sm leading-relaxed text-neutral-700 md:text-base" style={sans}>
                  {packageDeal.closingAr}
                </p>
              </section>
            ) : null}
          </div>

          <div className="mt-8 border-t border-neutral-200/90 pt-8">
            <h2 className="text-sm font-semibold text-neutral-900 md:text-base" style={sans}>
              المنتجات داخل الباقة
            </h2>
            <div className="mt-4 divide-y divide-neutral-200/80 border-y border-neutral-200/80">
              {packageDeal.products.map((product) => (
                <Link
                  key={product._id}
                  href={`/product/${encodeURIComponent(product.slug)}`}
                  className="flex items-center gap-4 py-4 text-right transition-opacity hover:opacity-75"
                >
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                    {product.image ? <SafeImage src={product.image} alt={product.name} fill className="object-cover object-center" sizes="64px" /> : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-neutral-900 md:text-base" style={sans}>
                      {product.name}
                    </p>
                    <p className="mt-1 text-xs text-neutral-500" style={sans}>
                      {product.category}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm text-neutral-700" style={sans}>
                    {formatDualPrice(product.price, product.oldRiyal ?? null)}
                  </p>
                </Link>
              ))}
            </div>
            {regularTotal > 0 ? (
              <p className="mt-3 text-xs text-neutral-500" style={sans}>
                السعر الإجمالي للمنتجات منفردة: {regularTotal.toFixed(2)} ر.س
              </p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() =>
              addToCart({
                slug: `package:${packageDeal._id}`,
                name: packageDeal.name,
                price: packageDeal.price,
                oldRiyal: packageDeal.oldRiyal ?? null,
                image: heroImage,
              })
            }
            className="mt-12 w-full rounded-full bg-neutral-900 py-4 text-sm font-semibold text-white transition-colors hover:bg-neutral-800"
            style={sans}
          >
            أضف الباقة إلى السلة
          </button>

          <div className="mt-10 space-y-8 border-t border-neutral-200/90 pt-8">
            <div>
              <h3 className="mb-2 text-sm font-semibold text-neutral-900" style={sans}>
                الشحن
              </h3>
              <p className="text-sm leading-relaxed text-neutral-600 md:text-base" style={sans}>
                تُجهّز الباقة كطلب واحد وتُشحن حسب خيارات التوصيل المتاحة في صفحة الدفع.
              </p>
            </div>
            <div>
              <h3 className="mb-2 text-sm font-semibold text-neutral-900" style={sans}>
                ملاحظة
              </h3>
              <p className="text-sm leading-relaxed text-neutral-600 md:text-base" style={sans}>
                تحتوي الباقة على المنتجات الموضحة أعلاه، وقد تظهر تفاصيل كل منتج كاملة عند فتح صفحة المنتج.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PackagePage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const [packageDeal, setPackageDeal] = useState<PackageDeal | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false);
      return;
    }

    fetch(`/api/packages/${encodeURIComponent(id)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data || typeof data !== "object" || !("name" in data)) {
          setPackageDeal(null);
          return;
        }
        const packageData = data as Record<string, unknown>;
        setPackageDeal({
          _id: String(packageData._id),
          name: String(packageData.name),
          description: typeof packageData.description === "string" ? packageData.description : "",
          introAr: typeof packageData.introAr === "string" ? packageData.introAr : "",
          contentsAr: Array.isArray(packageData.contentsAr)
            ? (packageData.contentsAr as Array<{ title: string; body: string }>)
            : [],
          closingAr: typeof packageData.closingAr === "string" ? packageData.closingAr : "",
          image: typeof packageData.image === "string" ? packageData.image : "",
          price: String(packageData.price),
          oldRiyal:
            typeof packageData.oldRiyal === "number"
              ? Number(packageData.oldRiyal)
              : null,
          beforeDiscountPrice: typeof packageData.beforeDiscountPrice === "string" ? String(packageData.beforeDiscountPrice) : null,
          beforeDiscountOldRiyal:
            typeof packageData.beforeDiscountOldRiyal === "number"
              ? Number(packageData.beforeDiscountOldRiyal)
              : null,
          products: Array.isArray(packageData.products)
            ? (packageData.products as PackageProduct[])
            : [],
        });
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white pb-24 pt-32" dir="rtl">
        <p className="text-neutral-500" style={sans}>
          جاري التحميل...
        </p>
      </main>
    );
  }

  if (!packageDeal) {
    return (
      <main className="min-h-screen bg-white pb-24 pt-32" dir="rtl">
        <div className="mx-auto max-w-lg px-6 text-center">
          <h1 className="text-2xl font-medium text-neutral-900" style={sans}>
            الباقة غير متوفرة
          </h1>
          <Link href="/shop" className="mt-6 inline-block text-sm text-neutral-600 underline-offset-4 hover:text-neutral-900 hover:underline" style={sans}>
            العودة إلى المتجر
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white pt-20" dir="rtl">
      <PackageMainSection packageDeal={packageDeal} />
      <RecommendedProductsSection excludeSlug={packageDeal._id} />
    </main>
  );
}
