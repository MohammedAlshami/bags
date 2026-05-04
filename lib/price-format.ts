import { formatSar } from "@/lib/format-sar";
import type { CartItem } from "@/lib/cart";
import { getCartLineSar } from "@/lib/cart";

const saudiRiyalLabel = "\u0631 \u0633";
const oldYemenRiyalLabel = "\u0631 \u0642";

/** Public site: single currency, dual, or both lines (default). */
export type DisplayCurrencyMode = "SAR" | "YER" | "BOTH";

/** Dual line: old currency (YER-style display) + formatted SAR. */
export function formatDualPrice(saudiRiyal: number, oldRiyal?: number | string | null) {
  const normalizedOldRiyal = typeof oldRiyal === "string" ? Number(oldRiyal) : oldRiyal;
  const sarLine = formatSar(saudiRiyal).replace(/\u0631\.\u0633/g, saudiRiyalLabel);
  if (normalizedOldRiyal == null || !Number.isFinite(normalizedOldRiyal) || normalizedOldRiyal <= 0) {
    return sarLine;
  }
  return `${Number(normalizedOldRiyal).toLocaleString("en-US")} ${oldYemenRiyalLabel} / ${sarLine}`;
}

export function formatDualDiscountPrice({
  saudiRiyal,
  oldRiyal,
  saudiRiyalBeforeDiscount,
  oldRiyalBeforeDiscount,
}: {
  saudiRiyal: number;
  oldRiyal?: number | string | null;
  saudiRiyalBeforeDiscount?: number | string | null;
  oldRiyalBeforeDiscount?: number | string | null;
}) {
  const current = formatDualPrice(saudiRiyal, oldRiyal);
  const beforeSar =
    typeof saudiRiyalBeforeDiscount === "string"
      ? Number(saudiRiyalBeforeDiscount)
      : saudiRiyalBeforeDiscount;
  const beforeOld =
    typeof oldRiyalBeforeDiscount === "string" ? Number(oldRiyalBeforeDiscount) : oldRiyalBeforeDiscount;
  const hasBeforeSar = beforeSar != null && Number.isFinite(beforeSar) && beforeSar > 0;
  const hasBeforeOld = beforeOld != null && Number.isFinite(beforeOld) && beforeOld > 0;
  if (!hasBeforeSar && !hasBeforeOld) {
    return { current, before: null };
  }
  if (hasBeforeSar) {
    return {
      current,
      before: formatDualPrice(Number(beforeSar), hasBeforeOld ? beforeOld : null),
    };
  }
  return {
    current,
    before: `${Number(beforeOld).toLocaleString("en-US")} ${oldYemenRiyalLabel}`,
  };
}

export type ProductSizePrice = {
  label: string;
  sarPrice: number;
  oldRiyal: number;
};

export function formatSizePrice(size: ProductSizePrice) {
  return `${Number(size.oldRiyal).toLocaleString("en-US")} ${oldYemenRiyalLabel} / ${size.sarPrice} ${saudiRiyalLabel}`;
}

function sarLineFormatted(saudiRiyal: number) {
  return formatSar(saudiRiyal).replace(/\u0631\.\u0633/g, saudiRiyalLabel);
}

/** Unit or total — formats according to visitor currency preference. */
export function formatPriceForDisplay(
  mode: DisplayCurrencyMode,
  saudiRiyal: number,
  oldRiyal?: number | string | null
) {
  const normalizedOld = typeof oldRiyal === "string" ? Number(oldRiyal) : oldRiyal;
  const hasOld = normalizedOld != null && Number.isFinite(normalizedOld) && normalizedOld > 0;
  if (mode === "BOTH") return formatDualPrice(saudiRiyal, hasOld ? normalizedOld : null);
  if (mode === "SAR") return sarLineFormatted(saudiRiyal);
  if (hasOld) return `${Number(normalizedOld).toLocaleString("en-US")} ${oldYemenRiyalLabel}`;
  return sarLineFormatted(saudiRiyal);
}

export function formatSizePriceForDisplay(mode: DisplayCurrencyMode, size: ProductSizePrice) {
  if (mode === "BOTH") return formatSizePrice(size);
  if (mode === "SAR") return sarLineFormatted(size.sarPrice);
  return `${Number(size.oldRiyal).toLocaleString("en-US")} ${oldYemenRiyalLabel}`;
}

export function formatDualDiscountPriceForDisplay(
  mode: DisplayCurrencyMode,
  {
    saudiRiyal,
    oldRiyal,
    saudiRiyalBeforeDiscount,
    oldRiyalBeforeDiscount,
  }: {
    saudiRiyal: number;
    oldRiyal?: number | string | null;
    saudiRiyalBeforeDiscount?: number | string | null;
    oldRiyalBeforeDiscount?: number | string | null;
  }
) {
  const current = formatPriceForDisplay(mode, saudiRiyal, oldRiyal);
  const beforeSar =
    typeof saudiRiyalBeforeDiscount === "string"
      ? Number(saudiRiyalBeforeDiscount)
      : saudiRiyalBeforeDiscount;
  const beforeOld =
    typeof oldRiyalBeforeDiscount === "string" ? Number(oldRiyalBeforeDiscount) : oldRiyalBeforeDiscount;
  const hasBeforeSar = beforeSar != null && Number.isFinite(beforeSar) && beforeSar > 0;
  const hasBeforeOld = beforeOld != null && Number.isFinite(beforeOld) && beforeOld > 0;
  if (!hasBeforeSar && !hasBeforeOld) {
    return { current, before: null };
  }
  if (hasBeforeSar) {
    return {
      current,
      before: formatPriceForDisplay(mode, Number(beforeSar), hasBeforeOld ? beforeOld : null),
    };
  }
  return {
    current,
    before: `${Number(beforeOld).toLocaleString("en-US")} ${oldYemenRiyalLabel}`,
  };
}

/** One cart line total (quantity × unit). */
export function formatCartLineTotalDisplay(item: CartItem, mode: DisplayCurrencyMode): string {
  const qty = item.quantity;
  const totalSar = getCartLineSar(item) * qty;
  const unitOld =
    item.oldRiyal != null && Number.isFinite(item.oldRiyal) ? Number(item.oldRiyal) : null;
  const totalOld = unitOld != null ? unitOld * qty : null;
  return formatPriceForDisplay(mode, totalSar, totalOld);
}

export function formatCartSubtotalDisplay(items: CartItem[], mode: DisplayCurrencyMode): string {
  let totalSar = 0;
  let totalOld = 0;
  let anyOld = false;
  for (const i of items) {
    totalSar += getCartLineSar(i) * i.quantity;
    if (i.oldRiyal != null && Number.isFinite(i.oldRiyal)) {
      totalOld += Number(i.oldRiyal) * i.quantity;
      anyOld = true;
    }
  }
  return formatPriceForDisplay(mode, totalSar, anyOld ? totalOld : null);
}
