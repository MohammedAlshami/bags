/**
 * Export all products from Cloudflare D1 to a JSON file.
 * Loads .env.local from project root (same pattern as other scripts).
 *
 * Requires: CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_DATABASE_ID, CLOUDFLARE_D1_TOKEN
 *
 * Usage: npx tsx scripts/export-products-d1.ts
 * Output: products-d1-export.json (project root)
 */
import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve } from "path";

const envPath = resolve(process.cwd(), ".env.local");
if (existsSync(envPath)) {
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

async function main() {
  const { sql } = await import("../lib/db");
  const { mapProduct } = await import("../lib/db-mappers");
  type ProductRow = import("../lib/db-mappers").ProductRow;

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
  const outPath = resolve(process.cwd(), "products-d1-export.json");
  writeFileSync(outPath, JSON.stringify(list, null, 2), "utf-8");
  console.log(`Wrote ${list.length} products to ${outPath}`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
