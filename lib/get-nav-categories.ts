import { sql } from "@/lib/db";

export type NavCategory = {
  id: string;
  name: string;
  image: string;
  productCount: number;
};

export async function getNavData(): Promise<{ categories: NavCategory[] }> {
  const categoryRows = await sql`
    SELECT
      cat.id,
      cat.name,
      (SELECT COUNT(*)::int FROM products p WHERE p.category_id = cat.id) AS product_count,
      (
        SELECT p.image
        FROM products p
        WHERE p.category_id = cat.id
        ORDER BY p.created_at DESC
        LIMIT 1
      ) AS sample_image
    FROM categories cat
    ORDER BY cat.sort_order ASC, cat.name ASC
  `;
  return {
    categories: (
      categoryRows as {
        id: string;
        name: string;
        product_count: number;
        sample_image: string | null;
      }[]
    ).map((r) => {
      const fromRow = typeof r.sample_image === "string" ? r.sample_image.trim() : "";
      return {
        id: r.id,
        name: r.name,
        image: fromRow,
        productCount: Number(r.product_count) || 0,
      };
    }),
  };
}
