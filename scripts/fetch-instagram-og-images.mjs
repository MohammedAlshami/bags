/**
 * Resolves Instagram post preview images via Microlink API, then saves to public/instagram-grid/.
 * Run: npm run fetch:instagram-grid
 *
 * Requires network. Re-run if a request fails (rate limits / transient HTML).
 */
import { writeFile, mkdir } from "fs/promises";
import { dirname, join, extname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "..", "public", "instagram-grid");

const POSTS = [
  "https://www.instagram.com/p/DWt2ucQjbiM/",
  "https://www.instagram.com/p/DWW2OqhjRfd/",
  "https://www.instagram.com/p/DWRZOVyjXYu/",
  "https://www.instagram.com/p/DV9FOGqjSCq/",
  "https://www.instagram.com/p/DV9FKEejZ8b/",
  "https://www.instagram.com/p/DV6gcs-jQqC/",
  "https://www.instagram.com/p/DV6gYAIjZUO/",
  "https://www.instagram.com/p/DV6gRfajTWT/",
  "https://www.instagram.com/p/DV4aRv9DROQ/",
  "https://www.instagram.com/p/DV4Zr9fDdup/",
];

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

async function microlinkImageUrl(postUrl, retries = 5) {
  const api = "https://api.microlink.io/?url=" + encodeURIComponent(postUrl);
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    const res = await fetch(api, { headers: { Accept: "application/json" } });
    const text = await res.text();
    let json;
    try {
      json = JSON.parse(text);
    } catch {
      await new Promise((r) => setTimeout(r, 800 * attempt));
      continue;
    }
    if (!res.ok || json.status !== "success") {
      throw new Error(json.message || `Microlink ${res.status}`);
    }
    const url = json.data?.image?.url;
    if (!url) throw new Error("No image in Microlink response");
    return url;
  }
  throw new Error("Microlink returned non-JSON too many times");
}

async function downloadFile(url, destPath) {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`Download failed ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(destPath, buf);
}

function extFromUrl(url) {
  try {
    const path = new URL(url).pathname;
    const e = extname(path.split("?")[0]);
    if (e === ".jpg" || e === ".jpeg" || e === ".webp" || e === ".png") return e === ".jpeg" ? ".jpg" : e;
  } catch {
    /* ignore */
  }
  return ".jpg";
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  for (let i = 0; i < POSTS.length; i += 1) {
    const post = POSTS[i];
    const pad = String(i + 1).padStart(2, "0");
    process.stdout.write(`${pad} ${post} ... `);
    try {
      const imgUrl = await microlinkImageUrl(post);
      const ext = extFromUrl(imgUrl);
      const dest = join(OUT_DIR, `post-${pad}${ext}`);
      await downloadFile(imgUrl, dest);
      console.log("ok");
      await new Promise((r) => setTimeout(r, 400));
    } catch (e) {
      console.error("FAIL", e.message);
      process.exitCode = 1;
    }
  }
}

main();
