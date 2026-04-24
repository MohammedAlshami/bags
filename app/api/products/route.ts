import { sql } from "@/lib/db";
import { mapProduct, type ProductRow } from "@/lib/db-mappers";
import { NextResponse } from "next/server";
import { isUuid } from "@/lib/id";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() || "";
    const categoriesParam = searchParams.getAll("category").filter(Boolean);
    const collectionSlug = searchParams.get("collection")?.trim() || "";

    let collectionId: string | null = null;
    let filterGeneral = false;
    if (collectionSlug) {
      if (collectionSlug.toLowerCase() === "general") {
        filterGeneral = true;
      } else {
        const colRows = await sql`
          SELECT id FROM collections WHERE slug = ${collectionSlug} LIMIT 1
        `;
        if (colRows[0]) collectionId = colRows[0].id as string;
      }
    }

    const rows = await sql`
      SELECT p.id, p.name, p.price, p.old_riyal, p.sizes, p.category, p.category_id, p.image, p.collection_id,
             p.created_at, p.updated_at,
             cat.id AS cat_id, cat.name AS cat_name,
             c.id AS col_id, c.name AS col_name, c.slug AS col_slug
      FROM products p
      LEFT JOIN categories cat ON cat.id = p.category_id
      LEFT JOIN collections c ON c.id = p.collection_id
      ORDER BY p.name ASC
    `;

    const list = (rows as ProductRow[]).map((r) => mapProduct(r, false)).filter((item) => {
      const matchesSearch =
        search === "" ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.category.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        categoriesParam.length === 0 ||
        categoriesParam.some((value) => {
          const token = value.trim();
          if (!token) return false;
          if (isUuid(token)) return item.categoryId === token;
          return item.category === token;
        });
      const matchesCollection =
        collectionSlug === "" ||
        (filterGeneral && item.collection == null) ||
        (!filterGeneral && collectionId != null && item.collection === collectionId) ||
        (!filterGeneral && collectionId == null);
      return matchesSearch && matchesCategory && matchesCollection;
    });
    return NextResponse.json(list);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch products";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
