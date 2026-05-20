import Link from "next/link";
import { Phone } from "lucide-react";
import {
  getAllStoreLocations,
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
        className="flex flex-1 flex-col justify-center gap-5 bg-white py-8 md:py-12"
        dir="rtl"
        style={sans}
      >
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#B63A6B]">{store.city}</p>
          <h2 className="mt-2 text-2xl font-semibold leading-snug text-neutral-900 md:text-3xl lg:text-4xl" style={serif}>
            {store.name}
          </h2>
          {store.address && (
            <p className="mt-3 text-sm leading-relaxed text-neutral-600 md:text-base">
              {store.address}
            </p>
          )}
        </div>

        {store.phone && (
          <a
            href={`tel:${store.phone}`}
            className="inline-flex w-fit items-center gap-2 text-sm font-medium text-[#B63A6B] hover:underline"
            dir="ltr"
          >
            <Phone className="h-4 w-4" strokeWidth={2} />
            {store.phone}
          </a>
        )}

        <Link
          href={mapsHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-fit items-center rounded-full px-6 py-3 text-sm font-semibold text-white transition-[filter] hover:brightness-110"
          style={{ backgroundColor: "#B63A6B" }}
        >
          فتح في خرائط Google
        </Link>
      </div>
    </article>
  );
}

export async function LocationsAlternatingLayout() {
  const locations = await getAllStoreLocations();

  return (
    <div className={`mx-auto w-full max-w-[1920px] ${pagePaddingX}`}>
      <div className="flex flex-col gap-14 md:gap-20 lg:gap-24">
        {locations.map((store, index) => (
          <LocationRow key={store._id} store={store} index={index} />
        ))}
      </div>
    </div>
  );
}
