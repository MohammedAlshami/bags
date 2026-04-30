import { HomePageClient } from "./components/HomePageClient";
import { sql } from "@/lib/db";
import { mapProduct, type ProductRow } from "@/lib/db-mappers";
import { formatDualPrice, formatSizePrice } from "@/lib/price-format";
import type { SocialReelProduct } from "./components/SocialMediaSection";
import type { ReviewProductRef } from "./components/HomeReviewsSection";

export default async function Home() {
  const rows = await sql`
    SELECT p.id, p.name, p.price, p.old_riyal, p.sizes, p.category, p.category_id, p.image,
           p.created_at, p.updated_at,
           cat.id AS cat_id, cat.name AS cat_name,
           c.id AS col_id, c.name AS col_name, c.slug AS col_slug
    FROM products p
    LEFT JOIN categories cat ON cat.id = p.category_id
    LEFT JOIN collections c ON c.id = p.collection_id
    ORDER BY p.created_at DESC
    LIMIT 8
  `;

  const productRows = rows as ProductRow[];

  const featuredProducts = productRows.map((row) => {
    const mapped = mapProduct(row, true);
    return {
      slug: mapped._id,
      image: mapped.image,
      category: mapped.category,
      name: mapped.name,
      price: mapped.price,
      oldRiyal: mapped.oldRiyal,
      sizes: mapped.sizes,
    };
  });

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

  const reviewProducts: ReviewProductRef[] = featuredProducts.map((p) => ({
    slug: p.slug,
    name: p.name,
    image: p.image,
  }));

  return (
    <HomePageClient
      featuredProducts={featuredProducts}
      socialReelProducts={socialReelProducts}
      reviewProducts={reviewProducts}
    />
  );
}
