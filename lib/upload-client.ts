"use client";

import { MAIN_MAX_EDGE, VARIANT_WIDTHS } from "@/lib/image-variants";

/**
 * Browser-side image optimizer used by every upload form. Converts the picked file to WebP
 * (JPEG when the browser can't encode WebP), downsizes it and builds the width variants, then
 * posts them in one multipart request. Returns the raw fetch Response (`{ url }` on success), so it
 * is a drop-in replacement for `fetch(endpoint, { method: "POST", body: formData })`.
 */

async function loadBitmap(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(file, { imageOrientation: "from-image" });
    } catch {
      /* fall through to <img> decoding */
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.decoding = "async";
    img.src = url;
    await img.decode();
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

async function encode(
  source: ImageBitmap | HTMLImageElement,
  maxEdge: number,
  quality: number,
): Promise<{ blob: Blob; ext: "webp" | "jpg" }> {
  const sw = "naturalWidth" in source ? source.naturalWidth : source.width;
  const sh = "naturalHeight" in source ? source.naturalHeight : source.height;
  const scale = Math.min(1, maxEdge / Math.max(sw, sh));
  const w = Math.max(1, Math.round(sw * scale));
  const h = Math.max(1, Math.round(sh * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("تعذر معالجة الصورة");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(source, 0, 0, w, h);

  const webp = await canvasToBlob(canvas, "image/webp", quality);
  if (webp && webp.type === "image/webp") return { blob: webp, ext: "webp" };
  // JPEG has no alpha channel: paint white behind transparent areas instead of letting them go black.
  ctx.globalCompositeOperation = "destination-over";
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);
  const jpg = await canvasToBlob(canvas, "image/jpeg", quality);
  if (!jpg) throw new Error("تعذر معالجة الصورة");
  return { blob: jpg, ext: "jpg" };
}

export async function buildOptimizedForm(file: File): Promise<FormData> {
  if (!file.type.startsWith("image/")) throw new Error("File must be an image");
  const bitmap = await loadBitmap(file);
  const form = new FormData();

  const main = await encode(bitmap, MAIN_MAX_EDGE, 0.82);
  form.set("file", new File([main.blob], `image.${main.ext}`, { type: main.blob.type }));
  for (const width of VARIANT_WIDTHS) {
    const v = await encode(bitmap, width, 0.8);
    form.set(`w${width}`, new File([v.blob], `image-w${width}.${v.ext}`, { type: v.blob.type }));
  }
  if ("close" in bitmap) bitmap.close();
  return form;
}

export async function postOptimizedImage(endpoint: string, file: File): Promise<Response> {
  const body = await buildOptimizedForm(file);
  return fetch(endpoint, { method: "POST", body, credentials: "include" });
}
