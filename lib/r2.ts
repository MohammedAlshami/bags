import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getCloudflareEnvBinding, getRuntimeEnv } from "@/lib/cloudflare-runtime-env";
import { assertImageFileAllowed } from "@/lib/file-to-image-data-url";

type R2BucketBinding = {
  put: (
    key: string,
    value: ArrayBuffer | ArrayBufferView | string | ReadableStream,
    options?: { httpMetadata?: { contentType?: string } },
  ) => Promise<unknown>;
};

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
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

function createObjectKey(file: File) {
  const ext = MIME_TO_EXT[file.type] ?? "";
  const baseName = sanitizeName(file.name.replace(/\.[^.]+$/, "")) || "upload";
  const stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return `uploads/${stamp}-${baseName}${ext}`;
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

export async function uploadImageToR2(file: File): Promise<string> {
  assertImageFileAllowed(file);
  const key = createObjectKey(file);
  const binding = getCloudflareEnvBinding<R2BucketBinding>("MEDIA");

  if (binding) {
    await binding.put(key, await file.arrayBuffer(), {
      httpMetadata: { contentType: file.type },
    });
    return buildPublicUrl(key);
  }

  const client = getS3Client();
  const bucket = getRequiredEnv("R2_BUCKET_NAME");
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: Buffer.from(await file.arrayBuffer()),
      ContentType: file.type,
    }),
  );
  return buildPublicUrl(key);
}
