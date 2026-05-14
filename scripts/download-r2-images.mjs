/**
 * Lists all objects in the R2 bucket and downloads them to /r2-images/
 * Uses the S3-compatible API with AWS Signature V4
 */

import { createHmac, createHash } from "crypto";
import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const ACCOUNT_ID = "e2f9e8d1485dce72d1a18307ed32a47a";
const BUCKET = "makeup";
const ACCESS_KEY = "530e0594d37d96df0cc35361aee1c1ad";
const SECRET_KEY = "2dd87c46420fa2e4fa07718a30f0444a3db7e7ce14eb2e1c5f15d40c75f69c70";
const PUBLIC_URL = "https://pub-9f312be7e4a94c53b384bfcf5701085e.r2.dev";
const ENDPOINT = `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`;

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "..", "r2-images");
mkdirSync(OUT_DIR, { recursive: true });

function sha256(data) {
  return createHash("sha256").update(data).digest("hex");
}

function hmac(key, data, encoding) {
  return createHmac("sha256", key).update(data).digest(encoding ?? "buffer");
}

function getSigningKey(secret, date, region, service) {
  const kDate = hmac("AWS4" + secret, date);
  const kRegion = hmac(kDate, region);
  const kService = hmac(kRegion, service);
  return hmac(kService, "aws4_request");
}

function signRequest(method, path, query, headers, body, date) {
  const region = "auto";
  const service = "s3";
  const dateShort = date.slice(0, 8);

  const canonicalHeaders = Object.entries(headers)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k.toLowerCase()}:${v.trim()}`)
    .join("\n") + "\n";

  const signedHeaders = Object.keys(headers)
    .map((k) => k.toLowerCase())
    .sort()
    .join(";");

  const payloadHash = sha256(body ?? "");

  const canonicalRequest = [
    method,
    path,
    query,
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join("\n");

  const credentialScope = `${dateShort}/${region}/${service}/aws4_request`;
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    date,
    credentialScope,
    sha256(canonicalRequest),
  ].join("\n");

  const signingKey = getSigningKey(SECRET_KEY, dateShort, region, service);
  const signature = hmac(signingKey, stringToSign, "hex");

  return `AWS4-HMAC-SHA256 Credential=${ACCESS_KEY}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
}

async function listObjects(continuationToken) {
  const now = new Date();
  const date = now.toISOString().replace(/[:-]|\.\d{3}/g, "").slice(0, 15) + "Z";
  const host = `${ACCOUNT_ID}.r2.cloudflarestorage.com`;

  let query = "list-type=2&max-keys=1000";
  if (continuationToken) query += `&continuation-token=${encodeURIComponent(continuationToken)}`;

  const headers = {
    Host: host,
    "x-amz-date": date,
    "x-amz-content-sha256": sha256(""),
  };

  const auth = signRequest("GET", `/${BUCKET}`, query, headers, "", date);
  headers["Authorization"] = auth;

  const res = await fetch(`${ENDPOINT}/${BUCKET}?${query}`, { headers });
  if (!res.ok) throw new Error(`List failed: ${res.status} ${await res.text()}`);
  return await res.text();
}

function parseKeys(xml) {
  const keys = [];
  const regex = /<Key>([^<]+)<\/Key>/g;
  let m;
  while ((m = regex.exec(xml)) !== null) keys.push(m[1]);
  const truncated = xml.includes("<IsTruncated>true</IsTruncated>");
  const nextToken = xml.match(/<NextContinuationToken>([^<]+)<\/NextContinuationToken>/)?.[1];
  return { keys, truncated, nextToken };
}

// Collect all keys
let allKeys = [];
let token = null;
do {
  const xml = await listObjects(token);
  const { keys, truncated, nextToken } = parseKeys(xml);
  allKeys.push(...keys);
  token = truncated ? nextToken : null;
  console.log(`Listed ${allKeys.length} objects so far...`);
} while (token);

console.log(`\nTotal objects: ${allKeys.length}`);

// Filter to images only
const imageKeys = allKeys.filter((k) =>
  /\.(jpe?g|png|webp|gif|avif)$/i.test(k)
);
console.log(`Image files: ${imageKeys.length}\n`);

// Download each via public URL (no auth needed)
let ok = 0, fail = 0;
for (const key of imageKeys) {
  const url = `${PUBLIC_URL}/${key.split("/").map(encodeURIComponent).join("/")}`;
  // Preserve folder structure
  const localPath = join(OUT_DIR, key.replace(/\//g, "_"));

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    writeFileSync(localPath, buf);
    console.log(`✓ ${key} (${(buf.length / 1024).toFixed(0)} KB)`);
    ok++;
  } catch (e) {
    console.error(`✗ ${key}: ${e.message}`);
    fail++;
  }
}

console.log(`\nDone: ${ok} downloaded, ${fail} failed → ${OUT_DIR}`);
