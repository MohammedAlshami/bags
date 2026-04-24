import { sql } from "@/lib/db";
import { mapProduct, type ProductRow } from "@/lib/db-mappers";
import { FeaturedProductsClient, type FeaturedProductItem } from "./FeaturedProductsClient";

export async function FeaturedProductsSection() {
  const rows = await sql`
    SELECT p.id, p.name, p.price, p.category, p.category_id, p.image, p.collection_id,
           p.created_at, p.updated_at,
           cat.id AS cat_id, cat.name AS cat_name,
           c.id AS col_id, c.name AS col_name, c.slug AS col_slug
    FROM products p
    LEFT JOIN categories cat ON cat.id = p.category_id
    LEFT JOIN collections c ON c.id = p.collection_id
    ORDER BY p.created_at DESC
    LIMIT 8
  `;

  const mapped = (rows as ProductRow[]).map((r) => mapProduct(r, false));
  const products: FeaturedProductItem[] = mapped.map((p) => ({
    slug: p._id,
    image: p.image,
    category: p.category,
    name: p.name,
    price: p.price,
  }));

  return <FeaturedProductsClient products={products} />;
}
