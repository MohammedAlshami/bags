"use client";

import { Toaster } from "sonner";
import "sonner/dist/styles.css";

export function CartToaster() {
  return (
    <Toaster
      dir="rtl"
      position="top-center"
      offset={{ top: "5.5rem" }}
      mobileOffset={{ top: "5.25rem" }}
      gap={12}
      duration={3200}
      toastOptions={{
        classNames: {
          toast:
            "rounded-2xl border border-brand-primary/20 bg-white !text-neutral-900 shadow-[0_12px_40px_-12px_rgba(182,58,107,0.35)] !flex !flex-col !items-center !justify-center !text-center !gap-2 !px-6 !py-4 !min-w-[min(100%,280px)] !max-w-[min(100vw-2rem,400px)]",
          content: "!w-full !items-center !text-center",
          title: "!text-[15px] !font-semibold !text-neutral-900 !text-center !leading-snug",
          description: "!text-[13px] !text-neutral-600 !text-center !leading-relaxed",
          success: "[&_[data-icon]]:!text-brand-primary",
          icon: "!text-brand-primary",
        },
      }}
      className="font-sans"
    />
  );
}
