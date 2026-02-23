"use client";

import { useRef } from "react";
import Image from "next/image";

const ITEM_IMAGES = [
  "/Item pictures/2nd_Green_Bag-removebg-preview.png",
  "/Item pictures/basket_bag-removebg-preview.png",
  "/Item pictures/Black_bag-removebg-preview.png",
  "/Item pictures/Blue_bag-removebg-preview.png",
  "/Item pictures/orange_bag-removebg-preview.png",
  "/Item pictures/snake_skin_bag-removebg-preview.png",
];

const CAROUSEL_DATA = [
  {
    title: "Winter Edit",
    category: "Collection",
    year: "2025",
    desc: "A study in monochromatic layering and architectural silhouettes.",
  },
  {
    title: "Maison",
    category: "Essentials",
    year: "2025",
    desc: "Foundational pieces crafted for the modern global citizen.",
  },
  {
    title: "Soirée",
    category: "Limited",
    year: "2025",
    desc: "Evening wear redefined through precise tailoring.",
  },
  {
    title: "Object",
    category: "Accessories",
    year: "2024",
    desc: "Sculptural hardware and leather goods for daily elevation.",
  },
  {
    title: "Archive",
    category: "Heritage",
    year: "2024",
    desc: "A retrospective of the silhouettes that defined our house.",
  },
  {
    title: "Nordic",
    category: "Seasonal",
    year: "2025",
    desc: "Inspired by the raw textures of Northern landscapes.",
  },
];

const serif = { fontFamily: "var(--font-cormorant), serif" };

export function CarouselSection() {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <section className="relative mx-10 overflow-hidden bg-white py-4 md:mx-20" aria-label="Collections carousel">
      <div className="mb-6 px-0">
        <p className="text-[10px] uppercase tracking-[0.35em] text-neutral-500">Collections</p>
        <h2 className="mt-2 text-3xl font-light text-neutral-900 md:text-4xl" style={serif}>
          Fall colors
        </h2>
      </div>

      <div className="pointer-events-none absolute inset-y-0 left-0 z-20 flex items-center">
        <button
          type="button"
          onClick={() =>
            scrollRef.current?.scrollBy({
              left: -(scrollRef.current?.clientWidth ?? 320),
              behavior: "smooth",
            })
          }
          className="pointer-events-auto flex items-center justify-center p-3 text-neutral-400 transition-all duration-300 hover:scale-110 hover:text-black"
          aria-label="Scroll carousel left"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
          >
            <path d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>
      <div className="pointer-events-none absolute inset-y-0 right-0 z-20 flex items-center">
        <button
          type="button"
          onClick={() =>
            scrollRef.current?.scrollBy({
              left: scrollRef.current?.clientWidth ?? 320,
              behavior: "smooth",
            })
          }
          className="pointer-events-auto flex items-center justify-center p-3 text-neutral-400 transition-all duration-300 hover:scale-110 hover:text-black"
          aria-label="Scroll carousel right"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
          >
            <path d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div
        ref={scrollRef}
        className="hide-scrollbar flex gap-4 overflow-x-auto px-0 pb-2 snap-x snap-mandatory"
      >
        {CAROUSEL_DATA.map((item, i) => (
          <div
            key={item.title}
            className="group relative min-w-[calc((100%-3rem)/4)] shrink-0 cursor-pointer overflow-hidden rounded-sm snap-start"
          >
            <div className="relative flex aspect-square items-center justify-center overflow-hidden bg-neutral-50 transition-all duration-300 ease-out group-hover:shadow-md">
              <div className="relative h-full w-full flex items-center justify-center">
                <div className="relative w-[70%] aspect-square transition-transform duration-300 ease-out group-hover:scale-[1.04]">
                  <Image
                    src={ITEM_IMAGES[i % ITEM_IMAGES.length]}
                    alt={item.title}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 40vw, 20vw"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
