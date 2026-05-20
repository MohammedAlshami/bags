import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { mapSocialLink, type SocialLinkRow } from "@/lib/social-links";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const rows = await sql`SELECT * FROM social_links WHERE id = ${id} LIMIT 1`;
  const row = rows[0] as SocialLinkRow | undefined;
  if (!row) {
    return NextResponse.json({ error: "Social link not found" }, { status: 404 });
  }
  return NextResponse.json(mapSocialLink(row));
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = (await request.json()) as Record<string, unknown>;
    const platform = String(body.platform ?? "");
    const label = String(body.label ?? "");
    const url = String(body.url ?? "");
    const icon = body.icon ? String(body.icon) : null;
    const displayOrder = Number(body.displayOrder ?? 0);
    const updatedAt = new Date().toISOString();

    await sql`
      UPDATE social_links
      SET platform = ${platform}, label = ${label}, url = ${url},
          icon = ${icon}, display_order = ${displayOrder}, updated_at = ${updatedAt}
      WHERE id = ${id}
    `;
    const rows = await sql`SELECT * FROM social_links WHERE id = ${id} LIMIT 1`;
    return NextResponse.json(mapSocialLink(rows[0] as SocialLinkRow));
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update social link";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await sql`DELETE FROM social_links WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete social link";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
