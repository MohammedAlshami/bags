import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { isUuid } from "@/lib/id";
import { normalizeCategoryName } from "@/lib/categories";

export const dynamic = "force-dynamic";

type CategoryRow = {
  id: string;
  name: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

async function fetchCategory(id: string) {
  const rows = await sql`
    SELECT id, name, sort_order, created_at, updated_at
    FROM categories
    WHERE id = ${id}::uuid
    LIMIT 1
  `;
  return rows[0] as CategoryRow | undefined;
}

async function fetchFallbackCategory(excludeId: string) {
  const rows = await sql`
    SELECT id, name
    FROM categories
    WHERE id <> ${excludeId}::uuid
    ORDER BY sort_order ASC, name ASC
    LIMIT 1
  `;
  return rows[0] as { id: string; name: string } | undefined;
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
    const current = await fetchCategory(id);
    if (!current) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const body = await request.json();
    const name = body.name !== undefined ? normalizeCategoryName(body.name) : current.name;
    const sortOrder =
      body.sortOrder !== undefined && Number.isFinite(Number(body.sortOrder))
        ? Number(body.sortOrder)
        : current.sort_order;

    if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });
    if (name !== current.name) {
      const clash = await sql`
        SELECT id FROM categories WHERE name = ${name} AND id <> ${id}::uuid LIMIT 1
      `;
      if (clash.length > 0) {
        return NextResponse.json({ error: "Name already taken" }, { status: 400 });
      }
    }

    await sql`
      UPDATE categories
      SET name = ${name},
          sort_order = ${sortOrder},
          updated_at = now()
      WHERE id = ${id}::uuid
    `;

    await sql`
      UPDATE products
      SET category = ${name},
          updated_at = now()
      WHERE category_id = ${id}::uuid
    `;

    const updated = await fetchCategory(id);
    return NextResponse.json(
      updated
        ? {
            _id: updated.id,
            name: updated.name,
            sortOrder: updated.sort_order,
            createdAt: updated.created_at,
            updatedAt: updated.updated_at,
          }
        : null
    );
  } catch (err) {
    const e = err as { status?: number };
    if (e.status === 403) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
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
    const current = await fetchCategory(id);
    if (!current) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const fallback = await fetchFallbackCategory(id);
    if (!fallback) {
      return NextResponse.json({ error: "At least one category must remain" }, { status: 400 });
    }

    await sql`
      UPDATE products
      SET category_id = ${fallback.id}::uuid,
          category = ${fallback.name},
          updated_at = now()
      WHERE category_id = ${id}::uuid
    `;

    const deleted = await sql`
      DELETE FROM categories WHERE id = ${id}::uuid RETURNING id
    `;
    if (deleted.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true, reassignedTo: fallback.id });
  } catch (err) {
    const e = err as { status?: number };
    if (e.status === 403) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}
