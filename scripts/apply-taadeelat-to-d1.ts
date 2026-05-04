/**
 * Applies Arabic copy + sizes from taadeelat-pdf-extracted.json to products,
 * then deletes obsolete "package as product" rows (real packages live in `packages`).
 *
 *   npx tsx scripts/apply-taadeelat-to-d1.ts
 */
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

const REMOVE_PRODUCT_IDS = [
  "d86baddf-a848-4527-be52-1c4b7f078369",
  "47e7bf3f-7d7d-48a1-8167-d803f014a009",
];

function loadEnvLocal() {
  const envPath = resolve(process.cwd(), ".env.local");
  if (!existsSync(envPath)) return;
  const content = readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const eq = trimmed.indexOf("=");
      if (eq > 0) {
        const key = trimmed.slice(0, eq).trim();
        const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
        process.env[key] = value;
      }
    }
  }
}

type Row = {
  id: string;
  description_ar: string | null;
  ingredients_ar: string | null;
  usage_ar: string | null;
  free_from_ar: string | null;
  warning_ar: string | null;
  contents_ar: string | null;
  sizes: unknown;
};

async function main() {
  loadEnvLocal();
  const { sql } = await import("../lib/db");
  const path = resolve(process.cwd(), "taadeelat-pdf-extracted.json");
  const raw = JSON.parse(readFileSync(path, "utf-8")) as { products: Row[] };
  const products = raw.products;

  for (const rid of REMOVE_PRODUCT_IDS) {
    const del = await sql`DELETE FROM products WHERE id = ${rid}::uuid RETURNING id`;
    console.log(del.length ? `Deleted product row ${rid}` : `No row to delete: ${rid}`);
  }

  for (const p of products) {
    const sizesJson = p.sizes == null ? null : JSON.stringify(p.sizes);
    await sql`
      UPDATE products SET
        description_ar = ${p.description_ar},
        ingredients_ar = ${p.ingredients_ar},
        usage_ar = ${p.usage_ar},
        free_from_ar = ${p.free_from_ar},
        warning_ar = ${p.warning_ar},
        contents_ar = ${p.contents_ar},
        sizes = ${sizesJson}::jsonb,
        updated_at = now()
      WHERE id = ${p.id}::uuid
    `;
    console.log(`Updated ${p.id}`);
  }
  console.log(`Done: ${products.length} products updated.`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
