"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { sans } from "@/lib/page-theme";
import type { HeroImage } from "@/lib/hero-images-api";

const brandName = { ...sans };

const SLIDE_MS = 6000;

export function HeroSection() {
  const [slides, setSlides] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setLoading(true);
    fetch("/api/admin/hero-images")
      .then((r) => r.json() as Promise<HeroImage[]>)
      .then((data) => {
        const urls = data.map((img) => img.imageUrl);
        setSlides(urls);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (slides.length === 0) return;
    const slideTimer = window.setTimeout(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, SLIDE_MS);

    return () => {
      window.clearTimeout(slideTimer);
    };
  }, [index, slides.length]);

  const goTo = (i: number) => {
    setIndex(i);
  };

  if (loading) {
    return (
      <section className="relative h-screen w-full overflow-hidden bg-neutral-200" aria-hidden>
        <div className="h-full w-full animate-pulse bg-neutral-300" />
      </section>
    );
  }

  if (slides.length === 0) return null;

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {slides.map((src, i) => (
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
        className="absolute end-5 top-1/2 z-20 flex -translate-y-1/2 flex-col items-center gap-3 md:end-8"
        aria-label="شرائح العرض"
      >
        {slides.map((_, i) => {
          const active = i === index;
          return (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              className={`rounded-full transition-all ${
                active
                  ? "size-2.5 bg-white"
                  : "size-2 bg-white/50 hover:bg-white/80"
              }`}
              aria-label={`الشريحة ${i + 1}`}
              aria-current={active ? "true" : undefined}
            />
          );
        })}
      </nav>

      <div className="absolute inset-0 z-10 flex flex-col justify-end px-6 pb-14 md:px-16 md:pb-20 lg:px-20">
          <div className="flex w-full flex-col justify-end gap-8 md:flex-row md:items-end md:justify-between">
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
