import { HomePageClient } from "./components/HomePageClient";
import { sql } from "@/lib/db";
import { mapProduct, type ProductRow } from "@/lib/db-mappers";

export default async function Home() {
  const rows = await sql`
    SELECT p.id, p.name, p.price, p.category, p.image, p.slug,
           p.created_at, p.updated_at,
           c.id AS col_id, c.name AS col_name, c.slug AS col_slug
    FROM products p
    LEFT JOIN collections c ON c.id = p.collection_id
    ORDER BY p.created_at DESC
    LIMIT 8
  `;

  const featuredProducts = (rows as ProductRow[]).map((row) => {
    const mapped = mapProduct(row, true);
    return {
      slug: mapped.slug,
      image: mapped.image,
      category: mapped.category,
      name: mapped.name,
      price: mapped.price,
    };
  });

  return <HomePageClient featuredProducts={featuredProducts} />;
}
