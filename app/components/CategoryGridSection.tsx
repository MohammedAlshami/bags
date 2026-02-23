"use client";

import Link from "next/link";
import Image from "next/image";

const CATEGORIES = [
  { image: "/grainy-pic.png", title: "HANDBAGS" },
  { image: "/grainy-pic-3.png", title: "ACCESSORIES" },
  { image: "/grainny-pic-2.jfif", title: "COLLECTIONS" },
];

export function CategoryGridSection() {
  return (
    <section
      className="mx-10 bg-white pt-4 md:mx-20 md:pt-6"
      aria-label="Shop by category"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.title}
            href="#shop"
            className="group block"
          >
            <div className="relative aspect-square overflow-hidden">
              <Image
                src={cat.image}
                alt={cat.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                sizes="(max-width: 640px) 100vw, 33vw"
                unoptimized={cat.image.endsWith(".jfif")}
              />
              <div
                className="absolute inset-2 border-4 pointer-events-none"
                style={{ borderColor: "#facc15" }}
                aria-hidden
              />
              <div
                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-4 pt-12"
                aria-hidden
              >
                <span
                  className="text-lg font-bold uppercase tracking-wide drop-shadow-md md:text-xl"
                  style={{ color: "#facc15" }}
                >
                  {cat.title}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
