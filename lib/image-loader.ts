import { isOptimizedImageUrl, optimizedImageUrlForWidth } from "@/lib/image-variants";

type LoaderArgs = { src: string; width: number; quality?: number };

/**
 * next/image loader. Pre-optimized uploads are served straight from storage (already tiny, immutable,
 * cached forever); everything else keeps the default /_next/image behaviour.
 */
export default function imageLoader({ src, width, quality }: LoaderArgs): string {
  if (isOptimizedImageUrl(src)) return optimizedImageUrlForWidth(src, width);
  return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality || 75}`;
}
