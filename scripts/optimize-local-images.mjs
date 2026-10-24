/**
 * Moves content images that are stored as site-relative paths (e.g. /product_Images/x.jpeg) onto the
 * CDN as pre-built WebP variants, so they stop being resized per request. Originals stay in /public.
 *
 *   node scripts/optimize-local-images.mjs              # dry run
 *   node scripts/optimize-local-images.mjs --apply
 *   node scripts/optimize-local-images.mjs --rollback scripts/out/<map>.json
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8").split("\n").filter((l) => l.includes("=") && !l.trim().startsWith("#"))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, "")]; }),
);
const SITE = "https://goldqueen.store";
const CDN = env.R2_PUBLIC_URL.replace(/\/+$/, "");
const APPLY = process.argv.includes("--apply");
const rb = process.argv.indexOf("--rollback");
const TABLES = [["products", "image"], ["packages", "image"], ["categories", "image"]];

async function d1(sql, params = []) {
  const r = await fetch(`https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/d1/database/${env.CLOUDFLARE_DATABASE_ID}/query`, {
    method: "POST", headers: { Authorization: `Bearer ${env.CLOUDFLARE_D1_TOKEN}`, "Content-Type": "application/json" }, body: JSON.stringify({ sql, params }),
  });
  const j = await r.json();
  if (!j.success) throw new Error(JSON.stringify(j.errors));
  return j.result[0].results ?? [];
}

async function existingColumns(table) { return new Set((await d1(`PRAGMA table_info("${table}")`)).map((c) => c.name)); }

if (rb !== -1) {
  const map = JSON.parse(readFileSync(process.argv[rb + 1], "utf8")).images;
  for (const [from, to] of Object.entries(map).map(([k, v]) => [k, v.to])) {
    for (const [t, c] of TABLES) if ((await existingColumns(t)).has(c)) await d1(`UPDATE "${t}" SET "${c}" = ? WHERE "${c}" = ?`, [from, to]);
  }
  console.log("rolled back", Object.keys(map).length, "images");
  process.exit(0);
}

const s3 = new S3Client({ region: "auto", endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`, credentials: { accessKeyId: env.R2_ACCESS_KEY_ID, secretAccessKey: env.R2_SECRET_ACCESS_KEY } });
const put = (Key, Body) => s3.send(new PutObjectCommand({ Bucket: env.R2_BUCKET_NAME, Key, Body, ContentType: "image/webp", CacheControl: "public, max-age=31536000, immutable" }));

const paths = new Set();
for (const [t, c] of TABLES) {
  if (!(await existingColumns(t)).has(c)) continue;
  for (const r of await d1(`SELECT DISTINCT "${c}" AS v FROM "${t}" WHERE "${c}" LIKE '/%' AND ("${c}" LIKE '%.jpg' OR "${c}" LIKE '%.jpeg' OR "${c}" LIKE '%.png' OR "${c}" LIKE '%.JPG' OR "${c}" LIKE '%.PNG')`)) paths.add(r.v);
}
console.log(`${paths.size} local images (${APPLY ? "APPLY" : "dry run"})`);

const images = {};
let before = 0, after = 0;
for (const p of paths) {
  try {
    const res = await fetch(SITE + encodeURI(p));
    if (!res.ok) throw new Error("HTTP " + res.status);
    const orig = Buffer.from(await res.arrayBuffer());
    const s = () => sharp(orig).rotate();
    const main = await s().resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true }).webp({ quality: 82, effort: 5 }).toBuffer();
    const vars = {};
    for (const w of [320, 640, 1280]) vars[w] = await s().resize({ width: w, withoutEnlargement: true }).webp({ quality: 78, effort: 5 }).toBuffer();
    const slug = p.split("/").pop().replace(/\.[^.]+$/, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "image";
    const base = `optimized/loc-${createHash("sha1").update(p).digest("hex").slice(0, 10)}-${slug}`;
    if (APPLY) { await put(`${base}.webp`, main); for (const w of [320, 640, 1280]) await put(`${base}-w${w}.webp`, vars[w]); }
    images[p] = { from: p, to: `${CDN}/${base}.webp` };
    before += orig.length; after += main.length;
    console.log(`${String(Math.round(orig.length / 1024)).padStart(5)}KB -> main ${String(Math.round(main.length / 1024)).padStart(3)}KB, card ${Math.round(vars[640].length / 1024)}KB, thumb ${Math.round(vars[320].length / 1024)}KB  ${p}`);
  } catch (e) { console.warn("SKIP", p, e.message); }
}
mkdirSync(new URL("./out/", import.meta.url), { recursive: true });
const out = new URL(`./out/local-images-${APPLY ? "applied" : "dryrun"}-${Date.now()}.json`, import.meta.url);
writeFileSync(out, JSON.stringify({ images }, null, 2));
console.log(`\n${(before / 1024).toFixed(0)}KB -> ${(after / 1024).toFixed(0)}KB main files. Map: ${out.pathname}`);
if (APPLY) {
  for (const [t, c] of TABLES) if ((await existingColumns(t)).has(c)) for (const { from, to } of Object.values(images)) await d1(`UPDATE "${t}" SET "${c}" = ? WHERE "${c}" = ?`, [to, from]);
  console.log("Database updated.");
}
