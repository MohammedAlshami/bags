import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { mapProduct, type ProductRow } from "@/lib/db-mappers";
import { requireAdmin } from "@/lib/auth";
import { isUuid } from "@/lib/id";

export const dynamic = "force-dynamic";

const PAGE_SIZE_DEFAULT = 8;
const PAGE_SIZE_MAX = 100;

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const collectionId = searchParams.get("collectionId")?.trim();
    const all =
      searchParams.get("all") === "1" ||
      searchParams.get("all") === "true" ||
      searchParams.get("all") === "yes";

    const hasCol = collectionId && isUuid(collectionId);

    if (all) {
      const rows = hasCol
        ? await sql`
            SELECT p.id, p.name, p.price, p.old_riyal, p.sizes, p.category, p.image, p.slug, p.collection_id,
                   p.created_at, p.updated_at,
                   c.id AS col_id, c.name AS col_name, c.slug AS col_slug
            FROM products p
            LEFT JOIN collections c ON c.id = p.collection_id
            WHERE p.collection_id = ${collectionId}::uuid
            ORDER BY p.name ASC
          `
        : await sql`
            SELECT p.id, p.name, p.price, p.old_riyal, p.sizes, p.category, p.image, p.slug, p.collection_id,
                   p.created_at, p.updated_at,
                   c.id AS col_id, c.name AS col_name, c.slug AS col_slug
            FROM products p
            LEFT JOIN collections c ON c.id = p.collection_id
            ORDER BY p.name ASC
          `;
      const list = (rows as ProductRow[]).map((r) => mapProduct(r, true));
      return NextResponse.json(list);
    }

    const rawLimit = parseInt(searchParams.get("limit") ?? String(PAGE_SIZE_DEFAULT), 10);
    const rawOffset = parseInt(searchParams.get("offset") ?? "0", 10);
    const limit = Math.min(
      Math.max(Number.isFinite(rawLimit) ? rawLimit : PAGE_SIZE_DEFAULT, 1),
      PAGE_SIZE_MAX
    );
    const offset = Math.max(Number.isFinite(rawOffset) ? rawOffset : 0, 0);
    const fetchLimit = limit + 1;

    const rows = hasCol
      ? await sql`
          SELECT p.id, p.name, p.price, p.old_riyal, p.sizes, p.category, p.image, p.slug, p.collection_id,
                 p.created_at, p.updated_at,
                 c.id AS col_id, c.name AS col_name, c.slug AS col_slug
          FROM products p
          LEFT JOIN collections c ON c.id = p.collection_id
          WHERE p.collection_id = ${collectionId}::uuid
          ORDER BY p.name ASC
          LIMIT ${fetchLimit} OFFSET ${offset}
        `
      : await sql`
          SELECT p.id, p.name, p.price, p.old_riyal, p.sizes, p.category, p.image, p.slug, p.collection_id,
                 p.created_at, p.updated_at,
                 c.id AS col_id, c.name AS col_name, c.slug AS col_slug
          FROM products p
          LEFT JOIN collections c ON c.id = p.collection_id
          ORDER BY p.name ASC
          LIMIT ${fetchLimit} OFFSET ${offset}
        `;

    const hasMore = rows.length > limit;
    const slice = (hasMore ? rows.slice(0, limit) : rows) as ProductRow[];
    const items = slice.map((r) => mapProduct(r, true));
    const nextOffset = hasMore ? offset + limit : null;
    return NextResponse.json({ items, nextOffset });
  } catch (err) {
    const e = err as { status?: number };
    if (e.status === 403) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();
    const name = String(body.name ?? "").trim();
    const price = String(body.price ?? "").trim();
    const category = String(body.category ?? "").trim();
    const image = String(body.image ?? "").trim();
    const sizes = body.sizes != null ? JSON.stringify(body.sizes) : null;
    let slug = String(body.slug ?? "").trim();
    if (!slug) slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    if (!slug) slug = `p-${randomUUID().replace(/-/g, "")}`;

    let collectionId: string | null = null;
    if (body.collection && body.collection !== "general" && isUuid(String(body.collection))) {
      const colRows = await sql`
        SELECT id FROM collections WHERE id = ${String(body.collection)}::uuid LIMIT 1
      `;
      if (colRows[0]) collectionId = colRows[0].id as string;
    }
    if (!collectionId) {
      const defRows = await sql`
        SELECT id FROM collections WHERE slug = ${"essentials"} LIMIT 1
      `;
      if (defRows[0]) collectionId = defRows[0].id as string;
    }
    if (!collectionId) {
      return NextResponse.json(
        { error: "Collection is required. Create a collection first (e.g. slug: essentials)." },
        { status: 400 }
      );
    }
    if (!name || !price || !category || !image) {
      return NextResponse.json({ error: "Name, price, category, and image required" }, { status: 400 });
    }
    const existing = await sql`SELECT id FROM products WHERE slug = ${slug} LIMIT 1`;
    if (existing.length > 0) return NextResponse.json({ error: "Slug already taken" }, { status: 400 });

    const inserted = await sql`
      INSERT INTO products (name, price, category, image, slug, collection_id, sizes)
      VALUES (${name}, ${price}, ${category}, ${image}, ${slug}, ${collectionId}::uuid, ${sizes}::jsonb)
      RETURNING id
    `;
    const newId = inserted[0].id as string;
    const full = await sql`
      SELECT p.id, p.name, p.price, p.old_riyal, p.sizes, p.category, p.image, p.slug, p.collection_id,
             p.created_at, p.updated_at,
             c.id AS col_id, c.name AS col_name, c.slug AS col_slug
      FROM products p
      LEFT JOIN collections c ON c.id = p.collection_id
      WHERE p.id = ${newId}::uuid
      LIMIT 1
    `;
    return NextResponse.json(mapProduct(full[0] as ProductRow, true));
  } catch (err) {
    const e = err as { status?: number };
    if (e.status === 403) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
