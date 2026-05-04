/**
 * Fetches packages, the first 5 products, and the full product catalog from the
 * running Next.js API (default http://localhost:3000) and writes JSON files at the project root.
 *
 * Usage:
 *   npm run dev
 *   node scripts/fetch-packages-json.mjs
 *
 * Optional env:
 *   PACKAGES_API_BASE — e.g. http://127.0.0.1:3000
 *   PACKAGES_JSON_OUT — packages output (default: packages-api-export.json)
 *   PRODUCTS_JSON_OUT — first 5 products (default: products-top5-api-export.json)
 *   PRODUCTS_ALL_JSON_OUT — full catalog from /api/products (default: products-api-export.json)
 */
import { writeFileSync } from "fs";
import { resolve } from "path";

const base = (process.env.PACKAGES_API_BASE || "http://localhost:3000").replace(/\/$/, "");

async function fetchJson(url) {
  const res = await fetch(url);
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    console.error("Response was not JSON:", text.slice(0, 500));
    process.exit(1);
  }
  if (!res.ok) {
    console.error(`HTTP ${res.status} ${url}`, data);
    process.exit(1);
  }
  return data;
}

const packagesUrl = `${base}/api/packages`;
const packagesData = await fetchJson(packagesUrl);
const packagesOut = resolve(process.cwd(), process.env.PACKAGES_JSON_OUT || "packages-api-export.json");
writeFileSync(packagesOut, JSON.stringify(packagesData, null, 2), "utf-8");
console.log(
  `Wrote ${Array.isArray(packagesData) ? packagesData.length : "?"} package(s) to ${packagesOut}`
);

const productsTop5Url = `${base}/api/products?limit=5`;
const productsTop5 = await fetchJson(productsTop5Url);
const productsTop5Out = resolve(process.cwd(), process.env.PRODUCTS_JSON_OUT || "products-top5-api-export.json");
writeFileSync(productsTop5Out, JSON.stringify(productsTop5, null, 2), "utf-8");
console.log(
  `Wrote ${Array.isArray(productsTop5) ? productsTop5.length : "?"} product(s) to ${productsTop5Out}`
);

const productsAllUrl = `${base}/api/products`;
const productsAll = await fetchJson(productsAllUrl);
const productsAllOut = resolve(process.cwd(), process.env.PRODUCTS_ALL_JSON_OUT || "products-api-export.json");
writeFileSync(productsAllOut, JSON.stringify(productsAll, null, 2), "utf-8");
console.log(
  `Wrote ${Array.isArray(productsAll) ? productsAll.length : "?"} product(s) to ${productsAllOut}`
);
