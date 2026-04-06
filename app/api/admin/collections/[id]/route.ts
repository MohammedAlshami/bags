import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { mapCollection, type CollectionRow } from "@/lib/db-mappers";
import { requireAdmin } from "@/lib/auth";
import { isUuid } from "@/lib/id";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    if (!isUuid(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }
    const rows = await sql`
      SELECT id, name, slug, image, description, story, material, quality, created_at, updated_at
      FROM collections
      WHERE id = ${id}::uuid
      LIMIT 1
    `;
    const doc = rows[0] as CollectionRow | undefined;
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(mapCollection(doc));
  } catch (err) {
    const e = err as { status?: number };
    if (e.status === 403) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ error: "Failed to fetch collection" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    if (!isUuid(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }
    const body = await request.json();

    const curRows = await sql`
      SELECT name, slug, image, description, story, material, quality
      FROM collections WHERE id = ${id}::uuid LIMIT 1
    `;
    const cur = curRows[0];
    if (!cur) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const name = body.name != null ? String(body.name).trim() : cur.name;
    const slug = body.slug != null ? String(body.slug).trim() : cur.slug;
    const image = body.image != null ? String(body.image).trim() : cur.image;
    const description = body.description != null ? String(body.description).trim() : cur.description;
    const story = body.story != null ? String(body.story).trim() : cur.story;
    const material = body.material != null ? String(body.material).trim() : cur.material;
    const quality = body.quality != null ? String(body.quality).trim() : cur.quality;

    if (slug !== cur.slug) {
      const clash = await sql`
        SELECT id FROM collections WHERE slug = ${slug} AND id <> ${id}::uuid LIMIT 1
      `;
      if (clash.length > 0) return NextResponse.json({ error: "Slug already taken" }, { status: 400 });
    }

    const updated = await sql`
      UPDATE collections SET
        name = ${name},
        slug = ${slug},
        image = ${image},
        description = ${description},
        story = ${story},
        material = ${material},
        quality = ${quality},
        updated_at = now()
      WHERE id = ${id}::uuid
      RETURNING id, name, slug, image, description, story, material, quality, created_at, updated_at
    `;
    return NextResponse.json(mapCollection(updated[0] as CollectionRow));
  } catch (err) {
    const e = err as { status?: number };
    if (e.status === 403) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ error: "Failed to update collection" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    if (!isUuid(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }
    await sql`
      UPDATE products SET collection_id = NULL, updated_at = now()
      WHERE collection_id = ${id}::uuid
    `;
    const deleted = await sql`
      DELETE FROM collections WHERE id = ${id}::uuid RETURNING id
    `;
    if (deleted.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const e = err as { status?: number };
    if (e.status === 403) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ error: "Failed to delete collection" }, { status: 500 });
  }
}
