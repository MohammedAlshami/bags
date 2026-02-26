"use client";

import Image from "next/image";
import Link from "next/link";

const CATEGORIES = [
  {
    image:
      "https://palo-alto-theme-main.myshopify.com/cdn/shop/files/E-COM-32_3000x_8d8a7154-5be4-489d-b2ed-5339f7378448.png?v=1749492735&width=360",
    label: "JUST ADDED",
    title: "New",
    subtitle: "Shop the latest",
    href: "/collections/new",
  },
  {
    image:
      "https://palo-alto-theme-main.myshopify.com/cdn/shop/files/E-COM-5-727_3000x_8554d774-d118-402d-839f-1d2eaa901c6e.jpg?v=1749491700&width=360",
    label: "LAYERS TO LOVE",
    title: "Fall/Winter",
    subtitle: "Bundle up in style",
    href: "/collections/fall-winter",
  },
  {
    image:
      "https://palo-alto-theme-main.myshopify.com/cdn/shop/files/E-COM-5-722_900x_aacec23d-20c7-4248-832f-442482b2ec59.jpg?v=1749492737&width=360",
    label: "SLEEK STYLES",
    title: "Dresses",
    subtitle: "For every occasion",
    href: "/collections/dresses",
  },
  {
    image:
      "https://palo-alto-theme-main.myshopify.com/cdn/shop/files/E-COM-5-73_3000x_3f281009-80ba-41d1-80a7-613341ea1457.jpg?v=1749491783&width=360",
    label: "MOST-WANTED",
    title: "Bestselling",
    subtitle: "Selling fast!",
    href: "/collections/bestsellers",
  },
];

export function ShopByCategorySection() {
  return (
    <section className="w-full px-4 py-12 md:py-16" aria-label="Shop by category">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <header className="text-center mb-8 md:mb-10">
          <p className="text-xs md:text-sm font-medium tracking-widest text-neutral-400 uppercase mb-2">
            THE ESSENTIALS
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-black">
            Shop by Category
          </h2>
        </header>

        {/* Four-column category grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.title}
              href={cat.href}
              className="group block rounded-lg overflow-hidden aspect-[3/4] min-h-[200px] relative"
            >
              <Image
                src={cat.image}
                alt=""
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5">
                <div className="bg-white/85 backdrop-blur-sm rounded px-3 py-2.5 md:px-4 md:py-3 inline-block max-w-full">
                  <p className="text-[10px] md:text-xs font-medium tracking-widest text-neutral-500 uppercase">
                    {cat.label}
                  </p>
                  <p className="text-lg md:text-xl font-bold text-black leading-tight">
                    {cat.title}
                  </p>
                  <p className="text-sm text-neutral-600">{cat.subtitle}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
