"use client";

import Image from "next/image";
import Link from "next/link";
import { Instagram, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

const serif = { fontFamily: "var(--font-cormorant), serif" };
const sans = { fontFamily: "var(--font-playpen-arabic), sans-serif" };

const WELL_BG = "#FCF0F2";

const REELS: {
  id: string;
  title: string;
  videoSrc: string;
  posterSrc: string;
}[] = [
  {
    id: "cream",
    title: "كريم الملكة للتبييض والنضارة",
    videoSrc: "/social/queen-cream-whitening.mp4",
    posterSrc: "/social/queen-cream-whitening-thumb.jpg",
  },
  {
    id: "mask",
    title: "ماسك الملكة البديل",
    videoSrc: "/social/queen-deep-mask.mp4",
    posterSrc: "/social/queen-deep-mask-thumb.jpg",
  },
  {
    id: "bridal-box",
    title: "بوكس العروس من منتجات الملكة",
    videoSrc: "/social/queen-bridal-box.mp4",
    posterSrc: "/social/queen-bridal-box-thumb.jpg",
  },
  {
    id: "cream-2",
    title: "كريم الملكة للتبييض والنضارة",
    videoSrc: "/social/queen-cream-whitening.mp4",
    posterSrc: "/social/queen-cream-whitening-thumb.jpg",
  },
  {
    id: "mask-2",
    title: "ماسك الملكة البديل",
    videoSrc: "/social/queen-deep-mask.mp4",
    posterSrc: "/social/queen-deep-mask-thumb.jpg",
  },
];

const SOCIAL_LINKS: { href: string; label: string; Icon: typeof Instagram }[] = [
  { href: "https://www.instagram.com/", label: "Instagram", Icon: Instagram },
];

type ReelItem = (typeof REELS)[number];

function ReelCard({ item, onOpen }: { item: ReelItem; onOpen: () => void }) {
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
    <article className="flex min-w-0 flex-col items-center">
      <button
        type="button"
        onClick={onOpen}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        className="group relative w-full overflow-hidden rounded-2xl shadow-sm ring-1 ring-black/5 transition-transform hover:scale-[1.01] focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2"
        style={{ backgroundColor: WELL_BG }}
        aria-label={`تشغيل الفيديو: ${item.title}`}
      >
        <div className="relative aspect-[9/16] w-full min-w-0">
          <Image
            src={item.posterSrc}
            alt=""
            fill
            className={`object-cover transition-opacity duration-200 ${hover ? "opacity-0" : "opacity-100"}`}
            sizes="(max-width: 640px) 98vw, (max-width: 768px) 49vw, (max-width: 1024px) 32vw, 19vw"
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
      <h3 className="mt-3 w-full text-center text-sm font-semibold text-neutral-900 sm:text-base md:text-lg" style={sans}>
        {item.title}
      </h3>
    </article>
  );
}

export function SocialMediaSection() {
  const [openId, setOpenId] = useState<string | null>(null);

  const open = openId ? REELS.find((r) => r.id === openId) : null;

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
        </div>

        <div className="mx-auto mt-12 grid w-full grid-cols-1 gap-1 sm:grid-cols-2 sm:gap-1 md:grid-cols-3 md:gap-1 lg:grid-cols-5 lg:gap-1">
          {REELS.map((item) => (
            <ReelCard key={item.id} item={item} onOpen={() => setOpenId(item.id)} />
          ))}
        </div>

        <div className="mx-auto mt-14 max-w-2xl border-t border-neutral-200/80 pt-10 text-center">
          <p className="text-sm font-medium text-neutral-800" style={sans}>
            تابعينا
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
            className="relative z-[101] w-full max-w-lg overflow-hidden rounded-2xl bg-black shadow-2xl ring-1 ring-white/10"
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
