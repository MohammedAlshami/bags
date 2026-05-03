/** Shared styles for «أضف إلى السلة» — matches product detail CTA feel (hover, active scale, focus ring). */

export const addToCartPrimaryButtonClassName =
  "cursor-pointer select-none rounded-full bg-brand-primary py-4 text-sm font-semibold text-white shadow-sm transition-[transform,box-shadow,background-color] duration-200 hover:bg-brand-dark hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/35 focus-visible:ring-offset-2 active:scale-[0.98] active:shadow-sm";

/** Outline pill on light backgrounds (e.g. featured grid hover overlay). */
export const addToCartCardOutlineButtonClassName =
  "pointer-events-auto inline-flex h-10 min-h-10 w-full cursor-pointer select-none items-center justify-center rounded-full border-[1.5px] border-brand-primary bg-white px-5 text-[13px] font-semibold text-brand-primary shadow-sm transition-[transform,box-shadow,colors] duration-200 hover:border-brand-dark hover:bg-brand-dark hover:text-white hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/35 focus-visible:ring-offset-2 active:scale-[0.98] active:shadow-sm";
