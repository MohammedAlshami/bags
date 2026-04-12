/**
 * Next/Image optimization does not apply to data URLs; remote http(s) URLs that are not
 * covered by next.config images must use unoptimized (same rules as previous admin uploads).
 */
export function imageSrcNeedsUnoptimized(src: string): boolean {
  if (!src) return false;
  if (src.startsWith("data:")) return true;
  if (src.startsWith("http") && !/unsplash|ebayimg/i.test(src)) return true;
  return false;
}
