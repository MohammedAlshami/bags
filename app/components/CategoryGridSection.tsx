"use client";

import Link from "next/link";
import Image from "next/image";

const CATEGORIES = [
  {
    image: "/grainy-pic.png",
    title: "HANDBAGS",
    label: "Handcrafted leather",
  },
  {
    image: "/grainy-pic-3.png",
    title: "ACCESSORIES",
    label: "Carol Bouwer accessories",
  },
  {
    image: "/grainny-pic-2.jfif",
    title: "COLLECTIONS",
    label: "Curated pieces",
  },
];

export function CategoryGridSection() {
  return (
    <section
      className="mx-10 bg-white py-12 md:mx-20 md:py-16"
      aria-label="Shop by category"
    >
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.title}
            href="#shop"
            className="group block"
          >
            <div className="relative aspect-square bg-white p-3">
              <div className="relative h-full w-full border-2 border-white overflow-hidden">
                <Image
                  src={cat.image}
                  alt={cat.label}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  sizes="(max-width: 640px) 100vw, 33vw"
                  unoptimized={cat.image.endsWith(".jfif")}
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
            </div>
            <p className="mt-3 text-center text-sm font-medium text-neutral-800 md:text-base">
              {cat.label}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
