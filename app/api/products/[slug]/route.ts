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
      SELECT p.id, p.name, p.price, p.old_riyal,
             p.before_discount_price, p.before_discount_old_riyal,
             p.sizes, p.category, p.category_id, p.image,
             p.description_ar, p.ingredients_ar, p.usage_ar, p.free_from_ar, p.warning_ar, p.contents_ar,
             p.collection_id,
             p.created_at, p.updated_at,
             cat.id AS cat_id, cat.name AS cat_name,
             c.id AS col_id, c.name AS col_name, c.slug AS col_slug
      FROM products p
      LEFT JOIN categories cat ON cat.id = p.category_id
      LEFT JOIN collections c ON c.id = p.collection_id
      WHERE p.id = ${slug}::uuid
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
