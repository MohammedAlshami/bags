"use client";

import Link from "next/link";

const serif = { fontFamily: "var(--font-cormorant), serif" };

export function HeroSection() {
  return (
    <section className="relative h-screen w-full overflow-hidden">
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
        aria-hidden
      >
        <source src="/8798403-uhd_4096_2160_25fps.mp4" type="video/mp4" />
      </video>
      <div
        className="pointer-events-none absolute inset-0 z-[1] opacity-[0.12] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
        aria-hidden
      />
      <div className="absolute inset-0 z-10 flex flex-col justify-end pb-16 md:pb-24 px-10 md:px-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <h1 className="text-5xl md:text-8xl text-white font-light leading-none" style={serif}>
            Carol Bouwer
          </h1>
          <div className="flex flex-col gap-4 max-w-xs">
            <p className="text-white/90 text-sm leading-relaxed">
              Handcrafted in South Africa using the finest ethically sourced leathers. A tribute to heritage and style.
            </p>
            <Link href="#shop" className="text-white text-xs uppercase tracking-widest hover:underline">
              Discover the collection →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
