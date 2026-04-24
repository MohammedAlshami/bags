import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { mapProduct, type ProductRow } from "@/lib/db-mappers";
import { requireAdmin } from "@/lib/auth";
import { resolveCategorySelection } from "@/lib/category-db";

export const dynamic = "force-dynamic";

const PAGE_SIZE_DEFAULT = 8;
const PAGE_SIZE_MAX = 100;

function normalizeNullableText(value: unknown): string | null {
  if (value == null) return null;
  const text = String(value).trim();
  return text.length > 0 ? text : null;
}

function normalizeNullableNumber(value: unknown): number | null {
  if (value == null || value === "") return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const all =
      searchParams.get("all") === "1" ||
      searchParams.get("all") === "true" ||
      searchParams.get("all") === "yes";

    if (all) {
      const rows = await sql`
        SELECT p.id, p.name, p.price, p.old_riyal, p.sizes, p.category, p.category_id, p.image,
               p.description_ar, p.ingredients_ar, p.usage_ar, p.free_from_ar, p.warning_ar, p.contents_ar,
               p.collection_id,
               p.created_at, p.updated_at,
               cat.id AS cat_id, cat.name AS cat_name,
               c.id AS col_id, c.name AS col_name, c.slug AS col_slug
        FROM products p
        LEFT JOIN categories cat ON cat.id = p.category_id
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

    const rows = await sql`
      SELECT p.id, p.name, p.price, p.old_riyal, p.sizes, p.category, p.category_id, p.image,
             p.description_ar, p.ingredients_ar, p.usage_ar, p.free_from_ar, p.warning_ar, p.contents_ar,
             p.collection_id,
             p.created_at, p.updated_at,
             cat.id AS cat_id, cat.name AS cat_name,
             c.id AS col_id, c.name AS col_name, c.slug AS col_slug
      FROM products p
      LEFT JOIN categories cat ON cat.id = p.category_id
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
    const image = String(body.image ?? "").trim();
    const oldRiyal = normalizeNullableNumber(body.oldRiyal);
    const descriptionAr = normalizeNullableText(body.descriptionAr);
    const ingredientsAr = normalizeNullableText(body.ingredientsAr);
    const usageAr = normalizeNullableText(body.usageAr);
    const freeFromAr = normalizeNullableText(body.freeFromAr);
    const warningAr = normalizeNullableText(body.warningAr);
    const contentsAr = normalizeNullableText(body.contentsAr);
    const sizes = body.sizes != null ? JSON.stringify(body.sizes) : null;
    const category = await resolveCategorySelection({
      categoryId: body.categoryId,
      category: body.category,
    });
    if (!name || !price || !category || !image) {
      return NextResponse.json({ error: "Name, price, category, and image required" }, { status: 400 });
    }
    const inserted = await sql`
      INSERT INTO products (
        name, price, old_riyal, category, category_id, image, collection_id, sizes,
        description_ar, ingredients_ar, usage_ar, free_from_ar, warning_ar, contents_ar
      )
      VALUES (
        ${name}, ${price}, ${oldRiyal}, ${category.name}, ${category.id}::uuid, ${image}, NULL, ${sizes}::jsonb,
        ${descriptionAr}, ${ingredientsAr}, ${usageAr}, ${freeFromAr}, ${warningAr}, ${contentsAr}
      )
      RETURNING id
    `;
    const newId = inserted[0].id as string;
    const full = await sql`
      SELECT p.id, p.name, p.price, p.old_riyal, p.sizes, p.category, p.category_id, p.image,
             p.description_ar, p.ingredients_ar, p.usage_ar, p.free_from_ar, p.warning_ar, p.contents_ar,
             p.collection_id,
             p.created_at, p.updated_at,
             cat.id AS cat_id, cat.name AS cat_name,
             c.id AS col_id, c.name AS col_name, c.slug AS col_slug
      FROM products p
      LEFT JOIN categories cat ON cat.id = p.category_id
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
