"use client";

import { ProductsSection } from "./components/ProductsSection";
import { HeroSection } from "./components/HeroSection";

export default function Home() {
  return (
    <main className="min-h-screen overflow-x-hidden" style={{ backgroundColor: "#ffffff" }}>
      {/* Hero — Bottom Aligned only */}
      <HeroSection />

      {/* Products — Banner, then carousel, then grid */}
      <ProductsSection />
    </main>
  );
}
