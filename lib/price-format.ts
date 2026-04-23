export function formatDualPrice(price: string, oldRiyal?: number | string | null) {
  const normalizedOldRiyal = typeof oldRiyal === "string" ? Number(oldRiyal) : oldRiyal;
  if (!normalizedOldRiyal) {
    return price;
  }

  const saudiRiyal = "\u0631 \u0633";
  const oldYemenRiyal = "\u0631 \u0642";
  const saudiPrice = price.replace(/\u0631\.\u0633/g, saudiRiyal);
  return `${Number(normalizedOldRiyal).toLocaleString("en-US")} ${oldYemenRiyal} / ${saudiPrice}`;
}

export type ProductSizePrice = {
  label: string;
  sarPrice: number;
  oldRiyal: number;
};

export function formatSizePrice(size: ProductSizePrice) {
  return `${Number(size.oldRiyal).toLocaleString("en-US")} ${"\u0631 \u0642"} / ${size.sarPrice} ${"\u0631 \u0633"}`;
}
