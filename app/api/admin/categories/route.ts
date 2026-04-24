import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { normalizeCategoryName } from "@/lib/categories";

export const dynamic = "force-dynamic";

type CategoryRow = {
  id: string;
  name: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

async function fetchCategories() {
  const rows = await sql`
    SELECT c.id, c.name, c.sort_order, c.created_at, c.updated_at,
      (SELECT COUNT(*)::int FROM products p WHERE p.category_id = c.id) AS product_count
    FROM categories c
    ORDER BY c.sort_order ASC, c.name ASC
  `;
  return rows as (CategoryRow & { product_count: number })[];
}

export async function GET() {
  try {
    await requireAdmin();
    const rows = await fetchCategories();
    return NextResponse.json(
      rows.map(({ product_count, ...row }) => ({
        _id: row.id,
        name: row.name,
        sortOrder: row.sort_order,
        productCount: product_count,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }))
    );
  } catch (err) {
    const e = err as { status?: number };
    if (e.status === 403) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();
    const name = normalizeCategoryName(body.name);
    if (!name) {
      return NextResponse.json({ error: "Name required" }, { status: 400 });
    }
    const existing = await sql`
      SELECT id FROM categories WHERE name = ${name} LIMIT 1
    `;
    if (existing.length > 0) {
      return NextResponse.json({ error: "Name already taken" }, { status: 400 });
    }
    const maxRows = await sql`
      SELECT COALESCE(MAX(sort_order), 0)::int AS max_sort_order
      FROM categories
    `;
    const nextSortOrder = ((maxRows[0] as { max_sort_order?: number } | undefined)?.max_sort_order ?? 0) + 1;
    const inserted = await sql`
      INSERT INTO categories (name, sort_order)
      VALUES (${name}, ${nextSortOrder})
      RETURNING id, name, sort_order, created_at, updated_at
    `;
    const row = inserted[0] as CategoryRow | undefined;
    if (!row) {
      return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
    }
    return NextResponse.json({
      _id: row.id,
      name: row.name,
      sortOrder: row.sort_order,
      productCount: 0,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  } catch (err) {
    const e = err as { status?: number };
    if (e.status === 403) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}
