"use client";

import { useMemo, useState } from "react";
import { STORE_LOCATIONS, buildMapEmbedUrl } from "@/lib/store-locations";
import { sans, serif } from "@/lib/page-theme";

type StoreLocationsSectionProps = {
  /** Use `h1` on the dedicated locations page; default `h2` when embedded on the home page. */
  titleAs?: "h1" | "h2";
};

export function StoreLocationsSection({ titleAs = "h2" }: StoreLocationsSectionProps) {
  const [activeName, setActiveName] = useState<string>(STORE_LOCATIONS[0].name);
  const activeStore = useMemo(
    () => STORE_LOCATIONS.find((store) => store.name === activeName) ?? STORE_LOCATIONS[0],
    [activeName]
  );

  const TitleTag = titleAs;

  return (
    <section className="w-full bg-white py-12 md:py-16" dir="rtl" aria-labelledby="stores-section-heading">
      <div className="mb-8 w-full px-2 sm:px-4 md:mb-10 md:px-6 lg:px-8" dir="ltr">
        <div className="ml-auto w-fit max-w-3xl text-right" dir="rtl">
          <TitleTag id="stores-section-heading" className="text-2xl font-semibold tracking-tight text-neutral-900 md:text-3xl" style={serif}>
            نقاط البيع في السعودية واليمن
          </TitleTag>
          <p className="mt-3 text-sm leading-relaxed text-neutral-600 md:text-base" style={sans}>
            مواقعنا تمتد من المملكة إلى اليمن — اختاري نقطة البيع أدناه لعرضها على الخريطة.
          </p>
        </div>
      </div>

      <div className="w-full px-2 sm:px-4 md:px-6 lg:px-8">
        <div className="relative min-h-[min(72vh,560px)] w-full overflow-hidden rounded-xl bg-neutral-200 shadow-lg ring-1 ring-black/5">
          <iframe
            key={`${activeStore.lat}-${activeStore.lon}`}
            title={`خريطة ${activeStore.name}`}
            src={buildMapEmbedUrl(activeStore.lat, activeStore.lon)}
            className="absolute inset-0 h-full w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-l from-black/5 via-transparent to-transparent" aria-hidden />

          <div className="absolute inset-y-0 right-0 z-10 flex w-full max-w-[min(100%,20rem)] flex-col justify-center p-3 sm:max-w-[22rem] sm:p-4 md:max-w-sm md:p-6">
            <div
              className="pointer-events-auto flex max-h-[min(85vh,520px)] flex-col overflow-hidden rounded-2xl border border-[#F3B6CB]/40 bg-[#B63A6B]/92 p-5 text-white shadow-[0_24px_70px_rgba(182,58,107,0.28)] backdrop-blur-md sm:p-6"
              style={sans}
            >
              <h3 className="text-2xl font-medium tracking-tight text-white md:text-3xl" style={serif}>
                نقاط البيع
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-white/80 md:text-sm">
                اختاري الفرع لعرض موقعه على الخريطة.
              </p>

              <nav aria-label="قائمة نقاط البيع" className="cute-scrollbar mt-5 flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto pr-1">
                {STORE_LOCATIONS.map((store) => {
                  const isActive = store.name === activeStore.name;
                  return (
                    <button
                      key={store.name}
                      type="button"
                      onClick={() => setActiveName(store.name)}
                      className={`rounded-xl px-3 py-2.5 text-right text-sm transition-colors md:text-[0.9375rem] ${
                        isActive
                          ? "bg-white/15 font-semibold text-white ring-1 ring-white/25"
                          : "text-white/85 hover:bg-white/10"
                      }`}
                      aria-current={isActive ? "true" : undefined}
                    >
                      {store.name}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
