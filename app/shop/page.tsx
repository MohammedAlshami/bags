import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import { SafeImage } from "@/app/components/SafeImage";
import { sql } from "@/lib/db";
import { mapProduct, type ProductRow } from "@/lib/db-mappers";
import { sans, pagePaddingX } from "@/lib/page-theme";
import { formatDualPrice } from "@/lib/price-format";

type ShopCategory = {
  _id: string;
  name: string;
  sortOrder: number;
};

type ShopProduct = {
  name: string;
  price: string;
  oldRiyal?: number | null;
  sizes?: { label: string; sarPrice: number; oldRiyal: number }[] | null;
  category: string;
  categoryId?: string | null;
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
  const categoryRows = await sql`
    SELECT id, name, sort_order, created_at, updated_at
    FROM categories
    ORDER BY sort_order ASC, name ASC
  `;
  const rows = await sql`
    SELECT p.id, p.name, p.price, p.old_riyal, p.sizes, p.category, p.category_id, p.image,
           p.created_at, p.updated_at,
           cat.id AS cat_id, cat.name AS cat_name,
           c.id AS col_id, c.name AS col_name, c.slug AS col_slug
    FROM products p
    LEFT JOIN categories cat ON cat.id = p.category_id
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
      categoryId: mapped.categoryId,
      image: mapped.image,
      slug: mapped._id,
    };
  });

  const categories: ShopCategory[] =
    (categoryRows as { id: string; name: string; sort_order: number }[]).map((row) => ({
      _id: row.id,
      name: row.name,
      sortOrder: row.sort_order,
    }));

  const productsByCategory = Object.fromEntries(
    categories.map((category) => [
      category._id,
      products.filter((product) => product.categoryId === category._id || product.category === category.name),
    ])
  ) as Record<string, ShopProduct[]>;

  return (
    <main className="min-h-screen bg-white pb-24 pt-24 transition-colors md:pb-32 md:pt-32" dir="rtl">
      <div className={`mx-auto max-w-[1920px] ${pagePaddingX}`}>
        <Breadcrumbs items={[{ label: "الرئيسية", href: "/" }, { label: "المتجر" }]} />
        {categories.map((category) => (
          <CategorySection key={category._id} category={category.name} products={productsByCategory[category._id] ?? []} />
        ))}
      </div>
    </main>
  );
}

