import fs from "fs/promises";
import path from "path";
import { neon } from "@neondatabase/serverless";

const root = process.cwd();
const inputPath = path.join(root, "pending-product-updates.json");
const raw = await fs.readFile(inputPath, "utf8");
const parsed = JSON.parse(raw);

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error("DATABASE_URL is missing");
}

const sql = neon(url);
const products = Array.isArray(parsed.products) ? parsed.products : [];

for (const item of products) {
  if (!item?.product_id || !item?.product_name) {
    throw new Error(`Invalid item: ${JSON.stringify(item)}`);
  }

  const name = String(item.product_name).trim();
  const priceSar = Number(item.price_sar);
  const oldRiyal = Number(item.old_riyal);

  if (!Number.isFinite(priceSar) || !Number.isFinite(oldRiyal)) {
    throw new Error(`Invalid price data for ${item.product_id}`);
  }

  const price = `${priceSar} ر.س`;
  await sql`
    UPDATE products
    SET name = ${name},
        price = ${price},
        old_riyal = ${oldRiyal},
        updated_at = NOW()
    WHERE slug = ${item.product_id}
  `;

  console.log(`updated ${item.product_id}`);
}

console.log(`done: ${products.length} products updated`);
