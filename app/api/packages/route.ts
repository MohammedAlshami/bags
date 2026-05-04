import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { mapProduct, type ProductRow } from "@/lib/db-mappers";

export const dynamic = "force-dynamic";

type PackageRow = {
  id: string;
  name: string;
  description: string | null;
  image: string | null;
  product_ids: unknown;
  saudi_riyal: number | null;
  old_riyal: number | null;
  saudi_riyal_before_discount: number | null;
  old_riyal_before_discount: number | null;
};

function parsePackageProductIds(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === "string");
  if (typeof value !== "string" || !value.trim()) return [];
  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

/** Public catalog list of packages (same shape as shop cards). */
export async function GET() {
  try {
    const packageRows = (await sql`
      SELECT id, name, description, image, product_ids, saudi_riyal, old_riyal,
             saudi_riyal_before_discount, old_riyal_before_discount
      FROM packages
      ORDER BY created_at DESC
    `) as PackageRow[];

    const productRows = (await sql`
      SELECT p.id, p.name, p.saudi_riyal, p.old_riyal,
             p.saudi_riyal_before_discount, p.old_riyal_before_discount,
             p.sizes, p.category, p.category_id, p.image,
             p.created_at, p.updated_at,
             cat.id AS cat_id, cat.name AS cat_name,
             c.id AS col_id, c.name AS col_name, c.slug AS col_slug
      FROM products p
      LEFT JOIN categories cat ON cat.id = p.category_id
      LEFT JOIN collections c ON c.id = p.collection_id
      ORDER BY p.name ASC
    `) as ProductRow[];

    const productsById = new Map(
      productRows.map((row) => {
        const mapped = mapProduct(row, true);
        return [
          mapped._id,
          {
            id: mapped._id,
            name: mapped.name,
            saudiRiyal: mapped.saudiRiyal,
            image: mapped.image,
          },
        ] as const;
      })
    );

    const packages = packageRows.map((row) => {
      const sar = Number(row.saudi_riyal);
      if (!Number.isFinite(sar)) {
        throw new Error(`Package ${row.id} has invalid saudi_riyal`);
      }
      return {
        id: row.id,
        name: row.name,
        description: row.description ?? "",
        image: row.image ?? "",
        saudiRiyal: sar,
        oldRiyal: row.old_riyal == null ? null : Number(row.old_riyal),
        saudiRiyalBeforeDiscount:
          row.saudi_riyal_before_discount == null ? null : Number(row.saudi_riyal_before_discount),
        oldRiyalBeforeDiscount:
          row.old_riyal_before_discount == null ? null : Number(row.old_riyal_before_discount),
        products: parsePackageProductIds(row.product_ids)
          .map((id) => productsById.get(id))
          .filter((product): product is NonNullable<typeof product> => Boolean(product)),
      };
    });

    return NextResponse.json(packages);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch packages";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
