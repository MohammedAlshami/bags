import { sql } from "@/lib/db";
import { mapProduct, type ProductRow } from "@/lib/db-mappers";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const rows = await sql`
      SELECT p.id, p.name, p.price, p.category, p.image, p.slug, p.collection_id,
             p.created_at, p.updated_at,
             c.id AS col_id, c.name AS col_name, c.slug AS col_slug
      FROM products p
      LEFT JOIN collections c ON c.id = p.collection_id
      WHERE p.slug = ${slug}
      LIMIT 1
    `;
    const row = rows[0] as ProductRow | undefined;
    if (!row) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json(mapProduct(row, false));
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch product";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
