"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { sans, pagePaddingX } from "@/lib/page-theme";

type CollectionItem = { _id: string; name: string; slug: string; image?: string; description?: string };

const COLLECTION_BANNER_IMAGE = "/Pixalated.png";

export default function CollectionsPage() {
  const [collections, setCollections] = useState<CollectionItem[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/collections")
      .then((res) => {
        if (!res.ok) throw new Error("تعذّر تحميل المجموعات");
        return res.json();
      })
      .then((data: CollectionItem[]) => setCollections(data))
      .catch((err) => setLoadError(err instanceof Error ? err.message : "حدث خطأ"));
  }, []);

  if (loadError) {
    return (
      <main className="min-h-screen bg-white pb-24 pt-24 flex items-center justify-center" dir="rtl">
        <p className="text-neutral-600" style={sans}>
          {loadError}
        </p>
      </main>
    );
  }

  if (collections === null) {
    return (
      <main className="min-h-screen bg-white pb-24 pt-24 flex items-center justify-center" dir="rtl">
        <p className="text-neutral-500" style={sans}>
          جاري التحميل…
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white pb-24 pt-24 md:pb-32 md:pt-32" dir="rtl">
      <div className={`mx-auto max-w-[1920px] ${pagePaddingX}`}>
        <div className="relative mb-10 aspect-[21/9] w-full overflow-hidden md:mb-12 md:aspect-[3/1]">
          <Image
            src={COLLECTION_BANNER_IMAGE}
            alt=""
            fill
            className="object-cover object-[50%_88%]"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-2 border-4 border-[#facc15] pointer-events-none" aria-hidden />
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <div className="text-center text-white">
              <h2 className="text-3xl font-medium md:text-5xl" style={sans}>
                مجموعاتنا
              </h2>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <p className="text-xs text-neutral-500" style={sans}>
            المجموعات
          </p>
          <h1 className="mt-2 text-3xl font-medium text-neutral-900 md:text-4xl" style={sans}>
            اكتشفي كل مجموعة
          </h1>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((c) => (
            <Link key={c._id} href={`/collections/${c.slug}`} className="group block">
              <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-neutral-100">
                {c.image ? (
                  <Image
                    src={c.image}
                    alt={c.name}
                    fill
                    className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-sm text-neutral-400" style={sans}>
                    {c.name}
                  </div>
                )}
              </div>
              <div className="mt-4">
                <span className="text-sm font-semibold text-neutral-900" style={sans}>
                  {c.name}
                </span>
                {c.description && (
                  <p className="mt-1 line-clamp-2 text-xs text-neutral-500" style={sans}>
                    {c.description}
                  </p>
                )}
                <span className="mt-2 inline-block text-xs text-neutral-500 transition-colors group-hover:text-black" style={sans}>
                  عرض المجموعة
                </span>
              </div>
            </Link>
          ))}
        </div>

        {collections.length === 0 && (
          <p className="py-16 text-center text-sm text-neutral-500" style={sans}>
            لا توجد مجموعات بعد. تعودي لاحقاً.
          </p>
        )}
      </div>
    </main>
  );
}
