import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { mapHeroImage, type HeroImageRow } from "@/lib/hero-images-api";

export const dynamic = "force-dynamic";

export async function GET() {
  const rows = await sql`SELECT * FROM hero_images ORDER BY sort_order ASC`;
  return NextResponse.json((rows as HeroImageRow[]).map(mapHeroImage));
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const id = crypto.randomUUID();
    const imageUrl = String(body.imageUrl ?? "");

    const maxRow = (await sql`SELECT COALESCE(MAX(sort_order), -1) AS mx FROM hero_images`)[0] as { mx: number };
    const nextSort = maxRow.mx + 1;

    await sql`
      INSERT INTO hero_images (id, image_url, sort_order)
      VALUES (${id}, ${imageUrl}, ${nextSort})
    `;

    const rows = await sql`SELECT * FROM hero_images WHERE id = ${id} LIMIT 1`;
    return NextResponse.json(mapHeroImage(rows[0] as HeroImageRow), { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create hero image";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
