/**
 * Fetches all products from Cloudflare D1 and writes them to products.json
 * Handles the encoding issue where the API response needs proper UTF-8 decoding
 */

const ACCOUNT_ID = process.env.CF_ACCOUNT_ID;
const DATABASE_ID = process.env.CF_D1_DATABASE_ID;
const TOKEN = process.env.CF_API_TOKEN;

const res = await fetch(
  `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/d1/database/${DATABASE_ID}/query`,
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sql: "SELECT * FROM products ORDER BY created_at ASC",
      params: [],
    }),
  }
);

if (!res.ok) {
  throw new Error(`HTTP ${res.status}: ${await res.text()}`);
}

const data = await res.json();

if (!data.success) {
  throw new Error(data.errors?.[0]?.message ?? "Query failed");
}

const products = data.result[0].results;

// Parse sizes field from JSON string to object where present
const cleaned = products.map((p) => ({
  ...p,
  sizes: p.sizes ? JSON.parse(p.sizes) : null,
}));

import { writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { join, dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = join(__dirname, "..", "products.json");

writeFileSync(outPath, JSON.stringify(cleaned, null, 2), "utf8");
console.log(`✓ Written ${cleaned.length} products to products.json`);
cleaned.forEach((p, i) => console.log(`  ${i + 1}. ${p.name}`));
