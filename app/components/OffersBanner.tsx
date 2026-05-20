"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

type AdStripData = {
  _id: string;
  text: string;
  isActive: boolean;
  bgColor: string | null;
  textColor: string | null;
  linkUrl: string | null;
};

export function OffersBanner() {
  const pathname = usePathname();
  const [strip, setStrip] = useState<AdStripData | null>(null);

  useEffect(() => {
    fetch("/api/admin/ad-strips")
      .then((r) => r.json())
      .then((data: AdStripData | null) => {
        if (data?.isActive) setStrip(data);
      })
      .catch(() => {});
  }, []);

  if (pathname?.startsWith("/admin")) return null;
  if (!strip) return null;

  const content = (
    <div
      className="relative flex min-h-[40px] w-full items-center justify-center overflow-hidden border-b border-black/5 px-4 py-2 text-center text-[12px] font-medium leading-none"
      role="region"
      aria-label={strip.text}
      dir="rtl"
      style={{
        backgroundColor: strip.bgColor ?? "#B63A6B",
        color: strip.textColor ?? "#ffffff",
      }}
    >
      {strip.text}
    </div>
  );

  if (strip.linkUrl) {
    return (
      <a href={strip.linkUrl} target="_blank" rel="noopener noreferrer" className="block">
        {content}
      </a>
    );
  }

  return content;
}
