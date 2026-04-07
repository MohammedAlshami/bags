import { sql } from "@/lib/db";
import { mapProduct, type ProductRow } from "@/lib/db-mappers";
import { FeaturedProductsClient, type FeaturedProductItem } from "./FeaturedProductsClient";

export async function FeaturedProductsSection() {
  const rows = await sql`
    SELECT p.id, p.name, p.price, p.category, p.image, p.slug, p.collection_id,
           p.created_at, p.updated_at,
           c.id AS col_id, c.name AS col_name, c.slug AS col_slug
    FROM products p
    LEFT JOIN collections c ON c.id = p.collection_id
    ORDER BY p.created_at DESC
    LIMIT 8
  `;

  const mapped = (rows as ProductRow[]).map((r) => mapProduct(r, false));
  const products: FeaturedProductItem[] = mapped.map((p) => ({
    slug: p.slug,
    image: p.image,
    category: p.category,
    name: p.name,
    price: p.price,
  }));

  return <FeaturedProductsClient products={products} />;
}
