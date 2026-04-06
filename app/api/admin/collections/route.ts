import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { mapCollection, type CollectionRow } from "@/lib/db-mappers";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();
    const rows = await sql`
      SELECT id, name, slug, image, description, story, material, quality, created_at, updated_at
      FROM collections
      ORDER BY name ASC
    `;
    const list = (rows as CollectionRow[]).map((r) => mapCollection(r));
    return NextResponse.json(list);
  } catch (err) {
    const e = err as { status?: number };
    if (e.status === 403) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ error: "Failed to fetch collections" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();
    const name = String(body.name ?? "").trim();
    const slug =
      String(body.slug ?? "").trim() ||
      name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const image = String(body.image ?? "").trim();
    const description = String(body.description ?? "").trim();
    const story = String(body.story ?? "").trim();
    const material = String(body.material ?? "").trim();
    const quality = String(body.quality ?? "").trim();
    if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });
    const existing = await sql`SELECT id FROM collections WHERE slug = ${slug} LIMIT 1`;
    if (existing.length > 0) return NextResponse.json({ error: "Slug already taken" }, { status: 400 });
    const inserted = await sql`
      INSERT INTO collections (name, slug, image, description, story, material, quality)
      VALUES (${name}, ${slug}, ${image}, ${description}, ${story}, ${material}, ${quality})
      RETURNING id, name, slug, image, description, story, material, quality, created_at, updated_at
    `;
    return NextResponse.json(mapCollection(inserted[0] as CollectionRow));
  } catch (err) {
    const e = err as { status?: number };
    if (e.status === 403) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ error: "Failed to create collection" }, { status: 500 });
  }
}
