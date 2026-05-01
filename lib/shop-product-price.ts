import { parsePrice } from "@/lib/cart";

export type PricedLike = {
  price: string;
  sizes?: { label: string; sarPrice: number; oldRiyal: number }[] | null;
};

export type ShopPriceCurrency = "SAR" | "YER";

/** Prefer first variant SAR; otherwise parse `price` string. */
export function getProductSarPrice(p: PricedLike): number {
  const first = Array.isArray(p.sizes) && p.sizes.length > 0 ? p.sizes[0] : null;
  if (first && typeof first.sarPrice === "number" && !Number.isNaN(first.sarPrice)) {
    return first.sarPrice;
  }
  return parsePrice(p.price);
}

type PricedWithOld = PricedLike & { oldRiyal?: number | null };

/** Prefer first variant YER (ر.ق); else product-level `oldRiyal`; else 0. */
export function getProductYerPrice(p: PricedWithOld): number {
  const first = Array.isArray(p.sizes) && p.sizes.length > 0 ? p.sizes[0] : null;
  if (first && typeof first.oldRiyal === "number" && !Number.isNaN(first.oldRiyal)) {
    return first.oldRiyal;
  }
  const o = p.oldRiyal;
  if (o != null && typeof o === "number" && !Number.isNaN(o)) return o;
  return 0;
}

export function getProductPriceForFilter(p: PricedWithOld, currency: ShopPriceCurrency): number {
  return currency === "SAR" ? getProductSarPrice(p) : getProductYerPrice(p);
}
