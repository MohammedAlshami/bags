import Link from "next/link";
import { SafeImage } from "@/app/components/SafeImage";
import { pagePaddingX, sans, serif } from "@/lib/page-theme";
import { QGB } from "@/lib/brand-kit";

export type ShopByCategoryStripItem = {
  categoryId: string;
  label: string;
  imageSrc: string | null;
};

const SECTION_BG = "#F9F7F2";

type ShopByCategorySectionProps = {
  items: ShopByCategoryStripItem[];
};

export function ShopByCategorySection({ items }: ShopByCategorySectionProps) {
  if (items.length === 0) return null;

  return (
    <section
      className="w-full py-12 md:py-16"
      style={{ backgroundColor: SECTION_BG }}
      aria-labelledby="shop-by-category-heading"
      lang="ar"
    >
      <div className={`mx-auto max-w-6xl ${pagePaddingX}`}>
        <header className="mb-10 text-center md:mb-14">
          <p
            className="mb-2.5 text-xs font-semibold tracking-[0.26em] text-brand-dark/90 sm:text-[13px] md:text-sm"
            style={sans}
          >
            المجتمع
          </p>
          <h2
            id="shop-by-category-heading"
            className="text-[1.9rem] font-medium leading-tight text-[#1a1a1a] sm:text-[2.1rem] md:text-5xl md:font-normal lg:text-[3.25rem]"
            style={serif}
          >
            تسوق حسب الفئة
          </h2>
        </header>

        <div className="-mx-1 flex flex-nowrap justify-start gap-7 overflow-x-auto overflow-y-hidden pb-2 [-ms-overflow-style:none] [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:justify-center sm:gap-10 sm:overflow-visible sm:pb-0 md:gap-12 [&::-webkit-scrollbar]:hidden">
          {items.map((item) => (
            <Link
              key={item.categoryId}
              href={`/shop#cat-${item.categoryId}`}
              className="group flex w-[124px] shrink-0 flex-col items-center gap-3.5 sm:w-[138px] md:w-[152px] lg:w-[160px]"
              prefetch
            >
              <span
                className="relative block aspect-square w-full overflow-hidden rounded-full bg-white shadow-[0_10px_28px_rgba(153,40,79,0.11)] ring-1 ring-[rgba(0,0,0,0.05)] transition duration-300 group-hover:-translate-y-0.5 group-hover:shadow-[0_14px_32px_rgba(153,40,79,0.16)] group-hover:ring-brand-primary/20"
                aria-hidden={item.imageSrc ? undefined : true}
              >
                {item.imageSrc ? (
                  <SafeImage
                    src={item.imageSrc}
                    alt={item.label}
                    fill
                    sizes="(max-width: 640px) 124px, (max-width: 768px) 138px, 160px"
                    className="object-cover object-center transition-transform duration-300 group-hover:scale-[1.05]"
                  />
                ) : (
                  <span
                    className="flex h-full w-full items-center justify-center text-2xl font-semibold text-brand-dark/70 md:text-3xl"
                    style={{ backgroundColor: QGB.color.light, ...sans }}
                    aria-hidden
                  >
                    {item.label.trim().slice(0, 1) || "؟"}
                  </span>
                )}
              </span>
              <span
                className="max-w-[9.5rem] text-center text-[13px] font-semibold leading-snug tracking-wide text-neutral-800 sm:text-sm md:text-[15px]"
                style={sans}
              >
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
