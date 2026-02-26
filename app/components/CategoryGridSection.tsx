"use client";

import Image from "next/image";
import Link from "next/link";

const CARDS = [
  {
    image:
      "https://sleek-theme-demo.myshopify.com/cdn/shop/files/card-1.webp?v=1718377452&width=1100",
    title: "News, tips, reviews",
    cta: "View Our Blog",
    href: "/blog",
    bgClass: "bg-[#faf8f5]",
    contentBg: "#E9E7E6",
  },
  {
    image:
      "https://sleek-theme-demo.myshopify.com/cdn/shop/files/image-card-5-min.jpg?v=1716549804&width=1100",
    title: "Stores near you",
    cta: "Find A Store",
    href: "/stores",
    bgClass: "bg-[#e8dfd4]",
    contentBg: "#CDB89D",
  },
  {
    image:
      "https://sleek-theme-demo.myshopify.com/cdn/shop/files/img-card2.webp?v=1717751463&width=1100",
    title: "On the gram",
    cta: "@Glossy_store",
    href: "https://instagram.com",
    bgClass: "bg-[#f5eae8]",
    contentBg: "#E2C8C1",
  },
];

export function CategoryGridSection() {
  return (
    <section className="w-full px-4 py-12 md:py-16" aria-label="Explore">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <header className="text-center mb-10 md:mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-black leading-tight max-w-2xl mx-auto">
            Spring styles to wear together or apart, whatever the weather.
          </h2>
          <Link
            href="/about"
            className="inline-block mt-4 text-sm md:text-base text-black/80 underline underline-offset-2 hover:text-black transition-colors"
          >
            About Us
          </Link>
        </header>

        {/* Three-column cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
          {CARDS.map((card) => (
            <article
              key={card.title}
              className={`${card.bgClass} rounded-2xl overflow-hidden flex flex-col`}
            >
              <div className="relative aspect-[4/5] min-h-[200px] flex-shrink-0">
                <Image
                  src={card.image}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 33vw"
                />
              </div>
              <div
                className="p-5 md:p-6 flex flex-col items-center text-center flex-1"
                style={{ backgroundColor: card.contentBg }}
              >
                <h3 className="text-lg md:text-xl font-bold text-black mb-4">
                  {card.title}
                </h3>
                <Link
                  href={card.href}
                  target={card.href.startsWith("http") ? "_blank" : undefined}
                  rel={card.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-black text-white text-sm font-medium hover:bg-black/90 transition-colors w-fit"
                >
                  {card.cta}
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
