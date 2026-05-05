"use client";

/**
 * Top offers strip (design kit: bg primary, 40px, white 12px)
 */
export function OffersBanner() {
  return (
    <div
      className="relative flex min-h-[40px] w-full items-center justify-center overflow-hidden border-b border-black/5 bg-brand-primary px-4 py-2 text-center text-[12px] font-medium leading-none text-white"
      role="region"
      aria-label="منتجات الملكة جولد للعناية فرع اليمن"
      dir="rtl"
    >
      منتجات الملكة جولد للعناية فرع اليمن
    </div>
  );
}
