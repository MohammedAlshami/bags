import Image from "next/image";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import { HERO_SLIDE_URLS } from "@/lib/hero-images";
import { pagePaddingX, sans } from "@/lib/page-theme";

/** Same first slide as the landing hero — single source: `lib/hero-images` */
const SHOP_BANNER_SRC = HERO_SLIDE_URLS[0];

/**
 * Full-width image banner for `/shop` (design kit: Tajawal, white text, soft brand tint).
 */
export function ShopPageBanner() {
  return (
    <section
      className="relative w-full min-h-[min(44vh,440px)] overflow-hidden"
      aria-labelledby="shop-hero-heading"
    >
      <Image
        src={SHOP_BANNER_SRC}
        alt=""
        fill
        priority
        className="object-cover object-center"
        sizes="100vw"
      />
      {/* Readability + subtle kit pink at one corner (matches hero treatment spirit) */}
      <div
        className="absolute inset-0 z-[1] bg-gradient-to-t from-black/75 via-black/40 to-black/25"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_0%_0%,rgba(182,58,107,0.18),transparent_55%)]"
        aria-hidden
      />
      <div
        className="absolute inset-0 z-[1] opacity-[0.1] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
        aria-hidden
      />

      <div
        className={`relative z-10 mx-auto flex min-h-[min(44vh,440px)] max-w-[1920px] flex-col items-stretch justify-end ${pagePaddingX} pb-10 pt-6 md:pb-14 md:pt-8`}
        dir="rtl"
        style={sans}
      >
        <Breadcrumbs
          variant="light"
          items={[{ label: "الرئيسية", href: "/" }, { label: "المتجر" }]}
        />
        <h1
          id="shop-hero-heading"
          className="mt-1 text-balance text-2xl font-bold leading-tight text-white drop-shadow-sm md:text-[26px] md:leading-snug"
        >
          المنتجات
        </h1>
        <p className="mt-3 max-w-2xl text-pretty text-right text-[15px] font-normal leading-relaxed text-white/90 md:text-base">
          اكتشِفي مختاراتنا للعناية والتجميل، بمعايير واضحة وتركيبات تدعم إشراقتك وروتينك بثقة.
        </p>
        <p
          className="pointer-events-none mt-8 text-end text-[11px] font-semibold uppercase tracking-[0.2em] text-white/60 md:mt-10"
          aria-hidden
        >
          عناية طبيعية
        </p>
      </div>
    </section>
  );
}
