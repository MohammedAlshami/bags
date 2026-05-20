import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { mapFaqItem, type FaqItemRow } from "@/lib/faq-items";

export const dynamic = "force-dynamic";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = (await request.json()) as Record<string, unknown>;
    const question = String(body.question ?? "");
    const answer = String(body.answer ?? "");
    const sortOrder = Number(body.sortOrder ?? 0);
    const isActive = body.isActive ? 1 : 0;
    const updatedAt = new Date().toISOString();

    await sql`
      UPDATE faq_items
      SET question = ${question}, answer = ${answer},
          sort_order = ${sortOrder}, is_active = ${isActive}, updated_at = ${updatedAt}
      WHERE id = ${id}
    `;
    const rows = await sql`SELECT * FROM faq_items WHERE id = ${id} LIMIT 1`;
    return NextResponse.json(mapFaqItem(rows[0] as FaqItemRow));
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update FAQ item";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await sql`DELETE FROM faq_items WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete FAQ item";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
