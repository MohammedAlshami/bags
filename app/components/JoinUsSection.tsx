"use client";

import Image from "next/image";

const IMAGES = [
  "https://release-serenity.myshopify.com/cdn/shop/files/Misela_SS_190201_1.jpg?v=1713170899&width=1280",
  "https://release-serenity.myshopify.com/cdn/shop/files/Emilia_Collection_Banner_1.jpg?v=1713174367&width=1280",
  "https://release-serenity.myshopify.com/cdn/shop/files/Misela_SS_190099.jpg?v=1713169991&width=1280",
  "https://release-serenity.myshopify.com/cdn/shop/files/MISELA_01_0494.jpg?v=1713169990&width=1280",
];

export function JoinUsSection() {
  return (
    <section className="w-full bg-white px-4 py-12 md:py-16" aria-label="Join us">
      <div className="mx-auto max-w-6xl">
        <header className="text-center mb-8 md:mb-10">
          <p className="text-xs md:text-sm font-medium tracking-widest text-black uppercase mb-2">
            FOLLOW US FOR MORE
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-black">
            Join us
          </h2>
        </header>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {IMAGES.map((src, i) => (
            <div
              key={i}
              className="relative aspect-[3/4] min-h-[180px] rounded-lg overflow-hidden bg-neutral-100"
            >
              <Image
                src={src}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
