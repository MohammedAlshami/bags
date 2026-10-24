/**
 * Shrinks oversized images in /public in place (same filename + format, so no code changes needed).
 * Originals stay recoverable from git. Usage: node scripts/optimize-static-images.mjs [--dry]
 */
import { readdir, readFile, writeFile, stat } from "node:fs/promises";
import { join, extname, basename } from "node:path";
import sharp from "sharp";

const ROOT = new URL("../public", import.meta.url).pathname;
const MIN_BYTES = 200 * 1024;
const MAX_EDGE = 2000;
const dry = process.argv.includes("--dry");

async function* walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else yield p;
  }
}

let before = 0;
let after = 0;
for await (const file of walk(ROOT)) {
  const ext = extname(file).toLowerCase();
  if (![".jpg", ".jpeg", ".png"].includes(ext)) continue;
  const size = (await stat(file)).size;
  if (size < MIN_BYTES) continue;

  const input = await readFile(file);
  const meta = await sharp(input).metadata();
  // The logo is only ever shown small (navbar/footer) or as a 512px favicon/OG image.
  const edge = basename(file).startsWith("logo") ? 512 : MAX_EDGE;
  let pipeline = sharp(input).rotate().resize({ width: edge, height: edge, fit: "inside", withoutEnlargement: true });
  pipeline =
    ext === ".png"
      ? pipeline.png({ palette: true, quality: 85, effort: 9, compressionLevel: 9 })
      : pipeline.jpeg({ quality: 78, mozjpeg: true, progressive: true });
  const out = await pipeline.toBuffer();
  if (out.length >= size) continue;
  before += size;
  after += out.length;
  console.log(`${(size / 1024).toFixed(0).padStart(6)}KB -> ${(out.length / 1024).toFixed(0).padStart(5)}KB  ${meta.width}x${meta.height}  ${file.replace(ROOT, "")}`);
  if (!dry) await writeFile(file, out);
}
console.log(`\n${(before / 1048576).toFixed(1)}MB -> ${(after / 1048576).toFixed(1)}MB${dry ? " (dry run)" : ""}`);
