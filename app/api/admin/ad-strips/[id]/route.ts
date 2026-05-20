import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { mapAdStrip, type AdStripRow } from "@/lib/ad-strips";

export const dynamic = "force-dynamic";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = (await request.json()) as Record<string, unknown>;
    const text = String(body.text ?? "");
    const isActive = body.isActive ? 1 : 0;
    const bgColor = body.bgColor ? String(body.bgColor) : null;
    const textColor = body.textColor ? String(body.textColor) : null;
    const linkUrl = body.linkUrl ? String(body.linkUrl) : null;
    const sortOrder = Number(body.sortOrder ?? 0);
    const updatedAt = new Date().toISOString();

    await sql`
      UPDATE ad_strips
      SET text = ${text}, is_active = ${isActive}, bg_color = ${bgColor},
          text_color = ${textColor}, link_url = ${linkUrl},
          sort_order = ${sortOrder}, updated_at = ${updatedAt}
      WHERE id = ${id}
    `;
    const rows = await sql`SELECT * FROM ad_strips WHERE id = ${id} LIMIT 1`;
    return NextResponse.json(mapAdStrip(rows[0] as AdStripRow));
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update ad strip";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await sql`DELETE FROM ad_strips WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete ad strip";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
