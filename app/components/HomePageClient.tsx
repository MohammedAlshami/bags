"use client";

import { useEffect, useState } from "react";
import { HeroSection } from "./HeroSection";
import { FeaturedProductsClient } from "./FeaturedProductsClient";
import { SocialMediaSection } from "./SocialMediaSection";
import { StoreLocationsSection } from "./StoreLocationsSection";
import type { FeaturedProductItem } from "./FeaturedProductsClient";

type HomeBg = "white" | "pink";
type HomeVisibility = {
  banner: boolean;
  hero: boolean;
  featured: boolean;
  social: boolean;
  locations: boolean;
};

const DEFAULT_VISIBILITY: HomeVisibility = {
  banner: true,
  hero: true,
  featured: true,
  social: true,
  locations: true,
};

function parseVisibility(value: unknown): HomeVisibility {
  if (!value || typeof value !== "object") return DEFAULT_VISIBILITY;
  const v = value as Partial<HomeVisibility>;
  return {
    banner: v.banner ?? true,
    hero: v.hero ?? true,
    featured: v.featured ?? true,
    social: v.social ?? true,
    locations: v.locations ?? true,
  };
}

export function HomePageClient({ featuredProducts }: { featuredProducts: FeaturedProductItem[] }) {
  const [bg, setBg] = useState<HomeBg>("white");
  const [visibility, setVisibility] = useState<HomeVisibility>(DEFAULT_VISIBILITY);

  useEffect(() => {
    const sync = () => {
      setBg((document.body.dataset.homeBg as HomeBg | undefined) ?? "white");
      try {
        setVisibility(parseVisibility(JSON.parse(document.body.dataset.homeVisibility ?? "{}")));
      } catch {
        setVisibility(DEFAULT_VISIBILITY);
      }
    };
    sync();
    window.addEventListener("home-settings-change", sync as EventListener);
    return () => window.removeEventListener("home-settings-change", sync as EventListener);
  }, []);

  return (
    <main className="min-h-screen overflow-x-hidden" style={{ backgroundColor: bg === "pink" ? "#FAEFF6" : "#ffffff" }}>
      {visibility.banner ? (
        <>
          <style>{`
            .premium-banner {
              background: linear-gradient(90deg, #fff5f7 0%, #ffe4eb 50%, #fff5f7 100%);
              border-top: 1px solid rgba(212, 76, 125, 0.1);
              border-bottom: 1px solid rgba(212, 76, 125, 0.1);
              position: relative;
              overflow: hidden;
            }
            .premium-banner::after {
              content: "";
              position: absolute;
              top: 0;
              left: -100%;
              width: 50%;
              height: 100%;
              background: linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent);
              animation: shine 4s infinite;
            }
            @keyframes shine {
              to { left: 200%; }
            }
          `}</style>
          <div className="premium-banner w-full py-2 shadow-sm">
            <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
              <p className="flex items-center justify-center gap-3 text-sm font-bold text-pink-800 md:text-base">
                <span className="h-1 w-1 rounded-full bg-pink-400" />
                منتجات الملكة جولد للعناية فرع اليمن
                <span className="h-1 w-1 rounded-full bg-pink-400" />
              </p>
            </div>
          </div>
        </>
      ) : null}
      {visibility.hero ? <HeroSection /> : null}
      {visibility.featured ? <FeaturedProductsClient products={featuredProducts} /> : null}
      {visibility.locations ? <StoreLocationsSection /> : null}
      {visibility.social ? <SocialMediaSection /> : null}
    </main>
  );
}
