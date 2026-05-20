import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { mapReview, type ReviewRow } from "@/lib/reviews";

export const dynamic = "force-dynamic";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = (await request.json()) as Record<string, unknown>;
    const author = String(body.author ?? "");
    const bodyText = String(body.body ?? "");
    const productId = body.productId ? String(body.productId) : null;
    const sortOrder = Number(body.sortOrder ?? 0);
    const isActive = body.isActive ? 1 : 0;
    const updatedAt = new Date().toISOString();

    await sql`
      UPDATE reviews
      SET author = ${author}, body = ${bodyText}, product_id = ${productId},
          sort_order = ${sortOrder}, is_active = ${isActive}, updated_at = ${updatedAt}
      WHERE id = ${id}
    `;
    const rows = await sql`SELECT * FROM reviews WHERE id = ${id} LIMIT 1`;
    return NextResponse.json(mapReview(rows[0] as ReviewRow));
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update review";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await sql`DELETE FROM reviews WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete review";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
