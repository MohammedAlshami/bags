import { sql } from "@/lib/db";
import { mapProduct, type ProductRow } from "@/lib/db-mappers";
import { NextResponse } from "next/server";

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
      SELECT p.id, p.name, p.price, p.category, p.image, p.slug, p.collection_id,
             p.created_at, p.updated_at,
             c.id AS col_id, c.name AS col_name, c.slug AS col_slug
      FROM products p
      LEFT JOIN collections c ON c.id = p.collection_id
      WHERE
        (${search}::text = '' OR p.name ILIKE '%' || ${search} || '%' OR p.category ILIKE '%' || ${search} || '%')
        AND (cardinality(${categoriesParam}::text[]) = 0 OR p.category = ANY(${categoriesParam}::text[]))
        AND (
          (${collectionSlug}::text = '')
          OR (${filterGeneral}::boolean IS TRUE AND p.collection_id IS NULL)
          OR (${collectionId}::uuid IS NOT NULL AND p.collection_id = ${collectionId}::uuid)
          OR (
            ${collectionSlug}::text <> ''
            AND ${filterGeneral}::boolean IS NOT TRUE
            AND ${collectionId}::uuid IS NULL
          )
        )
    `;

    const list = (rows as ProductRow[]).map((r) => mapProduct(r, false));
    return NextResponse.json(list);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch products";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
