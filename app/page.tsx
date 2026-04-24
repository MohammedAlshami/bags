import { HomePageClient } from "./components/HomePageClient";
import { sql } from "@/lib/db";
import { mapProduct, type ProductRow } from "@/lib/db-mappers";

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

  const featuredProducts = (rows as ProductRow[]).map((row) => {
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

  return <HomePageClient featuredProducts={featuredProducts} />;
}
