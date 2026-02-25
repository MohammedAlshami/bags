"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

type CollectionItem = { _id: string; name: string; slug: string; image?: string; description?: string };

const serif = { fontFamily: "var(--font-cormorant), serif" };
const bgWhite = { backgroundColor: "#ffffff" };

const COLLECTION_BANNER_IMAGE = "/Pixalated.png";

export default function CollectionsPage() {
  const [collections, setCollections] = useState<CollectionItem[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/collections")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load collections");
        return res.json();
      })
      .then((data: CollectionItem[]) => setCollections(data))
      .catch((err) => setLoadError(err instanceof Error ? err.message : "Failed to load"));
  }, []);

  if (loadError) {
    return (
      <main className="min-h-screen pt-24 pb-24 flex items-center justify-center" style={bgWhite}>
        <p className="text-neutral-600" style={serif}>{loadError}</p>
      </main>
    );
  }

  if (collections === null) {
    return (
      <main className="min-h-screen pt-24 pb-24 flex items-center justify-center" style={bgWhite}>
        <p className="text-neutral-500" style={serif}>Loading…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-24 pb-24 md:pt-32 md:pb-32" style={bgWhite}>
      <div className="mx-10 md:mx-20">
        <div className="relative aspect-[21/9] w-full overflow-hidden md:aspect-[3/1] mb-10 md:mb-12">
          <Image
            src={COLLECTION_BANNER_IMAGE}
            alt="Collections — Carry the moment"
            fill
            className="object-cover object-[50%_88%]"
            sizes="100vw"
            priority
          />
          <div
            className="absolute inset-2 border-4 pointer-events-none"
            style={{ borderColor: "#facc15" }}
            aria-hidden
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <div className="text-center text-white">
              <h2 className="text-4xl font-light md:text-6xl" style={serif}>
                Our collections
              </h2>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <p className="text-[10px] uppercase tracking-[0.35em] text-gray-500">Collections</p>
          <h1 className="mt-2 text-4xl font-light text-neutral-900 md:text-5xl" style={serif}>
            Discover each collection
          </h1>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((c) => (
            <Link
              key={c._id}
              href={`/collections/${c.slug}`}
              className="group block"
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-neutral-100">
                {c.image ? (
                  <Image
                    src={c.image}
                    alt={c.name}
                    fill
                    className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-neutral-400 text-sm" style={serif}>
                    {c.name}
                  </div>
                )}
              </div>
              <div className="mt-4">
                <span className="text-sm font-medium text-black/90">{c.name}</span>
                {c.description && (
                  <p className="mt-1 text-xs text-neutral-500 line-clamp-2">{c.description}</p>
                )}
                <span className="mt-2 inline-block text-[10px] uppercase tracking-widest text-neutral-500 group-hover:text-black transition-colors">
                  View collection
                </span>
              </div>
            </Link>
          ))}
        </div>

        {collections.length === 0 && (
          <p className="py-16 text-center text-sm text-neutral-500" style={serif}>
            No collections yet. Check back soon.
          </p>
        )}
      </div>
    </main>
  );
}
