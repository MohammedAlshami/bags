import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { mapSocialLink, type SocialLinkRow } from "@/lib/social-links";

export const dynamic = "force-dynamic";

export async function GET() {
  const rows = await sql`SELECT * FROM social_links ORDER BY display_order ASC`;
  return NextResponse.json((rows as SocialLinkRow[]).map(mapSocialLink));
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const id = crypto.randomUUID();
    const platform = String(body.platform ?? "");
    const label = String(body.label ?? "");
    const url = String(body.url ?? "");
    const icon = body.icon ? String(body.icon) : null;
    const displayOrder = Number(body.displayOrder ?? 0);

    await sql`
      INSERT INTO social_links (id, platform, label, url, icon, display_order)
      VALUES (${id}, ${platform}, ${label}, ${url}, ${icon}, ${displayOrder})
    `;
    const rows = await sql`SELECT * FROM social_links WHERE id = ${id} LIMIT 1`;
    return NextResponse.json(mapSocialLink(rows[0] as SocialLinkRow), { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create social link";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
