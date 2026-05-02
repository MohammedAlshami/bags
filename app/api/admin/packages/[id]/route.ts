import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { sql } from "@/lib/db";
import { formatSar } from "@/lib/format-sar";
import { isUuid } from "@/lib/id";

export const dynamic = "force-dynamic";

type PackageRow = {
  id: string;
  name: string;
  description: string | null;
  image?: string | null;
  product_ids: unknown;
  price: string;
  old_riyal?: number | null;
  before_discount_price?: string | null;
  before_discount_old_riyal?: number | null;
  intro_ar?: string | null;
  contents_ar?: unknown;
  closing_ar?: string | null;
  created_at: string;
  updated_at: string;
};

function parseJsonArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === "string");
  if (typeof value !== "string" || !value.trim()) return [];
  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function parsePackageContents(value: unknown): Array<{ title: string; body: string }> {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (!item || typeof item !== "object") return null;
        const raw = item as Record<string, unknown>;
        const title = typeof raw.title === "string" ? raw.title.trim() : "";
        const body = typeof raw.body === "string" ? raw.body.trim() : "";
        return title || body ? { title, body } : null;
      })
      .filter((item): item is { title: string; body: string } => Boolean(item));
  }
  if (typeof value !== "string" || !value.trim()) return [];
  try {
    return parsePackageContents(JSON.parse(value) as unknown);
  } catch {
    return [];
  }
}

function mapPackage(row: PackageRow) {
  return {
    _id: row.id,
    name: row.name,
    description: row.description ?? "",
    image: row.image ?? "",
    productIds: parseJsonArray(row.product_ids),
    price: row.price,
    oldRiyal: row.old_riyal == null ? null : Number(row.old_riyal),
    beforeDiscountPrice: row.before_discount_price ?? null,
    beforeDiscountOldRiyal: row.before_discount_old_riyal == null ? null : Number(row.before_discount_old_riyal),
    introAr: row.intro_ar ?? row.description ?? "",
    contentsAr: parsePackageContents(row.contents_ar),
    closingAr: row.closing_ar ?? "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function normalizeProductIds(value: unknown) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map((item) => String(item).trim()).filter((item) => isUuid(item)))];
}

async function productCountForIds(productIds: string[]) {
  if (productIds.length === 0) return 0;
  const rows = await sql`
    SELECT id FROM products
    WHERE id IN (SELECT value FROM json_each(${JSON.stringify(productIds)}))
  `;
  return rows.length;
}

async function fetchPackage(id: string) {
  const rows = await sql`
    SELECT id, name, description, image, product_ids, price, old_riyal,
           before_discount_price, before_discount_old_riyal,
           intro_ar, contents_ar, closing_ar, created_at, updated_at
    FROM packages
    WHERE id = ${id}
    LIMIT 1
  `;
  return rows[0] as PackageRow | undefined;
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    if (!isUuid(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const current = await fetchPackage(id);
    if (!current) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const body = (await request.json()) as Record<string, unknown>;
    const name = String(body.name ?? "").trim();
    const description = String(body.description ?? "").trim();
    const introAr = String(body.introAr ?? description).trim();
    const contentsAr = Array.isArray(body.contentsAr) ? JSON.stringify(body.contentsAr) : null;
    const closingAr = String(body.closingAr ?? "").trim();
    const image = String(body.image ?? "").trim();
    const priceValue = Number(body.price);
    const oldRiyal = body.oldRiyal == null || body.oldRiyal === "" ? null : Number(body.oldRiyal);
    const beforeDiscountPriceValue =
      body.beforeDiscountPrice == null || body.beforeDiscountPrice === "" ? null : Number(body.beforeDiscountPrice);
    const beforeDiscountOldRiyal =
      body.beforeDiscountOldRiyal == null || body.beforeDiscountOldRiyal === "" ? null : Number(body.beforeDiscountOldRiyal);
    const productIds = normalizeProductIds(body.productIds);

    if (!name || !Number.isFinite(priceValue) || priceValue < 0 || productIds.length === 0) {
      return NextResponse.json({ error: "Name, price, and products required" }, { status: 400 });
    }
    if (oldRiyal !== null && (!Number.isFinite(oldRiyal) || oldRiyal < 0)) {
      return NextResponse.json({ error: "Invalid old riyal price" }, { status: 400 });
    }
    if (beforeDiscountPriceValue !== null && (!Number.isFinite(beforeDiscountPriceValue) || beforeDiscountPriceValue < 0)) {
      return NextResponse.json({ error: "Invalid before discount price" }, { status: 400 });
    }
    if (beforeDiscountOldRiyal !== null && (!Number.isFinite(beforeDiscountOldRiyal) || beforeDiscountOldRiyal < 0)) {
      return NextResponse.json({ error: "Invalid before discount old riyal price" }, { status: 400 });
    }
    if ((await productCountForIds(productIds)) !== productIds.length) {
      return NextResponse.json({ error: "Some products were not found" }, { status: 400 });
    }

    const price = formatSar(priceValue);
    const beforeDiscountPrice = beforeDiscountPriceValue === null ? null : formatSar(beforeDiscountPriceValue);
    const updated = await sql`
      UPDATE packages SET
        name = ${name},
        description = ${description},
        image = ${image},
        product_ids = ${JSON.stringify(productIds)},
        price = ${price},
        old_riyal = ${oldRiyal},
        before_discount_price = ${beforeDiscountPrice},
        before_discount_old_riyal = ${beforeDiscountOldRiyal},
        intro_ar = ${introAr},
        contents_ar = ${contentsAr},
        closing_ar = ${closingAr},
        updated_at = now()
      WHERE id = ${id}
      RETURNING id, name, description, image, product_ids, price, old_riyal,
                before_discount_price, before_discount_old_riyal,
                intro_ar, contents_ar, closing_ar, created_at, updated_at
    `;
    return NextResponse.json(mapPackage(updated[0] as PackageRow));
  } catch (err) {
    const e = err as { status?: number };
    if (e.status === 403) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ error: "Failed to update package" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    if (!isUuid(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    const deleted = await sql`DELETE FROM packages WHERE id = ${id} RETURNING id`;
    if (deleted.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const e = err as { status?: number };
    if (e.status === 403) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ error: "Failed to delete package" }, { status: 500 });
  }
}
