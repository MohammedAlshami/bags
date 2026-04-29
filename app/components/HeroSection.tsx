"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { HERO_SLIDE_URLS } from "@/lib/hero-images";
import { sans } from "@/lib/page-theme";

const brandName = { ...sans };

const HERO_SLIDES = HERO_SLIDE_URLS;

const SLIDE_MS = 6000;

/** Thin quarter-arc above the active index; stroke reveals with `progress` 0→1 */
function SlideArc({ progress }: { progress: number }) {
  const d = "M 3 14 A 9 9 0 0 1 21 14";
  return (
    <svg
      className="text-white"
      width={24}
      height={18}
      viewBox="0 0 24 18"
      aria-hidden
    >
      <path
        d={d}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.25}
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - progress}
      />
    </svg>
  );
}

export function HeroSection() {
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const interval = window.setInterval(() => {
      const elapsed = Date.now() - start;
      const p = Math.min(1, elapsed / SLIDE_MS);
      setProgress(p);
    }, 32);
    const slideTimer = window.setTimeout(() => {
      setIndex((i) => (i + 1) % HERO_SLIDES.length);
    }, SLIDE_MS);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(slideTimer);
    };
  }, [index]);

  const goTo = (i: number) => {
    setIndex(i);
  };

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {HERO_SLIDES.map((src, i) => (
        <div
          key={src}
          className={`absolute inset-0 transition-opacity duration-[700ms] ease-out ${
            i === index ? "z-0 opacity-100" : "z-0 opacity-0"
          }`}
        >
          <Image
            src={src}
            alt=""
            fill
            priority={i === 0}
            sizes="100vw"
            className="object-cover"
            aria-hidden
          />
        </div>
      ))}

      <div
        className="pointer-events-none absolute inset-0 z-[1] opacity-[0.12] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
        aria-hidden
      />

      <nav
        className="absolute end-6 top-1/2 z-20 flex -translate-y-1/2 flex-col items-center gap-5 md:end-10 md:gap-6"
        aria-label="شرائح العرض"
      >
        {HERO_SLIDES.map((_, i) => {
          const active = i === index;
          return (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <div className="flex h-[18px] w-6 items-end justify-center text-white">
                {active ? <SlideArc progress={progress} /> : <span className="h-[18px] w-6" aria-hidden />}
              </div>
              <button
                type="button"
                onClick={() => goTo(i)}
                className={`flex aspect-square w-11 flex-none touch-manipulation items-center justify-center rounded-full p-0 text-sm font-light leading-none tabular-nums transition-colors ${
                  active ? "text-white" : "text-white/55 hover:text-white/90"
                }`}
                aria-label={`الشريحة ${i + 1}`}
                aria-current={active ? "true" : undefined}
              >
                {i + 1}
              </button>
            </div>
          );
        })}
      </nav>

      <div className="absolute inset-0 z-10 flex flex-col justify-end px-6 pb-14 md:px-16 md:pb-20 lg:px-20">
        <div className="flex flex-col justify-end gap-8 md:flex-row md:items-end">
          <h1
            className="text-3xl font-bold leading-tight text-white drop-shadow-sm md:text-4xl"
            style={brandName}
          >
            الملكة جولد
          </h1>
          <div className="max-w-sm flex flex-col gap-4">
            <p
              className="text-right text-[13px] font-normal leading-relaxed text-white/90"
              style={sans}
            >
              صُنعت بعناية من مكوّنات مختارة لدعم بشرتك يومياً. تركيبات لطيفة، نتائج واضحة، وعناية تليق
              بروتينك.
            </p>
            <div className="text-start">
              <Link
                href="#shop"
                className="qgb-btn-primary inline-flex min-w-[8rem] shadow-sm shadow-black/20"
                style={sans}
              >
                اكتشف المجموعة
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
