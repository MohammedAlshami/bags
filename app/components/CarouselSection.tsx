"use client";

import { useRef } from "react";
import Image from "next/image";

const CARD_IMAGE =
  "https://behno.com/cdn/shop/files/DANNY_FLATIRON_BAG_NAPPA_BLACK_GRAY_BACKGROUND_FRONT_RESIZE.jpg?v=1760099680";

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

export function CarouselSection() {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <section className="relative mx-10 overflow-hidden bg-white py-4 md:mx-20" aria-label="Collections carousel">
      <div className="mb-1 px-0">
        <h3 className="text-[10px] font-semibold uppercase tracking-widest text-neutral-900">
          Fall Colors.
        </h3>
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
        {CAROUSEL_DATA.map((item) => (
          <div
            key={item.title}
            className="group relative min-w-[calc((100%-3rem)/4)] shrink-0 cursor-pointer overflow-hidden snap-start"
          >
            <div className="relative flex aspect-square items-center justify-center overflow-hidden bg-white transition-all duration-700">
              <Image
                src={CARD_IMAGE}
                alt={item.title}
                width={480}
                height={480}
                className="h-auto w-[94%] object-contain transition-all duration-1000 group-hover:-translate-y-14 group-hover:scale-90 group-hover:opacity-10 group-hover:blur-[1px] [filter:contrast(1.35)_brightness(1.12)]"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center translate-y-8 opacity-0 transition-all duration-700 ease-out group-hover:translate-y-0 group-hover:opacity-100">
                <span className="mb-1 text-[7px] uppercase tracking-[0.4em] text-neutral-400">
                  {item.category}
                </span>
                <h4 className="font-serif text-3xl italic leading-none tracking-tighter text-neutral-900 mb-2">
                  {item.title}
                </h4>
                <p className="max-w-[190px] font-light leading-tight text-neutral-500 text-[9px]">
                  {item.desc}
                </p>
                <div className="mt-4 h-[1px] w-6 bg-neutral-900 scale-x-0 transition-transform duration-700 group-hover:scale-x-100" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
