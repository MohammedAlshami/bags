import Link from "next/link";
import {
  STORE_LOCATIONS,
  buildGoogleMapsLink,
  buildMapEmbedUrl,
  type StoreLocation,
} from "@/lib/store-locations";
import { pagePaddingX, sans, serif } from "@/lib/page-theme";

function LocationRow({ store, index }: { store: StoreLocation; index: number }) {
  const mapOnLeft = index % 2 === 0;
  const mapsHref = buildGoogleMapsLink(store.lat, store.lon);

  return (
    <article
      className={`flex flex-col gap-8 md:flex-row md:gap-10 lg:gap-12 md:min-h-[min(72vh,520px)] md:items-stretch ${
        mapOnLeft ? "" : "md:flex-row-reverse"
      }`}
      dir="ltr"
    >
      <div className="relative min-h-[min(42vh,320px)] w-full flex-1 overflow-hidden rounded-lg bg-neutral-200 shadow-sm ring-1 ring-black/5 md:min-h-0">
        <iframe
          title={`خريطة ${store.name}`}
          src={buildMapEmbedUrl(store.lat, store.lon)}
          className="absolute inset-0 h-full w-full rounded-lg border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      <div
        className="flex flex-1 flex-col justify-center gap-6 bg-white py-8 md:py-12"
        dir="rtl"
        style={sans}
      >
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#B63A6B]">{store.country}</p>
          <h2 className="mt-2 text-2xl font-semibold leading-snug text-neutral-900 md:text-3xl lg:text-4xl" style={serif}>
            {store.name}
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-neutral-600 md:text-base">{store.city}</p>
        </div>
        <p className="text-sm leading-relaxed text-neutral-600 md:text-base">
          زورينا في هذا الفرع — فريقنا يرحّب بكِ ويساعدكِ على اختيار ما يناسبكِ.
        </p>
        <Link
          href={mapsHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-fit items-center rounded-full px-6 py-3 text-sm font-semibold text-white transition-colors hover:brightness-110"
          style={{ backgroundColor: "#B63A6B" }}
        >
          فتح في خرائط Google
        </Link>
      </div>
    </article>
  );
}

export function LocationsAlternatingLayout() {
  return (
    <div className={`mx-auto w-full max-w-[1920px] ${pagePaddingX}`}>
      <div className="flex flex-col gap-14 md:gap-20 lg:gap-24">
        {STORE_LOCATIONS.map((store, index) => (
          <LocationRow key={store.name} store={store} index={index} />
        ))}
      </div>
    </div>
  );
}
