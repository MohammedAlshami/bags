import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import { StoreLocationsSection } from "@/app/components/StoreLocationsSection";
import { AboutBrandStory } from "@/app/components/about/AboutBrandStory";
import { AboutFaq } from "@/app/components/about/AboutFaq";
import { AboutSplitShowcase } from "@/app/components/about/AboutSplitShowcase";
import { AboutPaymentDetails } from "@/app/components/about/AboutPaymentDetails";
import { sans, pagePaddingX } from "@/lib/page-theme";

export default function AboutPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-white pt-20 md:pt-24" dir="rtl">
      <div className={pagePaddingX}>
        <Breadcrumbs items={[{ label: "الرئيسية", href: "/" }, { label: "من نحن" }]} />
      </div>

      <div className="p-2 pb-10 md:p-2 md:pb-14">
        <section className="relative w-full overflow-hidden rounded-xl bg-neutral-900 shadow-lg ring-1 ring-black/5">
          <div className="relative h-[min(78vh,880px)] min-h-[340px] w-full md:min-h-[460px] md:h-[min(72vh,920px)]">
            <video
              className="absolute inset-0 h-full w-full object-cover"
              src="/8798403-uhd_4096_2160_25fps.mp4"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-hidden
            />
            <div className="absolute inset-0 bg-black/35" aria-hidden />
            <div className={`absolute inset-0 flex flex-col items-center justify-center ${pagePaddingX} text-center`}>
              <h1 className="text-3xl font-medium text-white md:text-5xl" style={sans}>
                من نحن
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/90 md:text-base" style={sans}>
                الملكة جولد — عناية مختارة بعناية، وإيمان بأن الجمال يبدأ من الثقة والتفاصيل.
              </p>
            </div>
          </div>
        </section>
      </div>

      <AboutBrandStory />

      <AboutPaymentDetails />

      <AboutFaq />

      <AboutSplitShowcase />

      <StoreLocationsSection />
    </main>
  );
}
