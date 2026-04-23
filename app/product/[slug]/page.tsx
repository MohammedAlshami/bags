"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { SafeImage } from "@/app/components/SafeImage";
import Link from "next/link";
import { useCart } from "@/app/context/CartContext";
import { RecommendedProductsSection } from "@/app/components/RecommendedProductsSection";
import { sans } from "@/lib/page-theme";
import { formatDualPrice, formatSizePrice, type ProductSizePrice } from "@/lib/price-format";

type ProductItem = {
  name: string;
  price: string;
  oldRiyal?: number | null;
  sizes?: ProductSizePrice[] | null;
  category: string;
  image: string;
  slug: string;
  descriptionAr?: string | null;
  ingredientsAr?: string | null;
  usageAr?: string | null;
  freeFromAr?: string | null;
  warningAr?: string | null;
  contentsAr?: string | null;
};

function splitBullets(value?: string | null) {
  return (value ?? "")
    .split(/[•\n]+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

const DEFAULT_DESCRIPTION_AR =
  "صُنع بعناية ليدعم بشرتك بنضارة طبيعية وملمس ناعم. تركيبة متوازنة تناسب الاستخدام اليومي، مع التزامنا بجودة العناية التي تليق بعلامة الملكة جولد.";
const DEFAULT_DETAILS_AR = [
  "مناسب للاستخدام اليومي",
  "تركيبة مختبرة ومتوازنة",
  "عبوة عملية للسفر والاستخدام السريع",
  "تغليف أنيق يحافظ على المنتج",
  "صُنع بعناية وفخر محلي",
];

function ProductMainSection({ product }: { product: ProductItem }) {
  const { addToCart } = useCart();
  const [selectedSizeIndex, setSelectedSizeIndex] = useState(0);
  const description = product.descriptionAr?.trim() || DEFAULT_DESCRIPTION_AR;
  const ingredients = splitBullets(product.ingredientsAr);
  const usage = splitBullets(product.usageAr);
  const freeFrom = splitBullets(product.freeFromAr);
  const warning = product.warningAr?.trim() || "";
  const contents = splitBullets(product.contentsAr);
  const sizes = Array.isArray(product.sizes) && product.sizes.length > 0 ? product.sizes : null;
  const selectedSize = sizes ? sizes[Math.min(selectedSizeIndex, sizes.length - 1)] : null;
  const displayPrice = selectedSize ? formatSizePrice(selectedSize) : formatDualPrice(product.price, product.oldRiyal);

  return (
    <div className="mx-auto max-w-[1920px] px-4 py-10 pt-20 sm:px-6 md:px-14 md:pt-28 lg:px-24">
      <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-7">
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl">
            <SafeImage
              src={product.image}
              alt={product.name}
              fill
              className="object-cover object-center"
              sizes="(max-width: 1024px) 100vw, 58vw"
              priority
            />
          </div>
        </div>

        <div className="lg:col-span-5 lg:sticky lg:top-32 lg:h-fit lg:self-start lg:ps-10" dir="rtl">
          <span className="text-xs text-neutral-500" style={sans}>
            {product.category}
          </span>
          <h1
            className="mt-3 text-3xl font-medium leading-tight tracking-tight text-neutral-900 md:text-4xl lg:text-[2.75rem]"
            style={sans}
          >
            {product.name}
          </h1>
          <div className="mt-5 text-lg font-medium text-neutral-900 md:text-2xl" style={sans}>
            {displayPrice}
          </div>

          {sizes ? (
            <div className="mt-6">
              <p className="text-xs text-neutral-500" style={sans}>
                المقاس
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {sizes.map((size, index) => {
                  const active = index === selectedSizeIndex;
                  return (
                    <button
                      key={`${size.label}-${index}`}
                      type="button"
                      onClick={() => setSelectedSizeIndex(index)}
                      className={[
                        "rounded-full border px-4 py-2 text-sm transition-colors",
                        active ? "border-[#B63A6B] bg-[#B63A6B] text-white" : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300",
                      ].join(" ")}
                      style={sans}
                    >
                      {size.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          <p className="mt-8 text-sm leading-relaxed text-neutral-600 md:text-base" style={sans}>
            {description}
          </p>

          <div className="mt-8 space-y-8 border-t border-neutral-200/90 pt-8 md:mt-10">
            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-neutral-900 md:text-base" style={sans}>المكونات الرئيسية</h2>
              <div className="space-y-2">
                {ingredients.map((detail) => (
                  <div key={detail} className="flex items-start gap-3 text-sm text-neutral-700 md:text-base" style={sans}>
                    <span className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-neutral-400" aria-hidden />
                    <span>{detail}</span>
                  </div>
                ))}
              </div>
            </section>
            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-neutral-900 md:text-base" style={sans}>طريقة الاستخدام</h2>
              <div className="space-y-2">
                {usage.map((detail) => (
                  <div key={detail} className="flex items-start gap-3 text-sm text-neutral-700 md:text-base" style={sans}>
                    <span className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-neutral-400" aria-hidden />
                    <span>{detail}</span>
                  </div>
                ))}
              </div>
            </section>
            {freeFrom.length > 0 ? (
              <section className="space-y-3">
                <h2 className="text-sm font-semibold text-neutral-900 md:text-base" style={sans}>خالٍ من</h2>
                <div className="space-y-2">
                  {freeFrom.map((detail) => (
                    <div key={detail} className="flex items-start gap-3 text-sm text-neutral-700 md:text-base" style={sans}>
                      <span className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-neutral-400" aria-hidden />
                      <span>{detail}</span>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}
            {warning ? (
              <section className="space-y-3">
                <h2 className="text-sm font-semibold text-neutral-900 md:text-base" style={sans}>تحذير</h2>
                <p className="text-sm leading-relaxed text-neutral-700 md:text-base" style={sans}>
                  {warning}
                </p>
              </section>
            ) : null}
            {contents.length > 0 ? (
              <section className="space-y-3">
                <h2 className="text-sm font-semibold text-neutral-900 md:text-base" style={sans}>المحتويات</h2>
                <div className="space-y-2">
                  {contents.map((detail) => (
                    <div key={detail} className="flex items-start gap-3 text-sm text-neutral-700 md:text-base" style={sans}>
                      <span className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-neutral-400" aria-hidden />
                      <span>{detail}</span>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() =>
              addToCart({
                slug: product.slug,
                name: selectedSize ? `${product.name} - ${selectedSize.label}` : product.name,
                price: selectedSize ? `${selectedSize.sarPrice} ر.س` : product.price,
                image: product.image,
              })
            }
            className="mt-12 w-full rounded-full bg-neutral-900 py-4 text-sm font-semibold text-white transition-colors hover:bg-neutral-800"
            style={sans}
          >
            أضف إلى السلة
          </button>

          <div className="mt-10 space-y-8 border-t border-neutral-200/90 pt-8">
            <div>
              <h3 className="mb-2 text-sm font-semibold text-neutral-900" style={sans}>
                الشحن
              </h3>
              <p className="text-sm leading-relaxed text-neutral-600 md:text-base" style={sans}>
                شحن مجاني على الطلبات ضمن المملكة. تُجهّز الطلبات خلال 2–5 أيام عمل، مع تتبع يصلكِ عبر البريد أو
                الرسائل.
              </p>
            </div>
            <div>
              <h3 className="mb-2 text-sm font-semibold text-neutral-900" style={sans}>
                الإرجاع
              </h3>
              <p className="text-sm leading-relaxed text-neutral-600 md:text-base" style={sans}>
                يمكنك طلب الإرجاع خلال 14 يوماً من الاستلام، بشرط أن يبقى المنتج غير مفتوح، وبحالته الأصلية مع
                التغليف.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StorySection() {
  return (
    <section className="border-t border-neutral-200/80 bg-white py-20 md:py-28" dir="rtl">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-8">
        <p className="text-xs text-neutral-500" style={sans}>
          من الملكة جولد
        </p>
        <h2 className="mt-4 text-2xl font-medium leading-snug text-neutral-800 md:text-3xl" style={sans}>
          عناية تليق بكِ
        </h2>
        <p className="mt-6 text-base leading-relaxed text-neutral-600 md:text-lg" style={sans}>
          نؤمن بأن العناية الحقيقية تبدأ من التفاصيل. نختار مكوّنات بعناية، ونقدّم لكِ تجربة بسيطة وأنيقة تعكس
          ثقتكِ بنفسكِ في كل خطوة.
        </p>
      </div>
    </section>
  );
}

export default function ProductPage() {
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : "";
  const [product, setProduct] = useState<ProductItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false);
      return;
    }
    fetch(`/api/products/${encodeURIComponent(slug)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data || typeof data !== "object" || !("name" in data)) {
          setProduct(null);
          return;
        }
        setProduct({
          name: String(data.name),
          price: String(data.price),
          category: String(data.category),
          image: String(data.image),
          slug: String(data.slug),
          oldRiyal:
            typeof (data as { oldRiyal?: unknown }).oldRiyal === "number"
              ? Number((data as { oldRiyal: number }).oldRiyal)
              : typeof (data as { oldRiyal?: unknown }).oldRiyal === "string"
                ? Number((data as { oldRiyal: string }).oldRiyal)
                : null,
          descriptionAr: typeof (data as { descriptionAr?: unknown }).descriptionAr === "string" ? String((data as { descriptionAr: string }).descriptionAr) : null,
          ingredientsAr: typeof (data as { ingredientsAr?: unknown }).ingredientsAr === "string" ? String((data as { ingredientsAr: string }).ingredientsAr) : null,
          usageAr: typeof (data as { usageAr?: unknown }).usageAr === "string" ? String((data as { usageAr: string }).usageAr) : null,
          freeFromAr: typeof (data as { freeFromAr?: unknown }).freeFromAr === "string" ? String((data as { freeFromAr: string }).freeFromAr) : null,
          warningAr: typeof (data as { warningAr?: unknown }).warningAr === "string" ? String((data as { warningAr: string }).warningAr) : null,
          contentsAr: typeof (data as { contentsAr?: unknown }).contentsAr === "string" ? String((data as { contentsAr: string }).contentsAr) : null,
          sizes: Array.isArray((data as { sizes?: unknown }).sizes)
            ? (data as { sizes: ProductSizePrice[] }).sizes
            : null,
        });
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white pb-24 pt-32" dir="rtl">
        <p className="text-neutral-500" style={sans}>
          جاري التحميل…
        </p>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-white pb-24 pt-32" dir="rtl">
        <div className="mx-auto max-w-lg px-6 text-center">
          <h1 className="text-2xl font-medium text-neutral-900" style={sans}>
            المنتج غير متوفر
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
      <ProductMainSection product={product} />
      <StorySection />
      <RecommendedProductsSection excludeSlug={product.slug} />
    </main>
  );
}

