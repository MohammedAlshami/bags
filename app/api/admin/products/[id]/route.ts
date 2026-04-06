import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { mapProduct, type ProductRow } from "@/lib/db-mappers";
import { requireAdmin } from "@/lib/auth";
import { isUuid } from "@/lib/id";

export const dynamic = "force-dynamic";

async function fetchProductJoined(id: string) {
  const rows = await sql`
    SELECT p.id, p.name, p.price, p.category, p.image, p.slug, p.collection_id,
           p.created_at, p.updated_at,
           c.id AS col_id, c.name AS col_name, c.slug AS col_slug
    FROM products p
    LEFT JOIN collections c ON c.id = p.collection_id
    WHERE p.id = ${id}::uuid
    LIMIT 1
  `;
  return rows[0] as ProductRow | undefined;
}

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
    const doc = await fetchProductJoined(id);
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(mapProduct(doc, true));
  } catch (err) {
    const e = err as { status?: number };
    if (e.status === 403) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
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

    let collectionId: string | null | undefined;
    if (body.collection != null) {
      if (body.collection && body.collection !== "general" && isUuid(String(body.collection))) {
        const colRows = await sql`
          SELECT id FROM collections WHERE id = ${String(body.collection)}::uuid LIMIT 1
        `;
        if (colRows[0]) collectionId = colRows[0].id as string;
        else {
          const defRows = await sql`
            SELECT id FROM collections WHERE slug = ${"essentials"} LIMIT 1
          `;
          if (defRows[0]) collectionId = defRows[0].id as string;
        }
      } else {
        const defRows = await sql`
          SELECT id FROM collections WHERE slug = ${"essentials"} LIMIT 1
        `;
        if (defRows[0]) collectionId = defRows[0].id as string;
      }
    }

    const cur = await fetchProductJoined(id);
    if (!cur) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const name = body.name != null ? String(body.name).trim() : cur.name;
    const price = body.price != null ? String(body.price).trim() : cur.price;
    const category = body.category != null ? String(body.category).trim() : cur.category;
    const image = body.image != null ? String(body.image).trim() : cur.image;
    const slug = body.slug != null ? String(body.slug).trim() : cur.slug;
    const col =
      collectionId !== undefined ? collectionId : (cur.collection_id as string | null);

    if (slug !== cur.slug) {
      const clash = await sql`
        SELECT id FROM products WHERE slug = ${slug} AND id <> ${id}::uuid LIMIT 1
      `;
      if (clash.length > 0) return NextResponse.json({ error: "Slug already taken" }, { status: 400 });
    }

    await sql`
      UPDATE products SET
        name = ${name},
        price = ${price},
        category = ${category},
        image = ${image},
        slug = ${slug},
        collection_id = ${col},
        updated_at = now()
      WHERE id = ${id}::uuid
    `;

    const doc = await fetchProductJoined(id);
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(mapProduct(doc, true));
  } catch (err) {
    const e = err as { status?: number };
    if (e.status === 403) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
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
    const deleted = await sql`
      DELETE FROM products WHERE id = ${id}::uuid RETURNING id
    `;
    if (deleted.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const e = err as { status?: number };
    if (e.status === 403) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
