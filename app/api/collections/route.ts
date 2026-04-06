import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { mapCollection, type CollectionRow } from "@/lib/db-mappers";

export const dynamic = "force-dynamic";

/** Public: list all collections for the storefront. */
export async function GET() {
  try {
    const rows = await sql`
      SELECT id, name, slug, image, description, story, material, quality, created_at, updated_at
      FROM collections
      ORDER BY name ASC
    `;
    const list = (rows as CollectionRow[]).map((r) => mapCollection(r));
    return NextResponse.json(
      list.map((c) => ({
        _id: c._id,
        name: c.name,
        slug: c.slug,
        image: c.image,
        description: c.description,
      }))
    );
  } catch {
    return NextResponse.json({ error: "Failed to fetch collections" }, { status: 500 });
  }
}
