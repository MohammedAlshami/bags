"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { SafeImage } from "@/app/components/SafeImage";
import { sans, serif, pagePaddingX } from "@/lib/page-theme";

type BaImage = { _id: string; imageUrl: string; sortOrder: number };

export function BeforeAfterSection() {
  const [images, setImages] = useState<BaImage[]>([]);
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    fetch("/api/admin/before-after")
      .then((r) => r.json())
      .then(setImages)
      .catch(() => {});
  }, []);

  const scrollTo = useCallback((i: number) => {
    const n = images.length;
    if (n === 0) return;
    const next = Math.max(0, Math.min(i, n - 1));
    setIndex(next);
    refs.current[next]?.scrollIntoView({ behavior: "smooth", inline: "nearest", block: "nearest" });
  }, [images.length]);

  const goPrev = useCallback(() => scrollTo(index - 1), [index, scrollTo]);
  const goNext = useCallback(() => scrollTo(index + 1), [index, scrollTo]);

  if (images.length === 0) return null;

  return (
    <section className="w-full bg-[#FAF8F5] py-14 md:py-20" aria-labelledby="before-after-heading" dir="rtl">
      <div className={`mx-auto max-w-[1600px] ${pagePaddingX}`}>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="text-start">
            <h2
              id="before-after-heading"
              className="text-xl font-semibold text-brand-primary md:text-2xl"
              style={serif}
            >
              قبل وبعد — النتائج تتحدث
            </h2>
            <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-neutral-600 sm:text-sm" style={sans}>
              صور حقيقية من عميلاتنا — شاهدي الفرق بنفسك.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={goNext}
              disabled={index >= images.length - 1}
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
          {images.map((img, idx) => (
            <div
              key={img._id}
              ref={(el) => { refs.current[idx] = el; }}
              className="flex shrink-0 self-stretch snap-center snap-aligned"
            >
              <div className="relative w-[min(100%,260px)] overflow-hidden rounded-2xl border border-neutral-200/90 bg-white ring-1 ring-black/[0.03] sm:w-[280px] md:w-[300px]">
                <div className="relative aspect-[4/5] w-full bg-neutral-100">
                  <SafeImage
                    src={img.imageUrl}
                    alt="نتيجة قبل وبعد"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 85vw, 300px"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
