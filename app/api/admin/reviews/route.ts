import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { mapReview, type ReviewRow } from "@/lib/reviews";

export const dynamic = "force-dynamic";

export async function GET() {
  const rows = await sql`SELECT * FROM reviews ORDER BY sort_order ASC, created_at DESC`;
  return NextResponse.json((rows as ReviewRow[]).map(mapReview));
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const id = crypto.randomUUID();
    const author = String(body.author ?? "");
    const bodyText = String(body.body ?? "");
    const productId = body.productId ? String(body.productId) : null;
    const sortOrder = Number(body.sortOrder ?? 0);
    const isActive = body.isActive ? 1 : 0;

    await sql`
      INSERT INTO reviews (id, author, body, product_id, sort_order, is_active)
      VALUES (${id}, ${author}, ${bodyText}, ${productId}, ${sortOrder}, ${isActive})
    `;
    const rows = await sql`SELECT * FROM reviews WHERE id = ${id} LIMIT 1`;
    return NextResponse.json(mapReview(rows[0] as ReviewRow), { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create review";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
