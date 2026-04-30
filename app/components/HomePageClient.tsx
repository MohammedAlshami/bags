"use client";

import { useEffect, useState } from "react";
import { OffersBanner } from "./OffersBanner";
import { HeroSection } from "./HeroSection";
import { QGB } from "@/lib/brand-kit";
import { HomeCategoryProductSections } from "./HomeCategoryProductSections";
import { SocialMediaSection } from "./SocialMediaSection";
import { StoreLocationsSection } from "./StoreLocationsSection";
import { HomeReviewsSection } from "./HomeReviewsSection";
import { HomeFaqSection } from "./HomeFaqSection";
import type { HomeCategorySectionData } from "./HomeCategoryProductSections";
import type { SocialReelProduct } from "./SocialMediaSection";
import type { ReviewProductRef } from "./HomeReviewsSection";

type HomeBg = "white" | "pink";
type HomeVisibility = {
  hero: boolean;
  featured: boolean;
  social: boolean;
  locations: boolean;
  reviews: boolean;
  faq: boolean;
};

const DEFAULT_VISIBILITY: HomeVisibility = {
  hero: true,
  featured: true,
  social: true,
  locations: true,
  reviews: true,
  faq: true,
};

function parseVisibility(value: unknown): HomeVisibility {
  if (!value || typeof value !== "object") return DEFAULT_VISIBILITY;
  const v = value as Partial<HomeVisibility>;
  return {
    hero: v.hero ?? true,
    featured: v.featured ?? true,
    social: v.social ?? true,
    locations: v.locations ?? true,
    reviews: v.reviews ?? true,
    faq: v.faq ?? true,
  };
}

export function HomePageClient({
  categorySections,
  socialReelProducts,
  reviewProducts,
}: {
  categorySections: HomeCategorySectionData[];
  socialReelProducts: SocialReelProduct[];
  reviewProducts: ReviewProductRef[];
}) {
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
    <main
      className="min-h-screen overflow-x-hidden"
      style={{ backgroundColor: bg === "pink" ? QGB.color.light : QGB.color.white }}
    >
      <OffersBanner />
      {visibility.hero ? <HeroSection /> : null}
      {visibility.featured ? <HomeCategoryProductSections sections={categorySections} /> : null}
      {visibility.social ? <SocialMediaSection products={socialReelProducts} /> : null}
      {visibility.reviews ? <HomeReviewsSection products={reviewProducts} /> : null}
      {visibility.faq ? <HomeFaqSection /> : null}
      {visibility.locations ? <StoreLocationsSection variant="fullBleed" /> : null}
    </main>
  );
}
