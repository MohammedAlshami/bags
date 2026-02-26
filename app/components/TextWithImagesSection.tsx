"use client";

import Image from "next/image";

const IMAGES = [
  {
    src: "https://sleek-theme-demo.myshopify.com/cdn/shop/files/text-with-image-1-min.jpg?v=1716540657&width=300",
    alt: "Woman with skincare",
  },
  {
    src: "https://sleek-theme-demo.myshopify.com/cdn/shop/files/text-with-image-2-min.jpg?v=1716540657&width=300",
    alt: "Skincare dropper bottle",
  },
  {
    src: "https://sleek-theme-demo.myshopify.com/cdn/shop/files/text-with-image-3-min.jpg?v=1716540657&width=300",
    alt: "Skincare application",
  },
];

function PillImage({ src, alt }: { src: string; alt: string }) {
  return (
    <span className="relative inline-block h-9 w-24 md:h-11 md:w-28 shrink-0 align-middle overflow-hidden rounded-full">
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        sizes="112px"
      />
    </span>
  );
}

export function TextWithImagesSection() {
  return (
    <section className="w-full bg-white py-16 md:py-24">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <div className="text-lg md:text-xl text-black font-medium leading-relaxed flex flex-col items-center gap-y-1">
          <span className="inline-flex flex-wrap items-center justify-center gap-x-2">
            Make you look
            <PillImage src={IMAGES[0].src} alt={IMAGES[0].alt} />
            and
          </span>
          <span className="inline-flex flex-wrap items-center justify-center gap-x-2">
            feel glowy
            <PillImage src={IMAGES[1].src} alt={IMAGES[1].alt} />
            and healthy
            <PillImage src={IMAGES[2].src} alt={IMAGES[2].alt} />
          </span>
        </div>
      </div>
    </section>
  );
}
