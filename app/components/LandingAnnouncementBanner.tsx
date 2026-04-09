"use client";

/** Static announcement strip for the home page only (Arabic). */
export function LandingAnnouncementBanner() {
  return (
    <div
      className="fixed left-0 right-0 top-0 z-[60] flex h-10 items-center justify-center border-b border-pink-200/60 bg-[#fce4ec] px-4 text-center sm:h-11"
      dir="rtl"
    >
      <p
        className="text-sm font-medium text-neutral-800 sm:text-[0.8125rem]"
        style={{ fontFamily: "var(--font-playpen-arabic), sans-serif" }}
      >
        عرض خاص على أصناف محدودة الكمية — تسوقي قبل النفاد
      </p>
    </div>
  );
}
