"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Phone } from "lucide-react";
import { buildMapEmbedUrl, type StoreLocation } from "@/lib/store-locations";
import { sans, serif } from "@/lib/page-theme";

type StoreLocationsSectionProps = {
  /** Edge-to-edge map: no horizontal padding, square corners (e.g. home page above footer). */
  variant?: "default" | "fullBleed";
};

export function StoreLocationsSection({ variant = "default" }: StoreLocationsSectionProps) {
  const [locations, setLocations] = useState<StoreLocation[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/store-locations")
      .then((r) => r.json() as Promise<StoreLocation[]>)
      .then((data) => {
        setLocations(data);
        if (data.length > 0) setActiveId(data[0]._id);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const activeStore = useMemo(
    () => locations.find((s) => s._id === activeId) ?? locations[0],
    [activeId, locations]
  );

  useEffect(() => {
    if (!dropdownOpen) return;
    const close = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [dropdownOpen]);

  useEffect(() => {
    if (!dropdownOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDropdownOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [dropdownOpen]);

  const fullBleed = variant === "fullBleed";
  const hxPad = fullBleed ? "" : "px-2 sm:px-4 md:px-6 lg:px-8";
  const mapFrame = fullBleed
    ? "relative min-h-[min(72vh,560px)] w-full overflow-hidden bg-neutral-200"
    : "relative min-h-[min(72vh,560px)] w-full overflow-hidden rounded-xl bg-neutral-200";

  if (loading || !activeStore) {
    return (
      <section className="w-full bg-white" dir="rtl" aria-label="نقاط البيع">
        <div className={`w-full ${fullBleed ? "" : hxPad}`}>
          <div className={mapFrame} />
        </div>
      </section>
    );
  }

  return (
    <section className="w-full bg-white" dir="rtl" aria-label="نقاط البيع">
      <div className={`w-full ${hxPad}`}>
        <div className={mapFrame}>
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
              ref={dropdownRef}
              className="pointer-events-auto rounded-[14px] border-[1.5px] border-brand-light bg-white p-4 text-body shadow-sm sm:p-5"
              style={sans}
            >
              <h3
                id="stores-panel-heading"
                className="qgb-h2-section tracking-tight"
                style={serif}
              >
                نقاط البيع
              </h3>
              <p className="qgb-body mt-1.5">
                اختر المحافظة لعرض موقعها على الخريطة.
              </p>

              {/* Dropdown */}
              <div className="relative mt-4">
                <button
                  type="button"
                  id="store-location-combobox"
                  className="flex h-10 min-h-10 w-full items-center justify-between gap-2 rounded-[8px] border-[1.5px] border-brand-primary bg-white px-3 text-right text-[13px] font-semibold text-brand-primary shadow-sm transition-colors hover:bg-brand-light focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/35"
                  aria-expanded={dropdownOpen}
                  aria-haspopup="listbox"
                  aria-controls="store-location-listbox"
                  onClick={() => setDropdownOpen((o) => !o)}
                >
                  <span className="min-w-0 flex-1 truncate font-medium">
                    {activeStore.city} — {activeStore.name}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-brand-primary transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                    strokeWidth={2.25}
                    aria-hidden
                  />
                </button>

                {dropdownOpen ? (
                  <ul
                    id="store-location-listbox"
                    role="listbox"
                    aria-labelledby="stores-panel-heading"
                    className="cute-scrollbar absolute start-0 end-0 top-[calc(100%+0.25rem)] z-20 max-h-52 overflow-y-auto rounded-[8px] border-[1.5px] border-brand-light bg-white py-1 shadow-md"
                  >
                    {locations.map((store) => {
                      const selected = store._id === activeStore?._id;
                      return (
                        <li key={store._id} role="presentation">
                          <button
                            type="button"
                            role="option"
                            aria-selected={selected}
                            className={`w-full px-3 py-2.5 text-right transition-colors ${
                              selected
                                ? "bg-brand-light font-semibold text-brand-primary"
                                : "text-body hover:bg-brand-light/70"
                            }`}
                            onClick={() => {
                              setActiveId(store._id);
                              setDropdownOpen(false);
                            }}
                          >
                            <span className="block text-[13px] font-medium leading-tight">
                              {store.city}
                            </span>
                            <span className="block text-[11px] text-neutral-500 leading-tight mt-0.5">
                              {store.name}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
              </div>

              {/* Active store details */}
              <div className="mt-3 space-y-1">
                {activeStore.address && (
                  <p className="text-[12px] leading-relaxed text-neutral-600">
                    {activeStore.address}
                  </p>
                )}
                {activeStore.phone && (
                  <a
                    href={`tel:${activeStore.phone}`}
                    className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#B63A6B] hover:underline"
                    dir="ltr"
                  >
                    <Phone className="h-3 w-3" strokeWidth={2} />
                    {activeStore.phone}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
