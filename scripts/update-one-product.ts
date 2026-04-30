/**
 * Update exactly ONE product per invocation. No batching.
 *
 * 1. Read the current row from `products-d1-export.json` (or export fresh). Pick `id`.
 * 2. `verify.nameEquals` is required — exact current DB name. If another row shares the name,
 *    add `verify.categoryIdEquals` and/or `verify.imageEquals` from that same snapshot.
 * 2. Run: npx tsx scripts/update-one-product.ts path/to/one-record.json
 * 3. When it succeeds, repeat with a new file for the next product.
 *
 * one-record.json shape:
 * {
 *   "id": "uuid-of-product-row",
 *   "verify": {
 *     "nameEquals": "required — exact current DB name (trimmed)",
 *     "categoryIdEquals": "optional — disambiguate when another row shares the same name",
 *     "imageEquals": "optional — disambiguate by current image path"
 *   },
 *   "payload": {
 *     "name": "...",
 *     "price": "45 ر.س",
 *     "oldRiyal": 6000,
 *     "categoryId": "category-uuid",
 *     "image": "/product_Images/....jpeg",
 *     "descriptionAr": "..." | null,
 *     "ingredientsAr": null,
 *     "usageAr": null,
 *     "freeFromAr": null,
 *     "warningAr": null,
 *     "contentsAr": null,
 *     "sizes": null | [{ "label": "...", "sarPrice": 18, "oldRiyal": 2500 }]
 *   }
 * }
 */
import { readFileSync, existsSync } from "fs";
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

type Verify = {
  nameEquals: string;
  categoryIdEquals?: string;
  imageEquals?: string;
};

type Payload = {
  name: string;
  price: string;
  oldRiyal: number | null;
  categoryId: string;
  image: string;
  descriptionAr: string | null;
  ingredientsAr: string | null;
  usageAr: string | null;
  freeFromAr: string | null;
  warningAr: string | null;
  contentsAr: string | null;
  sizes: unknown;
};

type OneRecordFile = {
  id: string;
  verify?: Verify;
  payload: Payload;
  noteForHuman?: string;
};

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

async function main() {
  const fileArg = process.argv[2];
  if (!fileArg) {
    console.error("Usage: npx tsx scripts/update-one-product.ts <path-to-one-record.json>");
    process.exit(1);
  }

  const abs = resolve(process.cwd(), fileArg);
  if (!existsSync(abs)) {
    console.error(`File not found: ${abs}`);
    process.exit(1);
  }

  const raw = JSON.parse(readFileSync(abs, "utf-8")) as OneRecordFile;
  if (!raw || typeof raw.id !== "string" || !raw.payload || !raw.verify?.nameEquals) {
    console.error("Invalid JSON: need { id, verify: { nameEquals: \"...\" }, payload }");
    process.exit(1);
  }

  const { sql } = await import("../lib/db");
  const { resolveCategorySelection } = await import("../lib/category-db");

  const id = raw.id.trim();
  const rows = await sql`
    SELECT p.id, p.name, p.price, p.category, p.category_id, p.image,
           p.old_riyal, p.sizes, p.description_ar, p.ingredients_ar, p.usage_ar, p.free_from_ar, p.warning_ar, p.contents_ar,
           p.collection_id AS collection_id,
           p.created_at, p.updated_at,
           cat.id AS cat_id, cat.name AS cat_name,
           c.id AS col_id, c.name AS col_name, c.slug AS col_slug
    FROM products p
    LEFT JOIN categories cat ON cat.id = p.category_id
    LEFT JOIN collections c ON c.id = p.collection_id
    WHERE p.id = ${id}::uuid
    LIMIT 1
  `;
  const cur = rows[0] as import("../lib/db-mappers").ProductRow | undefined;
  if (!cur) {
    console.error(`No product found for id=${id}`);
    process.exit(1);
  }

  const dbName = String(cur.name ?? "").trim();
  console.log(`Found row: id=${id}\n  current name: ${dbName}`);
  if (raw.noteForHuman) console.log(`  note: ${raw.noteForHuman}`);

  const v = raw.verify;
  const expectedName = String(v.nameEquals).trim();
  if (dbName !== expectedName) {
    console.error(
      `VERIFY FAILED: expected nameEquals "${expectedName}" but DB has "${dbName}". Aborting (no update).`
    );
    process.exit(1);
  }
  const dbCat = String(cur.category_id ?? cur.cat_id ?? "").trim();
  if (v.categoryIdEquals != null && dbCat !== String(v.categoryIdEquals).trim()) {
    console.error(
      `VERIFY FAILED: expected categoryIdEquals "${v.categoryIdEquals}" but DB has "${dbCat}". Aborting (no update).`
    );
    process.exit(1);
  }
  const dbImg = String(cur.image ?? "").trim();
  if (v.imageEquals != null && dbImg !== String(v.imageEquals).trim()) {
    console.error(
      `VERIFY FAILED: expected imageEquals "${v.imageEquals}" but DB has "${dbImg}". Aborting (no update).`
    );
    process.exit(1);
  }

  const body = raw.payload;
  const name = String(body.name ?? "").trim();
  const price = String(body.price ?? "").trim();
  const category = await resolveCategorySelection({ categoryId: body.categoryId });
  if (!category) {
    console.error("Invalid categoryId: category not found.");
    process.exit(1);
  }
  const image = String(body.image ?? "").trim();
  const oldRiyal = normalizeNullableNumber(body.oldRiyal);
  const descriptionAr = normalizeNullableText(body.descriptionAr);
  const ingredientsAr = normalizeNullableText(body.ingredientsAr);
  const usageAr = normalizeNullableText(body.usageAr);
  const freeFromAr = normalizeNullableText(body.freeFromAr);
  const warningAr = normalizeNullableText(body.warningAr);
  const contentsAr = normalizeNullableText(body.contentsAr);
  const sizesJson = JSON.stringify(body.sizes ?? null);
  const collectionId = cur.collection_id ?? null;

  await sql`
    UPDATE products SET
      name = ${name},
      price = ${price},
      category = ${category.name},
      category_id = ${category.id}::uuid,
      image = ${image},
      old_riyal = ${oldRiyal},
      sizes = ${sizesJson}::jsonb,
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

  console.log("OK: single row updated.");
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
