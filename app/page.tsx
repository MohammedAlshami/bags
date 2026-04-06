import { HeroSection } from "./components/HeroSection";
import { FeaturedProductsSection } from "./components/FeaturedProductsSection";
import { ShowcaseSplitSection } from "./components/ShowcaseSplitSection";
import { TrustFeaturesSection } from "./components/TrustFeaturesSection";
import { SocialMediaSection } from "./components/SocialMediaSection";

export default function Home() {
  return (
    <main className="min-h-screen overflow-x-hidden" style={{ backgroundColor: "#ffffff" }}>
      <HeroSection />
      <FeaturedProductsSection />
      <ShowcaseSplitSection />
      <SocialMediaSection />
      <TrustFeaturesSection />
    </main>
  );
}
