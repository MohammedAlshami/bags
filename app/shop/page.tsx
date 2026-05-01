import { ShopPageBanner } from "@/app/components/ShopPageBanner";
import { ShopCategoryCards } from "@/app/components/shop/ShopCategoryCards";
import { ShopCatalogClient, type CatalogCategory, type CatalogProduct } from "@/app/components/shop/ShopCatalogClient";
import { sql } from "@/lib/db";
import { mapProduct, type ProductRow } from "@/lib/db-mappers";

type ShopCategory = {
  _id: string;
  name: string;
  sortOrder: number;
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; collection?: string }>;
}) {
  const { category: categoryParam, collection: collectionParam } = await searchParams;
  const initialCategoryId = categoryParam?.trim() ? categoryParam.trim() : null;
  const initialCollectionSlug = collectionParam?.trim() ? collectionParam.trim() : null;

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

  const products: CatalogProduct[] = (rows as ProductRow[]).map((row) => {
    const mapped = mapProduct(row, true);
    const col = mapped.collection;
    const collectionSlug =
      col && typeof col === "object" && "slug" in col && typeof col.slug === "string"
        ? col.slug
        : null;
    return {
      name: mapped.name,
      price: mapped.price,
      oldRiyal: mapped.oldRiyal,
      sizes: mapped.sizes as CatalogProduct["sizes"],
      category: mapped.category,
      categoryId: mapped.categoryId,
      image: mapped.image,
      slug: mapped._id,
      collectionSlug,
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
      products.filter(
        (product) => product.categoryId === category._id || product.category === category.name
      ),
    ])
  ) as Record<string, CatalogProduct[]>;

  const catalogCategories: CatalogCategory[] = categories.map((c) => ({
    _id: c._id,
    name: c.name,
    products: productsByCategory[c._id] ?? [],
  }));

  const categoryCards = catalogCategories
    .filter((c) => c.products.length > 0)
    .map((c) => ({
      id: c._id,
      name: c.name,
      productCount: c.products.length,
      image: c.products[0]?.image ?? "",
    }))
    .filter((c) => c.image);

  const allCategoryIds = new Set(catalogCategories.map((c) => c._id));
  const validatedInitialCategoryId =
    initialCategoryId && allCategoryIds.has(initialCategoryId) ? initialCategoryId : null;

  const collectionSlugRows = (await sql`SELECT slug FROM collections`) as { slug: string }[];
  const collectionSlugs = new Set(collectionSlugRows.map((r) => r.slug));
  const validatedInitialCollectionSlug =
    initialCollectionSlug && collectionSlugs.has(initialCollectionSlug)
      ? initialCollectionSlug
      : null;

  return (
    <main
      className="min-h-screen bg-white pb-24 transition-colors md:pb-32"
      dir="rtl"
    >
      <ShopPageBanner />
      <ShopCategoryCards items={categoryCards} />
      <ShopCatalogClient
        categories={catalogCategories}
        initialCategoryId={validatedInitialCategoryId}
        initialCollectionSlug={validatedInitialCollectionSlug}
      />
    </main>
  );
}
