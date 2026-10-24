/**
 * Shared naming for pre-optimized images.
 *
 * Every admin/customer upload is stored as small WebP/JPEG files under `optimized/`:
 *   optimized/<id>.webp            main file (max 1600px) — this is the URL saved in the database
 *   optimized/<id>-w320.webp       thumbnails
 *   optimized/<id>-w640.webp       cards
 *   optimized/<id>-w1280.webp      large views
 * The Next image loader (lib/image-loader.ts) picks the right file for the requested width, so the
 * browser never downloads more pixels than it renders and nothing depends on runtime resizing.
 */

export const OPTIMIZED_PREFIX = "optimized/";
export const VARIANT_WIDTHS = [320, 640, 1280] as const;
export const MAIN_MAX_EDGE = 1600;

/** Upper bounds the server enforces so an oversized image can never be stored again. */
export const MAX_MAIN_BYTES = 600_000;
export const MAX_VARIANT_BYTES = 350_000;

const OPTIMIZED_URL = /^(.*\/optimized\/[^/?#]+?)(?:-w\d+)?\.(webp|jpg)$/i;

export function isOptimizedImageUrl(src: string): boolean {
  return OPTIMIZED_URL.test(src);
}

/** URL of the smallest pre-built file that is at least `width` px wide (falls back to the main file). */
export function optimizedImageUrlForWidth(src: string, width: number): string {
  const m = OPTIMIZED_URL.exec(src);
  if (!m) return src;
  const [, base, ext] = m;
  const variant = VARIANT_WIDTHS.find((w) => width <= w);
  return variant ? `${base}-w${variant}.${ext.toLowerCase()}` : `${base}.${ext.toLowerCase()}`;
}
