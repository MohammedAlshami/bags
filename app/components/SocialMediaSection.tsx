"use client";

import Image from "next/image";
import Link from "next/link";
import { Instagram, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SafeImage } from "@/app/components/SafeImage";

const serif = { fontFamily: "var(--font-cormorant), serif" };
const sans = { fontFamily: "var(--font-playpen-arabic), sans-serif" };

const WELL_BG = "#FCF0F2";

/** Video / poster for each of the four slots (only as many are shown as products from the DB). */
const VIDEO_SLOTS: { id: string; videoSrc: string; posterSrc: string }[] = [
  {
    id: "reel-0",
    videoSrc: "/social/queen-cream-whitening.mp4",
    posterSrc: "/social/queen-cream-whitening-thumb.jpg",
  },
  {
    id: "reel-1",
    videoSrc: "/social/queen-deep-mask.mp4",
    posterSrc: "/social/queen-deep-mask-thumb.jpg",
  },
  {
    id: "reel-2",
    videoSrc: "/social/queen-bridal-box.mp4",
    posterSrc: "/social/queen-bridal-box-thumb.jpg",
  },
  {
    id: "reel-3",
    videoSrc: "/social/queen-deep-mask.mp4",
    posterSrc: "/social/queen-deep-mask-thumb.jpg",
  },
];

export type SocialReelProduct = {
  slug: string;
  name: string;
  image: string;
  /** Formatted as on the product page: sizes, or dual currency from DB. */
  priceLine: string;
};

type SocialReelItem = {
  id: string;
  videoSrc: string;
  posterSrc: string;
  title: string;
  product: SocialReelProduct;
};

function zipReels(products: SocialReelProduct[]): SocialReelItem[] {
  const out: SocialReelItem[] = [];
  const n = Math.min(products.length, VIDEO_SLOTS.length);
  for (let i = 0; i < n; i++) {
    const slot = VIDEO_SLOTS[i]!;
    const product = products[i]!;
    out.push({
      id: slot.id,
      videoSrc: slot.videoSrc,
      posterSrc: slot.posterSrc,
      title: product.name,
      product,
    });
  }
  return out;
}

const SOCIAL_LINKS: { href: string; label: string; Icon: typeof Instagram }[] = [
  { href: "https://www.instagram.com/", label: "Instagram", Icon: Instagram },
];

function ReelProductCard({ product }: { product: SocialReelProduct }) {
  return (
    <Link
      href={`/product/${product.slug}`}
      className="mt-3.5 flex min-h-0 flex-1 items-center gap-3 rounded-2xl border border-neutral-200/90 bg-white p-3.5 transition-colors duration-200 hover:border-brand-primary/35"
      style={sans}
    >
      <div className="relative size-14 shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-[#faf4f6] to-[#f0e4e8] p-0.5 ring-2 ring-white">
        <div className="relative h-full w-full overflow-hidden rounded-full">
          <SafeImage
            src={product.image}
            alt=""
            fill
            className="object-cover"
            sizes="56px"
          />
        </div>
      </div>
      <div className="min-w-0 flex-1 self-center text-start">
        <p className="line-clamp-2 break-words text-[14px] font-semibold leading-snug text-neutral-900 sm:text-[15px]">
          {product.name}
        </p>
        <p className="mt-1.5 line-clamp-2 break-words text-[14px] font-semibold leading-snug text-brand-primary sm:text-[15px]">
          {product.priceLine}
        </p>
      </div>
    </Link>
  );
}

function ReelCard({ item, onOpen }: { item: SocialReelItem; onOpen: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hover, setHover] = useState(false);

  const handleEnter = () => {
    setHover(true);
    const el = videoRef.current;
    if (!el) return;
    void el["play"]().catch(() => {});
  };

  const handleLeave = () => {
    setHover(false);
    const v = videoRef.current;
    if (v) {
      v.pause();
      v.currentTime = 0;
    }
  };

  return (
    <article className="flex h-full min-h-0 flex-col items-stretch">
      <button
        type="button"
        onClick={onOpen}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        className="group relative w-full shrink-0 cursor-pointer overflow-hidden rounded-2xl ring-1 ring-black/5 transition-transform hover:scale-[1.01] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40 focus-visible:ring-offset-2"
        style={{ backgroundColor: WELL_BG }}
        aria-label={`تشغيل الفيديو: ${item.title}`}
      >
        <div className="relative aspect-[9/16] w-full min-w-0">
          <Image
            src={item.posterSrc}
            alt=""
            fill
            className={`object-cover transition-opacity duration-200 ${hover ? "opacity-0" : "opacity-100"}`}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
            priority={false}
          />
          <video
            ref={videoRef}
            src={item.videoSrc}
            muted
            playsInline
            preload="metadata"
            className={`pointer-events-none absolute inset-0 h-full w-full object-cover transition-opacity duration-200 ${hover ? "z-[1] opacity-100" : "z-0 opacity-0"}`}
            aria-hidden
          />
        </div>
      </button>
      <ReelProductCard product={item.product} />
    </article>
  );
}

export function SocialMediaSection({ products }: { products: SocialReelProduct[] }) {
  const reels = useMemo(() => zipReels(products), [products]);
  const [openId, setOpenId] = useState<string | null>(null);

  const open = openId ? reels.find((r) => r.id === openId) : null;

  const close = useCallback(() => {
    setOpenId(null);
  }, []);

  useEffect(() => {
    if (!openId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [openId, close]);

  return (
    <section className="w-full bg-white py-14 md:py-20" aria-labelledby="social-media-heading" dir="rtl">
      <div className="w-full px-1">
        <div className="mx-auto max-w-5xl text-center">
          <h2
            id="social-media-heading"
            className="text-2xl font-medium tracking-tight text-neutral-900 md:text-3xl"
            style={serif}
          >
            من منصاتنا
          </h2>
          <p className="mt-3 text-sm text-neutral-600 md:text-base" style={sans}>
            شاهدي المنتجات في فيديوهات قصيرة، وتابعينا للمزيد.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-6">
            {SOCIAL_LINKS.map(({ href, label, Icon }) => (
              <Link
                key={label}
                href={href}
                className="flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-5 py-2.5 text-sm text-neutral-700 transition-colors hover:border-neutral-300 hover:bg-neutral-50"
                style={sans}
                aria-label={label}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icon className="h-5 w-5 text-neutral-800" strokeWidth={1.5} />
                <span>{label}</span>
              </Link>
            ))}
          </div>
        </div>

        {reels.length > 0 ? (
          <div className="mx-auto mt-12 grid w-full max-w-6xl grid-cols-2 items-stretch gap-3 px-1 sm:gap-4 md:grid-cols-4">
            {reels.map((item) => (
              <ReelCard key={item.id} item={item} onOpen={() => setOpenId(item.id)} />
            ))}
          </div>
        ) : null}
      </div>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4 py-10 backdrop-blur-[2px] sm:px-6 sm:py-14 md:py-16"
          role="dialog"
          aria-modal="true"
          aria-label={open.title}
          onClick={close}
        >
          <button
            type="button"
            className="fixed right-4 top-4 z-[102] rounded-full bg-white/10 p-2.5 text-white transition-colors hover:bg-white/20 sm:right-6 sm:top-6"
            aria-label="إغلاق"
            onClick={(e) => {
              e.stopPropagation();
              close();
            }}
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={1.5} />
          </button>

          <div
            className="relative z-[101] w-full max-w-lg overflow-hidden rounded-2xl bg-black ring-1 ring-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-[9/16] w-full overflow-hidden rounded-2xl">
              <video
                key={open.id}
                className="h-full w-full object-contain"
                controls
                playsInline
                preload="metadata"
              >
                <source src={open.videoSrc} type="video/mp4" />
              </video>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
