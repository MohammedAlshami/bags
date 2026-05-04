/**
 * After applying migration 0002, run this to copy parsed SAR values into `saudi_riyal`
 * and `saudi_riyal_before_discount` from legacy `price` / `before_discount_price` strings.
 * Then apply migration 0003.
 *
 *   npx wrangler d1 migrations apply goldqueen --remote
 *   npx tsx scripts/migrate-prices-to-floats.ts
 *   npx wrangler d1 migrations apply goldqueen --remote
 */
import { existsSync, readFileSync } from "fs";
import { resolve } from "path";
import { parsePrice } from "../lib/cart";
import { parseStoredPriceToInputValue } from "../lib/format-sar";

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

function priceTextToNumber(raw: unknown): number | null {
  if (raw == null) return null;
  const s = String(raw).trim();
  if (!s) return null;
  const viaInput = parseStoredPriceToInputValue(s);
  if (viaInput) {
    const n = Number(viaInput);
    if (Number.isFinite(n) && n >= 0) return n;
  }
  const p = parsePrice(s);
  return Number.isFinite(p) && p >= 0 ? p : null;
}

function firstSizeSaudiFromJson(sizesRaw: unknown): number | null {
  let parsed: unknown = sizesRaw;
  if (typeof sizesRaw === "string" && sizesRaw.trim()) {
    try {
      parsed = JSON.parse(sizesRaw) as unknown;
    } catch {
      return null;
    }
  }
  if (!Array.isArray(parsed) || parsed.length === 0) return null;
  const first = parsed[0];
  if (!first || typeof first !== "object") return null;
  const sar = Number((first as Record<string, unknown>).sarPrice);
  return Number.isFinite(sar) && sar >= 0 ? sar : null;
}

async function main() {
  loadEnvLocal();
  const { sql } = await import("../lib/db");

  const productRows = await sql`
    SELECT id, price, before_discount_price, sizes
    FROM products
  `;
  for (const row of productRows) {
    let sar = priceTextToNumber(row.price);
    if (sar == null) {
      sar = firstSizeSaudiFromJson(row.sizes);
    }
    if (sar == null) {
      throw new Error(`Product ${String(row.id)}: could not derive saudi_riyal from price/sizes`);
    }
    const beforeSar = priceTextToNumber(row.before_discount_price);
    await sql`
      UPDATE products
      SET saudi_riyal = ${sar},
          saudi_riyal_before_discount = ${beforeSar}
      WHERE id = ${String(row.id)}::uuid
    `;
  }
  console.log(`Updated ${productRows.length} products.`);

  const packageRows = await sql`
    SELECT id, price, before_discount_price
    FROM packages
  `;
  for (const row of packageRows) {
    const sar = priceTextToNumber(row.price);
    if (sar == null) {
      throw new Error(`Package ${String(row.id)}: could not derive saudi_riyal`);
    }
    const beforeSar = priceTextToNumber(row.before_discount_price);
    await sql`
      UPDATE packages
      SET saudi_riyal = ${sar},
          saudi_riyal_before_discount = ${beforeSar}
      WHERE id = ${String(row.id)}::uuid
    `;
  }
  console.log(`Updated ${packageRows.length} packages.`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
