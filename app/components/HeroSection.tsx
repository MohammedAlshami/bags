"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const brandName = { fontFamily: "var(--font-playpen-arabic), sans-serif" };

const HERO_SLIDES = [
  "https://images.unsplash.com/photo-1744371386847-ded3b4a66017?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1697840507245-e6ce44da4e4c?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1551061031-9e473ec479e2?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
] as const;

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
    setProgress(0);
    let start: number | null = null;
    let raf = 0;

    const tick = (now: number) => {
      if (start === null) start = now;
      const elapsed = now - start;
      const p = Math.min(1, elapsed / SLIDE_MS);
      setProgress(p);
      if (p >= 1) {
        setIndex((i) => (i + 1) % HERO_SLIDES.length);
        return;
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
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
        className="absolute right-6 top-1/2 z-20 flex -translate-y-1/2 flex-col items-center gap-5 md:right-10 md:gap-6"
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
                className={`flex size-11 shrink-0 items-center justify-center rounded-full p-0 leading-none touch-manipulation text-sm font-light tabular-nums transition-colors ${
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

      <div className="absolute inset-0 z-10 flex flex-col justify-end pb-16 md:pb-24 px-10 md:px-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <h1 className="text-5xl md:text-8xl text-white font-light leading-none" style={brandName}>
            الملكة جولد
          </h1>
          <div className="flex flex-col gap-4 max-w-xs">
            <p className="text-white/90 text-sm leading-relaxed text-start">
              صُنعت يدوياً في جنوب أفريقيا باستخدام أجود أنواع الجلود من مصادر أخلاقية. تحية للتراث والأناقة.
            </p>
            <Link
              href="#shop"
              className="text-white text-xs uppercase tracking-widest hover:underline text-start"
            >
              اكتشف المجموعة
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
