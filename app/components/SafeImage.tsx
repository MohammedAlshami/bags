"use client";

import Image, { type ImageProps } from "next/image";
import { imageSrcNeedsUnoptimized } from "@/lib/imageSrcNeedsUnoptimized";

/** Use for product/order images that may be `data:image/...;base64,...` from Neon. */
export function SafeImage(props: ImageProps) {
  const src = typeof props.src === "string" ? props.src : "";
  const unopt = imageSrcNeedsUnoptimized(src) || Boolean(props.unoptimized);
  return <Image {...props} unoptimized={unopt} />;
}
