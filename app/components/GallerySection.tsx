"use client";

import Image from "next/image";

const IMAGES = [
  "https://release-serenity.myshopify.com/cdn/shop/files/MISELA0444.jpg?v=1713169993&width=1280",
  "https://release-serenity.myshopify.com/cdn/shop/files/M_12991.jpg?v=1713178385&width=1280",
  "https://release-serenity.myshopify.com/cdn/shop/files/MISELA_04_0920.jpg?v=1713169993&width=1280",
];

export function GallerySection() {
  return (
    <section className="w-full bg-white px-4 py-12 md:py-16" aria-label="Gallery">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
          {IMAGES.map((src, i) => (
            <div
              key={i}
              className="relative aspect-[3/4] min-h-[220px] rounded-lg overflow-hidden bg-neutral-100"
            >
              <Image
                src={src}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 33vw"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
