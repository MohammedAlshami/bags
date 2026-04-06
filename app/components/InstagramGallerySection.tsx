"use client";

import Image from "next/image";
import Link from "next/link";
import { Instagram } from "lucide-react";

const serif = { fontFamily: "var(--font-cormorant), serif" };
const sans = { fontFamily: "var(--font-playpen-arabic), sans-serif" };

/** Profile link for the pill CTA. */
const INSTAGRAM_PROFILE_URL = "https://www.instagram.com/";

/** Saved under public/instagram-grid/ (see npm run fetch:instagram-grid). Each tile opens its post. */
const GRID_ITEMS: { image: string; postUrl: string }[] = [
  { image: "/instagram-grid/post-01.jpg", postUrl: "https://www.instagram.com/p/DWt2ucQjbiM/" },
  { image: "/instagram-grid/post-02.jpg", postUrl: "https://www.instagram.com/p/DWW2OqhjRfd/" },
  { image: "/instagram-grid/post-03.jpg", postUrl: "https://www.instagram.com/p/DWRZOVyjXYu/" },
  { image: "/instagram-grid/post-04.jpg", postUrl: "https://www.instagram.com/p/DV9FOGqjSCq/" },
  { image: "/instagram-grid/post-05.jpg", postUrl: "https://www.instagram.com/p/DV9FKEejZ8b/" },
  { image: "/instagram-grid/post-06.jpg", postUrl: "https://www.instagram.com/p/DV6gcs-jQqC/" },
  { image: "/instagram-grid/post-07.jpg", postUrl: "https://www.instagram.com/p/DV6gYAIjZUO/" },
  { image: "/instagram-grid/post-08.jpg", postUrl: "https://www.instagram.com/p/DV6gRfajTWT/" },
  { image: "/instagram-grid/post-09.jpg", postUrl: "https://www.instagram.com/p/DV4aRv9DROQ/" },
  { image: "/instagram-grid/post-10.jpg", postUrl: "https://www.instagram.com/p/DV4Zr9fDdup/" },
];

/** Instagram grid (كما ظهرنا على إنستغرام). Not used on the home page right now — import where needed later. */
export function InstagramGallerySection() {
  return (
    <section className="w-full bg-white py-16 md:py-24" aria-labelledby="instagram-gallery-heading" dir="rtl">
      <div className="w-full px-2 sm:px-2.5">
        <div className="w-full text-center">
          <h2 id="instagram-gallery-heading" className="text-lg text-neutral-700 md:text-xl" style={sans}>
            <span>كما ظهرنا على </span>
            <span className="italic text-neutral-900" style={serif}>
              إنستغرام
            </span>
            <span className="text-neutral-400">.</span>
          </h2>

          <Link
            href={INSTAGRAM_PROFILE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-6 py-2.5 text-sm text-neutral-800 transition-colors hover:border-neutral-400 hover:bg-neutral-50"
            style={sans}
          >
            <Instagram className="h-4 w-4" strokeWidth={1.5} />
            <span>تابعنا</span>
          </Link>
        </div>

        <div className="mt-10 grid w-full grid-cols-2 gap-2 sm:mt-12 sm:gap-2.5 md:grid-cols-5 md:gap-2.5">
          {GRID_ITEMS.map((item, index) => (
            <Link
              key={`${item.image}-${index}`}
              href={item.postUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Go to Instagram"
              className="group relative aspect-square w-full overflow-hidden rounded-lg bg-neutral-100"
            >
              <Image
                src={item.image}
                alt=""
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                sizes="(max-width: 768px) 50vw, 20vw"
              />
              <span
                className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-300 group-hover:bg-black/45"
                aria-hidden
              />
              <span className="absolute inset-0 flex items-center justify-center p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <span className="text-center text-sm font-medium tracking-wide text-white underline underline-offset-4">
                  Go to Instagram
                </span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
