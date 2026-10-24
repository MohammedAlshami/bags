import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { MAX_MAIN_BYTES, MAX_VARIANT_BYTES, OPTIMIZED_PREFIX, VARIANT_WIDTHS } from "@/lib/image-variants";
import { getCloudflareEnvBinding, getRuntimeEnv } from "@/lib/cloudflare-runtime-env";

type R2BucketBinding = {
  put: (
    key: string,
    value: ArrayBuffer | ArrayBufferView | string | ReadableStream,
    options?: { httpMetadata?: { contentType?: string; cacheControl?: string } },
  ) => Promise<unknown>;
};

let s3Client: S3Client | undefined;

function getRequiredEnv(name: string) {
  const value = getRuntimeEnv(name);
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function buildPublicUrl(key: string) {
  const base = getRequiredEnv("R2_PUBLIC_URL").replace(/\/+$/, "");
  return `${base}/${key}`;
}

function sanitizeName(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function createObjectBase(file: File) {
  const baseName = sanitizeName(file.name.replace(/\.[^.]+$/, "")) || "image";
  const stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return `${OPTIMIZED_PREFIX}${stamp}-${baseName}`;
}

function getS3Client() {
  if (s3Client) return s3Client;
  const accountId = getRequiredEnv("R2_ACCOUNT_ID");
  const accessKeyId = getRequiredEnv("R2_ACCESS_KEY_ID");
  const secretAccessKey = getRequiredEnv("R2_SECRET_ACCESS_KEY");
  s3Client = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
  return s3Client;
}

const IMMUTABLE_CACHE = "public, max-age=31536000, immutable";

type ImageKind = { ext: "webp" | "jpg"; contentType: string };

/** Detects WebP/JPEG from magic bytes — never trust the client-declared type. */
function detectImageKind(bytes: Uint8Array): ImageKind | null {
  const ascii = (from: number, len: number) => String.fromCharCode(...bytes.subarray(from, from + len));
  if (bytes.length > 12 && ascii(0, 4) === "RIFF" && ascii(8, 4) === "WEBP") {
    return { ext: "webp", contentType: "image/webp" };
  }
  if (bytes.length > 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { ext: "jpg", contentType: "image/jpeg" };
  }
  return null;
}

async function putObject(key: string, body: Uint8Array, contentType: string) {
  const binding = getCloudflareEnvBinding<R2BucketBinding>("MEDIA");
  if (binding) {
    await binding.put(key, body, { httpMetadata: { contentType, cacheControl: IMMUTABLE_CACHE } });
    return;
  }
  await getS3Client().send(
    new PutObjectCommand({
      Bucket: getRequiredEnv("R2_BUCKET_NAME"),
      Key: key,
      Body: Buffer.from(body),
      ContentType: contentType,
      CacheControl: IMMUTABLE_CACHE,
    }),
  );
}

/**
 * Stores an already-optimized image (main file + width variants produced by lib/upload-client.ts).
 * Oversized or non-WebP/JPEG files are rejected, so heavy originals can never reach storage.
 * Returns the public URL of the main file.
 */
export async function uploadOptimizedImageToR2(form: FormData): Promise<string> {
  const main = form.get("file");
  if (!(main instanceof File)) throw new Error("No file provided");

  const mainBytes = new Uint8Array(await main.arrayBuffer());
  const kind = detectImageKind(mainBytes);
  if (!kind) throw new Error("Unsupported image type (WebP or JPEG only — upload through the site form)");
  if (mainBytes.byteLength > MAX_MAIN_BYTES) {
    throw new Error("Image too large — the image must be optimized before upload");
  }

  const base = createObjectBase(main);
  const writes: Promise<void>[] = [putObject(`${base}.${kind.ext}`, mainBytes, kind.contentType)];

  for (const width of VARIANT_WIDTHS) {
    let bytes = mainBytes;
    const part = form.get(`w${width}`);
    if (part instanceof File) {
      const candidate = new Uint8Array(await part.arrayBuffer());
      const candidateKind = detectImageKind(candidate);
      if (candidateKind?.ext === kind.ext && candidate.byteLength <= MAX_VARIANT_BYTES) bytes = candidate;
    }
    // A missing/invalid variant falls back to the main file so every width URL still resolves.
    writes.push(putObject(`${base}-w${width}.${kind.ext}`, bytes, kind.contentType));
  }

  await Promise.all(writes);
  return buildPublicUrl(`${base}.${kind.ext}`);
}
