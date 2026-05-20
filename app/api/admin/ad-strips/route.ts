import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { mapAdStrip, type AdStripRow } from "@/lib/ad-strips";

export const dynamic = "force-dynamic";

export async function GET() {
  const rows = await sql`SELECT * FROM ad_strips LIMIT 1`;
  const row = rows[0] as AdStripRow | undefined;
  if (!row) return NextResponse.json(null);
  return NextResponse.json(mapAdStrip(row));
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const text = String(body.text ?? "");
    const isActive = body.isActive ? 1 : 0;
    const bgColor = body.bgColor ? String(body.bgColor) : null;
    const textColor = body.textColor ? String(body.textColor) : null;
    const linkUrl = body.linkUrl ? String(body.linkUrl) : null;
    const updatedAt = new Date().toISOString();

    await sql`
      UPDATE ad_strips
      SET text = ${text}, is_active = ${isActive},
          bg_color = ${bgColor}, text_color = ${textColor},
          link_url = ${linkUrl}, updated_at = ${updatedAt}
      WHERE id = (SELECT id FROM ad_strips LIMIT 1)
    `;
    const rows = await sql`SELECT * FROM ad_strips LIMIT 1`;
    return NextResponse.json(mapAdStrip(rows[0] as AdStripRow));
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update ad strip";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
