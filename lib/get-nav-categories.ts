import { sql } from "@/lib/db";

export type NavCategory = { id: string; name: string };
export type NavCollection = { slug: string; name: string };

export async function getNavData(): Promise<{
  categories: NavCategory[];
  collections: NavCollection[];
}> {
  const categoryRows = await sql`
    SELECT id, name, sort_order FROM categories
    ORDER BY sort_order ASC, name ASC
  `;
  const colRows = await sql`
    SELECT slug, name FROM collections
    ORDER BY name ASC
  `;
  return {
    categories: (categoryRows as { id: string; name: string }[]).map((r) => ({
      id: r.id,
      name: r.name,
    })),
    collections: (colRows as { slug: string; name: string }[]).map((r) => ({
      slug: r.slug,
      name: r.name,
    })),
  };
}
