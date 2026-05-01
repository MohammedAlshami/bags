import { HomePageClient } from "./components/HomePageClient";
import { sql } from "@/lib/db";
import { mapProduct, type ProductRow } from "@/lib/db-mappers";
import { formatDualPrice, formatSizePrice } from "@/lib/price-format";
import type { SocialReelProduct } from "./components/SocialMediaSection";
import type { ReviewProductRef } from "./components/HomeReviewsSection";
import type { FeaturedProductItem } from "./components/FeaturedProductsClient";
import type { HomeCategorySectionData } from "./components/HomeCategoryProductSections";
import type { ShopByCategoryStripItem } from "./components/ShopByCategorySection";

type RankedProductRow = ProductRow & { rn: number };

function rowToFeaturedItem(row: ProductRow): FeaturedProductItem {
  const mapped = mapProduct(row, true);
  return {
    slug: mapped._id,
    image: mapped.image,
    category: mapped.category,
    name: mapped.name,
    price: mapped.price,
    oldRiyal: mapped.oldRiyal,
    sizes: mapped.sizes as FeaturedProductItem["sizes"],
  };
}

export default async function Home() {
  const categoryRows = await sql`
    SELECT id, name, sort_order
    FROM categories
    ORDER BY sort_order ASC, name ASC
  `;

  const categories = categoryRows as { id: string; name: string; sort_order: number }[];

  const rankedRows = (await sql`
    WITH ranked AS (
      SELECT
        p.id, p.name, p.price, p.old_riyal, p.sizes, p.category, p.category_id, p.image,
        p.created_at, p.updated_at,
        cat.id AS cat_id, cat.name AS cat_name,
        c.id AS col_id, c.name AS col_name, c.slug AS col_slug,
        ROW_NUMBER() OVER (PARTITION BY p.category_id ORDER BY p.created_at DESC) AS rn
      FROM products p
      INNER JOIN categories cat ON cat.id = p.category_id
      LEFT JOIN collections c ON c.id = p.collection_id
    )
    SELECT * FROM ranked WHERE rn <= 8 ORDER BY cat_id, rn
  `) as RankedProductRow[];

  const byCategoryId = new Map<string, FeaturedProductItem[]>();
  for (const row of rankedRows) {
    const cid = row.cat_id ?? row.category_id;
    if (!cid) continue;
    const list = byCategoryId.get(cid) ?? [];
    list.push(rowToFeaturedItem(row));
    byCategoryId.set(cid, list);
  }

  const categorySections: HomeCategorySectionData[] = categories
    .map((c) => ({
      categoryId: c.id,
      categoryName: c.name,
      products: byCategoryId.get(c.id) ?? [],
    }))
    .filter((s) => s.products.length > 0);

  const shopByCategoryItems: ShopByCategoryStripItem[] = categories.slice(0, 6).map((c) => ({
    categoryId: c.id,
    label: c.name,
    imageSrc: byCategoryId.get(c.id)?.[0]?.image ?? null,
  }));

  const recentRows = (await sql`
    SELECT p.id, p.name, p.price, p.old_riyal, p.sizes, p.category, p.category_id, p.image,
           p.created_at, p.updated_at,
           cat.id AS cat_id, cat.name AS cat_name,
           c.id AS col_id, c.name AS col_name, c.slug AS col_slug
    FROM products p
    LEFT JOIN categories cat ON cat.id = p.category_id
    LEFT JOIN collections c ON c.id = p.collection_id
    ORDER BY p.created_at DESC
    LIMIT 8
  `) as ProductRow[];

  const productRows = recentRows;

  const socialReelProducts: SocialReelProduct[] = productRows.slice(0, 4).map((row) => {
    const mapped = mapProduct(row, true);
    const size =
      Array.isArray(mapped.sizes) && mapped.sizes.length > 0 ? mapped.sizes[0] : null;
    const priceLine = size ? formatSizePrice(size) : formatDualPrice(mapped.price, mapped.oldRiyal);
    return {
      slug: mapped._id,
      name: mapped.name,
      image: mapped.image,
      priceLine,
    };
  });

  const reviewProducts: ReviewProductRef[] = productRows.map((row) => {
    const mapped = mapProduct(row, true);
    return {
      slug: mapped._id,
      name: mapped.name,
      image: mapped.image,
    };
  });

  return (
    <HomePageClient
      shopByCategoryItems={shopByCategoryItems}
      categorySections={categorySections}
      socialReelProducts={socialReelProducts}
      reviewProducts={reviewProducts}
    />
  );
}
