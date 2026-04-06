import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { mapCollection, type CollectionRow } from "@/lib/db-mappers";

export const dynamic = "force-dynamic";

/** Public: get one collection by slug for the storefront. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    if (!slug?.trim()) return NextResponse.json({ error: "Slug required" }, { status: 400 });
    const rows = await sql`
      SELECT id, name, slug, image, description, story, material, quality, created_at, updated_at
      FROM collections
      WHERE slug = ${slug.trim()}
      LIMIT 1
    `;
    const row = rows[0] as CollectionRow | undefined;
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(mapCollection(row));
  } catch {
    return NextResponse.json({ error: "Failed to fetch collection" }, { status: 500 });
  }
}
