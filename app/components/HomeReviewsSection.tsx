"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import { SafeImage } from "@/app/components/SafeImage";
import { sans } from "@/lib/page-theme";

export type ReviewProductRef = {
  slug: string;
  name: string;
  image: string;
};

const REVIEW_ENTRIES: { author: string; body: string }[] = [
  {
    author: "نورة ع.",
    body: "النتيجة فاقت التوقعات؛ بشرتي أصبحت أكثر نعومة ولمعاناً منذ أسبوعين. التغليف أنيق والتوصيل سريع.",
  },
  {
    author: "لينا م.",
    body: "أول مرة أجرب منتجات محلية بهذه الجودة. رائحة خفيفة مريحة والتركيبة لا تثقل البشرة.",
  },
  {
    author: "ريم س.",
    body: "طلبت للعائلة والجميع راضٍ. خدمة العملاء على الواتساب استجابت بسرعة وساعدتني في اختيار المناسب.",
  },
  {
    author: "هند أ.",
    body: "أستخدم السيروم يومياً مع الكريم؛ الهالات خفت بشكل ملحوظ. أنصح به بصراحة.",
  },
  {
    author: "دانة ك.",
    body: "الشحن وصل قبل الموعد والمنتج مطابق للصور. أعد الطلب بكل ثقة.",
  },
];

function ReviewCard({
  author,
  body,
  product,
}: {
  author: string;
  body: string;
  product: ReviewProductRef;
}) {
  return (
    <article
      data-review-card
      className="flex h-full min-h-0 w-[min(100%,280px)] shrink-0 snap-center snap-always flex-col overflow-hidden rounded-2xl border border-neutral-200/90 bg-white ring-1 ring-black/[0.03] sm:w-[300px] md:w-[320px]"
      dir="rtl"
    >
      <div className="relative aspect-[4/3] w-full shrink-0 bg-neutral-100">
        <SafeImage
          src={product.image}
          alt=""
          fill
          className="object-cover"
          sizes="(max-width: 768px) 85vw, 320px"
        />
      </div>
      <div className="flex min-h-0 flex-1 flex-col p-4 sm:p-5">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <span className="text-[15px] font-semibold text-neutral-900 sm:text-base" style={sans}>
            {author}
          </span>
          <span className="text-[11px] font-medium text-neutral-400 sm:text-xs" style={sans}>
            مشتري موثّق
          </span>
        </div>
        <p className="mt-3 min-h-0 flex-1 text-[13px] leading-relaxed text-neutral-600 sm:text-[14px]" style={sans}>
          {body}
        </p>
        <Link
          href={`/product/${encodeURIComponent(product.slug)}`}
          className="mt-auto flex items-center gap-3 rounded-xl border border-neutral-100 bg-neutral-50/90 px-2.5 py-2 pt-4 transition-colors hover:border-brand-primary/25 hover:bg-brand-light/30"
          style={sans}
        >
          <span className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-white ring-1 ring-black/5">
            <SafeImage src={product.image} alt="" fill className="object-cover" sizes="40px" />
          </span>
          <span className="min-w-0 flex-1 truncate text-[12px] font-semibold text-neutral-800 sm:text-[13px]">
            {product.name}
          </span>
        </Link>
      </div>
    </article>
  );
}

export function HomeReviewsSection({ products }: { products: ReviewProductRef[] }) {
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [index, setIndex] = useState(0);

  const entries = useMemo(() => {
    if (!products.length) return [];
    return REVIEW_ENTRIES.map((r, i) => ({
      ...r,
      product: products[i % products.length]!,
    }));
  }, [products]);

  const scrollTo = useCallback((i: number) => {
    const n = entries.length;
    if (n === 0) return;
    const next = Math.max(0, Math.min(i, n - 1));
    setIndex(next);
    cardRefs.current[next]?.scrollIntoView({ behavior: "smooth", inline: "nearest", block: "nearest" });
  }, [entries.length]);

  const goPrev = useCallback(() => scrollTo(index - 1), [index, scrollTo]);
  const goNext = useCallback(() => scrollTo(index + 1), [index, scrollTo]);

  if (entries.length === 0) return null;

  return (
    <section className="w-full bg-[#FAF8F5] py-14 md:py-20" aria-labelledby="home-reviews-heading" dir="rtl">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-8 md:px-14 lg:px-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="text-start">
            <h2
              id="home-reviews-heading"
              className="text-xl font-semibold text-brand-primary md:text-2xl"
              style={{ fontFamily: "var(--font-cormorant), serif" }}
            >
              آلاف آراء العملاء الراضيات
            </h2>
            <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-neutral-600 sm:text-sm" style={sans}>
              تجارب حقيقية من مدن مختلفة — شكراً لثقتكِ بنا.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={goNext}
              disabled={index >= entries.length - 1}
              className="inline-flex size-10 items-center justify-center rounded-full border-[1.5px] border-brand-primary bg-white text-brand-primary transition-colors hover:bg-brand-light disabled:pointer-events-none disabled:opacity-35"
              aria-label="التالي"
            >
              <ChevronRight className="size-5" strokeWidth={1.5} aria-hidden />
            </button>
            <button
              type="button"
              onClick={goPrev}
              disabled={index <= 0}
              className="inline-flex size-10 items-center justify-center rounded-full border-[1.5px] border-brand-primary bg-white text-brand-primary transition-colors hover:bg-brand-light disabled:pointer-events-none disabled:opacity-35"
              aria-label="السابق"
            >
              <ChevronLeft className="size-5" strokeWidth={1.5} aria-hidden />
            </button>
          </div>
        </div>

        <div
          className="mt-10 flex items-stretch gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {entries.map((item, idx) => (
            <div
              key={`${item.author}-${idx}`}
              ref={(el) => {
                cardRefs.current[idx] = el;
              }}
              className="flex shrink-0 self-stretch"
            >
              <ReviewCard author={item.author} body={item.body} product={item.product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
