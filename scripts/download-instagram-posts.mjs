/**
 * Downloads full, uncropped Instagram images (including every carousel slide) via gallery-dl.
 *
 * Requires Netscape-format cookies from a browser where you are logged into Instagram.
 * Save them as `cookies/instagram.txt`, or set `INSTAGRAM_COOKIES` to the file path.
 * (Browser extension: "Get cookies.txt LOCALLY" or similar — export for instagram.com.)
 *
 * Microlink / public embed pages are not used: they only expose cropped thumbnails or wrong
 * images for multi-photo posts.
 *
 * Prerequisites: Python `gallery-dl` on PATH (`pip install gallery-dl`).
 *
 * Usage: node scripts/download-instagram-posts.mjs [path-to-urls.txt]
 * Default urls file: downloads/instagram-queen-007696-urls.txt
 */
import { existsSync } from "fs";
import { mkdir, readFile } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { spawnSync } from "child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DEFAULT_URLS = join(__dirname, "..", "downloads", "instagram-queen-007696-urls.txt");
const OUT_DIR = join(__dirname, "..", "public", "instagram-queen-007696");
const DEFAULT_COOKIES = join(__dirname, "..", "cookies", "instagram.txt");

async function main() {
  const urlsPath = process.argv[2] || DEFAULT_URLS;
  await readFile(urlsPath, "utf8");

  const cookiesPath = process.env.INSTAGRAM_COOKIES || DEFAULT_COOKIES;
  if (!existsSync(cookiesPath)) {
    console.error(
      "Missing cookie file. Export Netscape cookies from a logged-in Instagram session to:\n" +
        `  ${DEFAULT_COOKIES}\n` +
        "or set INSTAGRAM_COOKIES to that file path, then run again."
    );
    process.exit(1);
  }

  await mkdir(OUT_DIR, { recursive: true });
  console.log("gallery-dl →", OUT_DIR);
  console.log("cookies:", cookiesPath);

  const r = spawnSync("gallery-dl", ["-C", cookiesPath, "-d", OUT_DIR, "-i", urlsPath], {
    stdio: "inherit",
    shell: true,
  });
  process.exit(r.status === null ? 1 : r.status);
}

main();
