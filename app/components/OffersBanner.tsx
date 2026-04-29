"use client";

import { QGB_OFFERS } from "@/lib/brand-kit";

function TickerLine() {
  return (
    <span className="inline-flex items-center justify-center gap-3 px-6 sm:px-10">
      {QGB_OFFERS.map((t, i) => (
        <span key={`${t}-${i}`} className="inline-flex items-center gap-3 whitespace-nowrap">
          {i > 0 ? <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-light" aria-hidden /> : null}
          {t}
        </span>
      ))}
    </span>
  );
}

/**
 * Top offers strip (design kit: bg primary, 40px, white 12px, dot separators)
 */
export function OffersBanner() {
  return (
    <div
      className="relative w-full overflow-hidden border-b border-black/5 bg-brand-primary text-[12px] font-medium leading-none text-white"
      style={{ minHeight: 40 }}
      role="region"
      aria-label="عروض"
    >
      <div className="qgb-ticker-row flex w-max" dir="rtl">
        <TickerLine />
        <TickerLine />
      </div>
    </div>
  );
}
