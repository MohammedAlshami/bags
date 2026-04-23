import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import { SafeImage } from "@/app/components/SafeImage";
import { sql } from "@/lib/db";
import { mapProduct, type ProductRow } from "@/lib/db-mappers";
import { CATEGORIES } from "@/lib/products";
import { sans, pagePaddingX } from "@/lib/page-theme";
import { formatDualPrice } from "@/lib/price-format";

type ShopProduct = {
  name: string;
  price: string;
  oldRiyal?: number | null;
  sizes?: { label: string; sarPrice: number; oldRiyal: number }[] | null;
  category: string;
  image: string;
  slug: string;
};

function ProductCard({ product }: { product: ShopProduct }) {
  const { name, price, oldRiyal, category, image, slug } = product;
  const size = Array.isArray(product.sizes) && product.sizes.length > 0 ? product.sizes[0] : null;
  const priceLine = size ? `${size.oldRiyal.toLocaleString("en-US")} ر ق / ${size.sarPrice} ر س` : formatDualPrice(price, oldRiyal);
  return (
    <Link href={`/product/${slug}`} className="group flex flex-col" dir="rtl">
      <div className="relative aspect-[3/5] w-full overflow-hidden rounded-2xl bg-white">
        <SafeImage
          src={image}
          alt={name}
          fill
          className="object-cover object-center transition-transform duration-300 group-hover:scale-[1.03]"
          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
        />
      </div>
      <div className="mt-4 flex flex-col gap-1 text-right">
        <span className="text-xs text-neutral-500" style={sans}>
          {category}
        </span>
        <span className="text-sm font-semibold text-neutral-900" style={sans}>
          {name}
        </span>
        <span className="text-sm text-neutral-900" style={sans}>
          {priceLine}
        </span>
      </div>
    </Link>
  );
}

function CategoryHeader({ category }: { category: string }) {
  return (
    <div className="mb-5 w-full overflow-hidden rounded-3xl bg-[#d44c7d] px-5 py-4 md:px-6 md:py-5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Sparkles className="h-4 w-4 shrink-0 text-white" aria-hidden />
          <h2 className="text-xl font-black tracking-wide text-white md:text-2xl" style={sans}>
            {category}
          </h2>
        </div>
      </div>
    </div>
  );
}

function CategorySection({ category, products }: { category: string; products: ShopProduct[] }) {
  return (
    <section className="mb-10">
      <CategoryHeader category={category} />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-5 lg:grid-cols-4 lg:gap-6 xl:grid-cols-5">
        {products.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>
    </section>
  );
}

export default async function ShopPage() {
  const rows = await sql`
    SELECT p.id, p.name, p.price, p.old_riyal, p.sizes, p.category, p.image, p.slug,
           p.created_at, p.updated_at,
           c.id AS col_id, c.name AS col_name, c.slug AS col_slug
    FROM products p
    LEFT JOIN collections c ON c.id = p.collection_id
    ORDER BY p.name ASC
  `;

  const products = (rows as ProductRow[]).map((row) => {
    const mapped = mapProduct(row, true);
    return {
      name: mapped.name,
      price: mapped.price,
      oldRiyal: mapped.oldRiyal,
      sizes: mapped.sizes as ShopProduct["sizes"],
      category: mapped.category,
      image: mapped.image,
      slug: mapped.slug,
    };
  });

  const productsByCategory = Object.fromEntries(
    CATEGORIES.map((category) => [category, products.filter((product) => product.category === category)])
  ) as Record<(typeof CATEGORIES)[number], ShopProduct[]>;

  return (
    <main className="min-h-screen bg-white pb-24 pt-24 transition-colors md:pb-32 md:pt-32" dir="rtl">
      <div className={`mx-auto max-w-[1920px] ${pagePaddingX}`}>
        <Breadcrumbs items={[{ label: "الرئيسية", href: "/" }, { label: "المتجر" }]} />
        {CATEGORIES.map((category) => (
          <CategorySection key={category} category={category} products={productsByCategory[category]} />
        ))}
      </div>
    </main>
  );
}

