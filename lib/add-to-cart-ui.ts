/** Shared styles for «أضف إلى السلة» — matches product detail CTA feel (hover, active scale, focus ring). */

export const addToCartPrimaryButtonClassName =
  "cursor-pointer select-none rounded-full bg-brand-primary py-4 text-sm font-semibold text-white shadow-sm transition-[transform,box-shadow,background-color] duration-200 hover:bg-brand-dark hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/35 focus-visible:ring-offset-2 active:scale-[0.98] active:shadow-sm";

/**
 * Add-to-cart pill on product card images. Touch devices (no hover) get a small, always-visible pill;
 * devices that can hover keep the full-width pill that fades in over the image.
 */
export const addToCartCardOverlayClassName =
  "absolute inset-x-2 bottom-2 z-20 flex justify-center [@media(hover:hover)]:bottom-3 [@media(hover:hover)]:pointer-events-none [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:transition-opacity [@media(hover:hover)]:duration-300 [@media(hover:hover)]:group-hover:pointer-events-auto [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:focus-within:pointer-events-auto [@media(hover:hover)]:focus-within:opacity-100";

export const addToCartCardCompactButtonClassName =
  "pointer-events-auto inline-flex h-8 min-h-8 w-auto cursor-pointer select-none items-center justify-center gap-1.5 rounded-full border-[1.5px] border-brand-primary bg-white/95 px-3.5 text-[12px] font-semibold text-brand-primary shadow-sm transition-[transform,box-shadow,colors] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/35 focus-visible:ring-offset-2 active:scale-[0.97] active:bg-brand-primary active:text-white [@media(hover:hover)]:h-10 [@media(hover:hover)]:min-h-10 [@media(hover:hover)]:w-full [@media(hover:hover)]:px-5 [@media(hover:hover)]:text-[13px] [@media(hover:hover)]:hover:border-brand-dark [@media(hover:hover)]:hover:bg-brand-dark [@media(hover:hover)]:hover:text-white [@media(hover:hover)]:hover:shadow-md";

/** Outline pill on light backgrounds (e.g. featured grid hover overlay). */
export const addToCartCardOutlineButtonClassName =
  "pointer-events-auto inline-flex h-10 min-h-10 w-full cursor-pointer select-none items-center justify-center rounded-full border-[1.5px] border-brand-primary bg-white px-5 text-[13px] font-semibold text-brand-primary shadow-sm transition-[transform,box-shadow,colors] duration-200 hover:border-brand-dark hover:bg-brand-dark hover:text-white hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/35 focus-visible:ring-offset-2 active:scale-[0.98] active:shadow-sm";
