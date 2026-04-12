"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { SafeImage } from "@/app/components/SafeImage";
import Link from "next/link";
import { useCart } from "@/app/context/CartContext";
import { RecommendedProductsSection } from "@/app/components/RecommendedProductsSection";
import { sans } from "@/lib/page-theme";

type ProductItem = { name: string; price: string; category: string; image: string; slug: string };

const DEFAULT_DESCRIPTION_AR =
  "صُنع بعناية ليدعم بشرتك بنضارة طبيعية وملمس ناعم. تركيبة متوازنة تناسب الاستخدام اليومي، مع التزامنا بجودة العناية التي تليق بعلامة الملكة جولد.";
const DEFAULT_DETAILS_AR = [
  "مناسب للاستخدام اليومي",
  "تركيبة مختبرة ومتوازنة",
  "عبوة عملية للسفر والاستخدام السريع",
  "تغليف أنيق يحافظ على المنتج",
  "صُنع بعناية وفخر محلي",
];

function ProductMainSection({
  product,
  description,
  details,
}: {
  product: ProductItem;
  description: string;
  details: string[];
}) {
  const { addToCart } = useCart();

  return (
    <div className="mx-auto max-w-[1920px] px-4 py-12 pt-24 sm:px-8 md:px-14 md:pt-32 lg:px-24">
      <div className="grid gap-12 lg:grid-cols-12">
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
          <p className="mt-5 text-xl text-neutral-900 md:text-2xl" style={sans}>
            {product.price}
          </p>
          <p className="mt-8 text-sm leading-relaxed text-neutral-600 md:text-base" style={sans}>
            {description}
          </p>

          <div className="mt-10 space-y-3 border-t border-neutral-200/90 pt-8">
            {details.map((detail) => (
              <div key={detail} className="flex items-start gap-3 text-sm text-neutral-700 md:text-base" style={sans}>
                <span className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-neutral-400" aria-hidden />
                <span>{detail}</span>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => addToCart({ slug: product.slug, name: product.name, price: product.price, image: product.image })}
            className="mt-12 w-full rounded-full bg-neutral-900 py-4 text-sm font-semibold text-white transition-colors hover:bg-neutral-800"
            style={sans}
          >
            أضف إلى السلة
          </button>

          <div className="mt-12 space-y-8 border-t border-neutral-200/90 pt-8">
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
      <ProductMainSection product={product} description={DEFAULT_DESCRIPTION_AR} details={DEFAULT_DETAILS_AR} />
      <StorySection />
      <RecommendedProductsSection excludeSlug={product.slug} />
    </main>
  );
}
