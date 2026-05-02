import { SafeImage } from "@/app/components/SafeImage";
import { pagePaddingX, sans, serif } from "@/lib/page-theme";
import { formatDualDiscountPrice } from "@/lib/price-format";
import Link from "next/link";

export type ShopPackageProduct = {
  id: string;
  name: string;
  price: string;
  image: string;
};

export type ShopPackage = {
  id: string;
  name: string;
  description: string;
  image: string;
  price: string;
  oldRiyal: number | null;
  beforeDiscountPrice?: string | null;
  beforeDiscountOldRiyal?: number | null;
  products: ShopPackageProduct[];
};

export function ShopPackagesSection({ packages }: { packages: ShopPackage[] }) {
  if (packages.length === 0) return null;

  return (
    <section className="w-full py-8 md:py-10" aria-labelledby="shop-packages-heading" lang="ar">
      <div className={`mx-auto max-w-[1920px] ${pagePaddingX}`}>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-4 text-right md:mb-5">
          <div>
            <p className="text-xs font-semibold tracking-[0.26em] text-brand-primary md:text-sm" style={sans}>
              باقات مختارة
            </p>
            <h2 id="shop-packages-heading" className="mt-2 text-2xl font-semibold text-neutral-950 md:text-3xl" style={serif}>
              مجموعات جاهزة للعناية
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-neutral-600 md:text-[15px]" style={sans}>
            اختاري الباقة المناسبة واحصلي على مجموعة منتجات متكاملة بسعر خاص.
          </p>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {packages.map((item) => {
            const heroImage = item.image || item.products[0]?.image || "";
            const singlePackage = packages.length === 1;
            const priceLines = formatDualDiscountPrice({
              price: item.price,
              oldRiyal: item.oldRiyal,
              beforeDiscountPrice: item.beforeDiscountPrice,
              beforeDiscountOldRiyal: item.beforeDiscountOldRiyal,
            });
            return (
              <Link
                key={item.id}
                href={`/package/${encodeURIComponent(item.id)}`}
                className={[
                  "group relative h-[260px] shrink-0 overflow-hidden rounded-xl bg-neutral-100 outline-none ring-0 transition hover:opacity-[0.98] md:h-[300px]",
                  singlePackage ? "w-full" : "w-[min(88vw,760px)]",
                ].join(" ")}
                dir="rtl"
                aria-label={`عرض الباقة ${item.name}`}
              >
                {heroImage ? (
                  <SafeImage
                    src={heroImage}
                    alt={item.name}
                    fill
                    className="object-cover object-center transition duration-700 ease-out group-hover:scale-[1.05]"
                    sizes="(max-width: 768px) 88vw, 760px"
                  />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-l from-black/80 via-black/40 to-transparent md:bg-gradient-to-l" aria-hidden />
                <div className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col justify-end p-4 text-right text-white md:p-6">
                  <p className="text-xs font-medium text-white/85 md:text-sm" style={sans}>
                    ( {item.products.length.toLocaleString("ar-SA")} منتج )
                  </p>
                  <h3 className="mt-1 line-clamp-2 text-xl font-semibold leading-snug md:text-2xl lg:text-[1.65rem]" style={serif}>
                    {item.name}
                  </h3>
                  <p className="mt-2 text-xs font-semibold text-white md:text-sm" style={sans}>
                    {priceLines.current}
                  </p>
                  {priceLines.before ? (
                    <p className="mt-1 text-xs text-white/60 line-through" style={sans}>
                      {priceLines.before}
                    </p>
                  ) : null}
                  <p className="mt-2 line-clamp-2 text-xs leading-5 text-white/80 md:text-sm" style={sans}>
                    {item.description || "مجموعة منتجات مختارة بعناية."}
                  </p>
                  <div className="mt-4 flex items-center gap-3">
                    <span className="inline-flex border border-white/90 px-4 py-2 text-xs font-semibold tracking-[0.14em] text-white md:text-[13px]" style={sans}>
                      عرض الباقة
                    </span>
                    <div className="flex flex-row-reverse overflow-hidden">
                      {item.products.slice(0, 3).map((product) => (
                        <div key={product.id} className="-ms-2 relative size-8 overflow-hidden rounded-full border border-white bg-neutral-100 first:ms-0">
                          {product.image ? (
                            <SafeImage src={product.image} alt={product.name} fill className="object-cover object-center" sizes="32px" />
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
