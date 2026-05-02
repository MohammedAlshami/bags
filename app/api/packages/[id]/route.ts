import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { mapProduct, type ProductRow } from "@/lib/db-mappers";
import { isUuid } from "@/lib/id";

export const dynamic = "force-dynamic";

type PackageRow = {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  product_ids: unknown;
  price: string;
  old_riyal: number | null;
  before_discount_price: string | null;
  before_discount_old_riyal: number | null;
  intro_ar: string | null;
  contents_ar: unknown;
  closing_ar: string | null;
  created_at: string;
  updated_at: string;
};

function parseProductIds(value: unknown): string[] {
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

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!isUuid(id)) {
      return NextResponse.json({ error: "Invalid package id" }, { status: 400 });
    }

    const packageRows = await sql`
      SELECT id, name, description, image, product_ids, price, old_riyal,
             before_discount_price, before_discount_old_riyal,
             intro_ar, contents_ar, closing_ar, created_at, updated_at
      FROM packages
      WHERE id = ${id}
      LIMIT 1
    `;
    const packageRow = packageRows[0] as PackageRow | undefined;
    if (!packageRow) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 });
    }

    const productIds = parseProductIds(packageRow.product_ids);
    const productRows = productIds.length
      ? ((await sql`
          SELECT p.id, p.name, p.price, p.old_riyal,
                 p.before_discount_price, p.before_discount_old_riyal,
                 p.sizes, p.category, p.category_id, p.image,
                 p.description_ar, p.ingredients_ar, p.usage_ar, p.free_from_ar, p.warning_ar, p.contents_ar,
                 p.collection_id,
                 p.created_at, p.updated_at,
                 cat.id AS cat_id, cat.name AS cat_name,
                 c.id AS col_id, c.name AS col_name, c.slug AS col_slug
          FROM products p
          LEFT JOIN categories cat ON cat.id = p.category_id
          LEFT JOIN collections c ON c.id = p.collection_id
          WHERE p.id IN (SELECT value FROM json_each(${JSON.stringify(productIds)}))
        `) as ProductRow[])
      : [];

    const productsById = new Map(productRows.map((row) => [row.id, mapProduct(row, true)]));
    const products = productIds
      .map((productId) => productsById.get(productId))
      .filter((product): product is NonNullable<typeof product> => Boolean(product));

    return NextResponse.json({
      _id: packageRow.id,
      name: packageRow.name,
      description: packageRow.description ?? "",
      image: packageRow.image ?? "",
      price: packageRow.price,
      oldRiyal: packageRow.old_riyal == null ? null : Number(packageRow.old_riyal),
      beforeDiscountPrice: packageRow.before_discount_price ?? null,
      beforeDiscountOldRiyal: packageRow.before_discount_old_riyal == null ? null : Number(packageRow.before_discount_old_riyal),
      introAr: packageRow.intro_ar ?? packageRow.description ?? "",
      contentsAr: parsePackageContents(packageRow.contents_ar),
      closingAr: packageRow.closing_ar ?? "",
      products,
      createdAt: packageRow.created_at,
      updatedAt: packageRow.updated_at,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch package";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
