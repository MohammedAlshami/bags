"use client";

import Image from "next/image";
import Link from "next/link";

const IMAGE_URL =
  "https://sleek-theme-demo.myshopify.com/cdn/shop/files/image-with-text-min.jpg?v=1716467914&width=1000";

const serif = { fontFamily: "var(--font-cormorant), serif" };

export function ImageWithTextSection() {
  return (
    <section className="w-full px-4 py-12 md:py-16">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-2xl md:rounded-3xl bg-[#f5f0eb] shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 min-h-[320px] md:min-h-[420px]">
          {/* Left: content */}
          <div className="flex flex-col justify-center p-8 md:p-12 lg:p-16 order-2 md:order-1">
            <span className="text-xs md:text-sm uppercase tracking-widest text-black/60 mb-2">
              Gentle And Safe
            </span>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-black/90 leading-tight mb-4 max-w-sm">
              Made for
              <br />
              sensitive skin
            </h2>
            <p className="text-sm md:text-base text-black/60 leading-relaxed mb-6 max-w-md">
              We create safe products that really work and are designed to make you feel good.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center justify-center w-fit px-6 py-3 rounded-lg bg-black text-white text-sm font-medium hover:bg-black/90 transition-colors"
            >
              Shop Now
            </Link>
          </div>

          {/* Right: image with overlay */}
          <div className="relative aspect-[4/5] md:aspect-auto md:min-h-[420px] order-1 md:order-2">
            <Image
              src={IMAGE_URL}
              alt="Woman applying skincare"
              fill
              className="object-cover object-center"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority={false}
            />
            <span
              className="absolute left-2 top-4 md:left-4 md:top-8 text-4xl md:text-5xl lg:text-6xl font-medium text-white tracking-tight opacity-95"
              style={serif}
              aria-hidden
            >
              glossy
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
