import Link from "next/link";
import Image from "next/image";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import { PRODUCTS, type Product } from "@/lib/products";
import { sans, pagePaddingX } from "@/lib/page-theme";

/** Same card treatment as `FeaturedProductsSection` — data from `lib/products`. */
function ProductCard({ product }: { product: Product }) {
  const { name, price, category, image, slug } = product;
  return (
    <Link href={`/product/${slug}`} className="group flex flex-col" dir="rtl">
      <div className="relative aspect-[3/5] w-full overflow-hidden rounded-2xl bg-white">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover object-center transition-transform duration-300 group-hover:scale-[1.03]"
          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
        />
      </div>
      <div className="mt-4 flex flex-col gap-1 text-center">
        <span className="text-xs text-neutral-500" style={sans}>
          {category}
        </span>
        <span className="text-sm font-semibold text-neutral-900" style={sans}>
          {name}
        </span>
        <span className="text-sm text-neutral-900" style={sans}>
          {price}
        </span>
      </div>
    </Link>
  );
}

export default function ShopPage() {
  return (
    <main className="min-h-screen bg-white pb-24 pt-24 md:pb-32 md:pt-32" dir="rtl">
      <div className={`mx-auto max-w-[1920px] ${pagePaddingX}`}>
        <Breadcrumbs items={[{ label: "الرئيسية", href: "/" }, { label: "المتجر" }]} />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-5 lg:grid-cols-4 lg:gap-6 xl:grid-cols-5">
          {PRODUCTS.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </div>
    </main>
  );
}
