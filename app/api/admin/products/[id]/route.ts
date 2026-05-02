import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { mapProduct, type ProductRow } from "@/lib/db-mappers";
import { requireAdmin } from "@/lib/auth";
import { isUuid } from "@/lib/id";
import { resolveCategorySelection } from "@/lib/category-db";

export const dynamic = "force-dynamic";

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

async function fetchProductJoined(id: string) {
  const rows = await sql`
    SELECT p.id, p.name, p.price, p.category, p.category_id, p.image,
           p.old_riyal, p.before_discount_price, p.before_discount_old_riyal,
           p.sizes, p.description_ar, p.ingredients_ar, p.usage_ar, p.free_from_ar, p.warning_ar, p.contents_ar,
           p.collection_id,
           p.created_at, p.updated_at,
           cat.id AS cat_id, cat.name AS cat_name,
           c.id AS col_id, c.name AS col_name, c.slug AS col_slug
    FROM products p
    LEFT JOIN categories cat ON cat.id = p.category_id
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
    const body = (await request.json()) as Record<string, unknown>;

    const cur = await fetchProductJoined(id);
    if (!cur) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const name = body.name !== undefined ? String(body.name).trim() : cur.name;
    const price = body.price !== undefined ? String(body.price).trim() : cur.price;
    const categoryWasProvided = body.categoryId !== undefined || body.category !== undefined;
    const category = categoryWasProvided
      ? await resolveCategorySelection(
          { categoryId: body.categoryId, category: body.category },
          cur.cat_id && cur.cat_name ? { id: cur.cat_id, name: cur.cat_name } : null
        )
      : cur.cat_id && cur.cat_name
        ? { id: cur.cat_id, name: cur.cat_name }
        : null;
    if (categoryWasProvided && !category) {
      return NextResponse.json({ error: "Category not found" }, { status: 400 });
    }
    const image = body.image !== undefined ? String(body.image).trim() : cur.image;
    const oldRiyal = body.oldRiyal !== undefined ? normalizeNullableNumber(body.oldRiyal) : cur.old_riyal ?? null;
    const beforeDiscountPrice =
      body.beforeDiscountPrice !== undefined ? normalizeNullableText(body.beforeDiscountPrice) : cur.before_discount_price ?? null;
    const beforeDiscountOldRiyal =
      body.beforeDiscountOldRiyal !== undefined ? normalizeNullableNumber(body.beforeDiscountOldRiyal) : cur.before_discount_old_riyal ?? null;
    const descriptionAr =
      body.descriptionAr !== undefined ? normalizeNullableText(body.descriptionAr) : cur.description_ar ?? null;
    const ingredientsAr =
      body.ingredientsAr !== undefined ? normalizeNullableText(body.ingredientsAr) : cur.ingredients_ar ?? null;
    const usageAr = body.usageAr !== undefined ? normalizeNullableText(body.usageAr) : cur.usage_ar ?? null;
    const freeFromAr =
      body.freeFromAr !== undefined ? normalizeNullableText(body.freeFromAr) : cur.free_from_ar ?? null;
    const warningAr = body.warningAr !== undefined ? normalizeNullableText(body.warningAr) : cur.warning_ar ?? null;
    const contentsAr =
      body.contentsAr !== undefined ? normalizeNullableText(body.contentsAr) : cur.contents_ar ?? null;
    const sizes = body.sizes !== undefined ? JSON.stringify(body.sizes) : JSON.stringify(cur.sizes ?? null);
    const collectionId: string | null =
      body.collectionId !== undefined && body.collectionId !== null && String(body.collectionId).trim() !== ""
        ? String(body.collectionId).trim()
        : cur.collection_id ?? null;

    await sql`
      UPDATE products SET
        name = ${name},
        price = ${price},
        category = ${category?.name ?? cur.category},
        category_id = ${category?.id ?? cur.category_id}::uuid,
        image = ${image},
        old_riyal = ${oldRiyal},
        before_discount_price = ${beforeDiscountPrice},
        before_discount_old_riyal = ${beforeDiscountOldRiyal},
        sizes = ${sizes}::jsonb,
        description_ar = ${descriptionAr},
        ingredients_ar = ${ingredientsAr},
        usage_ar = ${usageAr},
        free_from_ar = ${freeFromAr},
        warning_ar = ${warningAr},
        contents_ar = ${contentsAr},
        collection_id = ${collectionId},
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
