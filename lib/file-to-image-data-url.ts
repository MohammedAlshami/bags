/** Max raw file size before base64 (payment slips / product photos). */
export const MAX_IMAGE_UPLOAD_BYTES = 2_500_000;

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

export function assertImageFileAllowed(file: File): void {
  if (!file.type.startsWith("image/")) {
    throw new Error("File must be an image");
  }
  if (!MIME_TO_EXT[file.type]) {
    throw new Error("Unsupported image type (use JPEG, PNG, WebP, or GIF)");
  }
  if (file.size > MAX_IMAGE_UPLOAD_BYTES) {
    throw new Error(`Image too large (max ${Math.floor(MAX_IMAGE_UPLOAD_BYTES / 1_000_000)} MB)`);
  }
}

/** Legacy helper kept for compatibility with old rows. New uploads should go to R2 instead. */
export async function fileToImageDataUrl(file: File): Promise<string> {
  assertImageFileAllowed(file);
  const buf = Buffer.from(await file.arrayBuffer());
  const b64 = buf.toString("base64");
  return `data:${file.type};base64,${b64}`;
}
