"use client";

import { useDisplayCurrency } from "@/app/context/CurrencyContext";
import { formatDualDiscountPriceForDisplay } from "@/lib/price-format";
import { sans } from "@/lib/page-theme";

type Props = {
  saudiRiyal: number;
  oldRiyal: number | null;
  saudiRiyalBeforeDiscount?: number | null;
  oldRiyalBeforeDiscount?: number | null;
};

export function ShopPackagePriceBlock({
  saudiRiyal,
  oldRiyal,
  saudiRiyalBeforeDiscount,
  oldRiyalBeforeDiscount,
}: Props) {
  const mode = useDisplayCurrency();
  const priceLines = formatDualDiscountPriceForDisplay(mode, {
    saudiRiyal,
    oldRiyal,
    saudiRiyalBeforeDiscount,
    oldRiyalBeforeDiscount,
  });
  return (
    <>
      <p className="mt-2 text-xs font-semibold text-white md:text-sm" style={sans}>
        {priceLines.current}
      </p>
      {priceLines.before ? (
        <p className="mt-1 text-xs text-white/60 line-through" style={sans}>
          {priceLines.before}
        </p>
      ) : null}
    </>
  );
}
