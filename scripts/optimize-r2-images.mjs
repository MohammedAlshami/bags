/**
 * One-off: converts every R2 image referenced by site content into small WebP variants and
 * repoints the database at them. Originals are NEVER deleted or overwritten.
 *
 *   node scripts/optimize-r2-images.mjs                 # dry run: report only, no writes
 *   node scripts/optimize-r2-images.mjs --apply         # upload variants + update D1
 *   node scripts/optimize-r2-images.mjs --rollback scripts/out/<map>.json   # point D1 back at the originals
 *
 * Naming/limits mirror lib/image-variants.ts and the upload API.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.trim().startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, "")];
    }),
);

const APPLY = process.argv.includes("--apply");
const rollbackIdx = process.argv.indexOf("--rollback");
const R2_BASE = env.R2_PUBLIC_URL.replace(/\/+$/, "");
const MAIN_EDGE = 1600;
const VARIANTS = [320, 640, 1280];
// Tables whose content is shown on the public site. Orders/users are left alone: old URLs keep working.
const SKIP_TABLES = new Set(["orders", "users", "d1_migrations", "_cf_KV", "sqlite_sequence"]);

async function d1(sql, params = []) {
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/d1/database/${env.CLOUDFLARE_DATABASE_ID}/query`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${env.CLOUDFLARE_D1_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({ sql, params }),
    },
  );
  const json = await res.json();
  if (!json.success) throw new Error(JSON.stringify(json.errors));
  return json.result[0].results ?? [];
}

async function textColumns() {
  const tables = (await d1("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_cf_%'"))
    .map((r) => r.name)
    .filter((t) => !SKIP_TABLES.has(t));
  const out = [];
  for (const t of tables) {
    const cols = await d1(`PRAGMA table_info("${t}")`);
    for (const c of cols) if (/TEXT|CHAR|CLOB|^$/i.test(c.type || "")) out.push({ table: t, column: c.name });
  }
  return out;
}

/** Replace every occurrence of each mapping key inside text columns, returns number of rows changed. */
async function rewriteDatabase(mapping, label) {
  let changed = 0;
  for (const { table, column } of await textColumns()) {
    const rows = await d1(`SELECT rowid AS rid, "${column}" AS v FROM "${table}" WHERE instr("${column}", ?) > 0`, [R2_BASE]);
    for (const row of rows) {
      let next = String(row.v);
      for (const [from, to] of Object.entries(mapping)) next = next.split(from).join(to);
      if (next !== row.v) {
        await d1(`UPDATE "${table}" SET "${column}" = ? WHERE rowid = ?`, [next, row.rid]);
        changed += 1;
        console.log(`  ${label}: ${table}.${column} rowid=${row.rid}`);
      }
    }
  }
  return changed;
}

if (rollbackIdx !== -1) {
  const map = JSON.parse(readFileSync(process.argv[rollbackIdx + 1], "utf8"));
  const reverse = Object.fromEntries(Object.values(map.images).map((i) => [i.to, i.from]));
  console.log(`Rolling back ${Object.keys(reverse).length} image URLs…`);
  console.log(`Rows reverted: ${await rewriteDatabase(reverse, "revert")}`);
  process.exit(0);
}

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: env.R2_ACCESS_KEY_ID, secretAccessKey: env.R2_SECRET_ACCESS_KEY },
});

async function put(key, body) {
  await s3.send(
    new PutObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: key,
      Body: body,
      ContentType: "image/webp",
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );
}

// 1. Find every distinct R2 image URL used by content tables.
const urlRe = new RegExp(`${R2_BASE.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/[^"'\\s)\\\\<>]+?\\.(?:png|jpe?g|webp|gif)`, "gi");
const found = new Set();
for (const { table, column } of await textColumns()) {
  const rows = await d1(`SELECT "${column}" AS v FROM "${table}" WHERE instr("${column}", ?) > 0`, [R2_BASE]);
  for (const r of rows) for (const m of String(r.v).matchAll(urlRe)) found.add(m[0]);
}
const urls = [...found].filter((u) => !u.includes("/optimized/"));
console.log(`${urls.length} distinct R2 images to process (${APPLY ? "APPLY" : "dry run"})`);

// 2. Convert + upload.
const mapping = {};
const report = {};
let before = 0;
let after = 0;
for (const url of urls) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const original = Buffer.from(await res.arrayBuffer());
    const pipeline = () => sharp(original, { animated: false }).rotate();
    const main = await pipeline().resize({ width: MAIN_EDGE, height: MAIN_EDGE, fit: "inside", withoutEnlargement: true }).webp({ quality: 82, effort: 5 }).toBuffer();
    const variants = {};
    for (const w of VARIANTS) {
      variants[w] = await pipeline().resize({ width: w, withoutEnlargement: true }).webp({ quality: 80, effort: 5 }).toBuffer();
    }
    const slug = decodeURIComponent(new URL(url).pathname.split("/").pop() ?? "image")
      .replace(/\.[^.]+$/, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40) || "image";
    const base = `optimized/mig-${createHash("sha1").update(url).digest("hex").slice(0, 10)}-${slug}`;
    if (APPLY) {
      await put(`${base}.webp`, main);
      for (const w of VARIANTS) await put(`${base}-w${w}.webp`, variants[w]);
    }
    mapping[url] = `${R2_BASE}/${base}.webp`;
    report[url] = { from: url, to: `${R2_BASE}/${base}.webp`, originalBytes: original.length, mainBytes: main.length, w640Bytes: variants[640].length };
    before += original.length;
    after += main.length;
    console.log(`${String(Math.round(original.length / 1024)).padStart(6)}KB -> ${String(Math.round(main.length / 1024)).padStart(4)}KB (card ${Math.round(variants[640].length / 1024)}KB)  ${url.split("/").slice(-2).join("/")}`);
  } catch (e) {
    console.warn(`  SKIP ${url}: ${e.message}`);
  }
}
console.log(`\nTotal original ${(before / 1048576).toFixed(1)}MB -> main files ${(after / 1048576).toFixed(1)}MB`);

mkdirSync(new URL("./out/", import.meta.url), { recursive: true });
const outFile = new URL(`./out/r2-image-migration-${APPLY ? "applied" : "dryrun"}-${Date.now()}.json`, import.meta.url);
writeFileSync(outFile, JSON.stringify({ createdAt: new Date().toISOString(), applied: APPLY, images: report }, null, 2));
console.log(`Mapping saved: ${outFile.pathname}`);

// 3. Repoint the database.
if (APPLY) {
  console.log("Updating database…");
  console.log(`Rows updated: ${await rewriteDatabase(mapping, "update")}`);
} else {
  console.log("Dry run: nothing was uploaded and the database was not touched. Re-run with --apply.");
}
