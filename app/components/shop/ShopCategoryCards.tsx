import Link from "next/link";
import { SafeImage } from "@/app/components/SafeImage";
import { pagePaddingX, sans, serif } from "@/lib/page-theme";

export type ShopCategoryCardModel = {
  id: string;
  name: string;
  image: string;
  productCount: number;
};

/** Category strip under shop hero — full-bleed image cards, no section tint. */
export function ShopCategoryCards({ items }: { items: ShopCategoryCardModel[] }) {
  if (items.length === 0) return null;

  return (
    <section className="w-full py-8 md:py-10" aria-labelledby="shop-category-cards-heading" lang="ar">
      <div className={`mx-auto max-w-[1920px] ${pagePaddingX}`}>
        <h2 id="shop-category-cards-heading" className="sr-only">
          تصفّحي حسب الفئة
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {items.map((c) => (
            <Link
              key={c.id}
              href={`/shop?category=${encodeURIComponent(c.id)}#shop-catalog`}
              className="group relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-neutral-100 outline-none ring-0 transition hover:opacity-[0.98] focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2"
              prefetch
            >
              <SafeImage
                src={c.image}
                alt={c.name}
                fill
                className="object-cover object-center transition duration-700 ease-out group-hover:scale-[1.05]"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
              <div
                className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent"
                aria-hidden
              />
              <div className="absolute inset-x-0 bottom-0 flex flex-col items-stretch p-4 text-right text-white md:p-5">
                <p className="text-sm font-medium text-white/85 md:text-base" style={sans}>
                  ( {c.productCount.toLocaleString("ar-SA")} منتج )
                </p>
                <h3
                  className="mt-1 text-xl font-semibold leading-snug md:text-2xl lg:text-[1.65rem]"
                  style={serif}
                >
                  {c.name}
                </h3>
                <span
                  className="mt-4 inline-flex w-fit self-end border border-white/90 px-4 py-2 text-xs font-semibold tracking-[0.14em] text-white md:text-[13px]"
                  style={sans}
                >
                  عرض المنتجات
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
