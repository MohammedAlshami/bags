"use client";

import Image from "next/image";
import { ArrowRight, Plus } from "lucide-react";
import { useState, type MouseEvent } from "react";

const sans = { fontFamily: "var(--font-playpen-arabic), sans-serif" };

type ShowcaseItem = {
  id: string;
  title: string;
  image: string;
};

/** صور عرض — تتغير عند التمرير على عنصر القائمة */
const SHOWCASE_ITEMS: ShowcaseItem[] = [
  {
    id: "1",
    title: "أتيليه أحمر الخدود",
    image:
      "https://images.unsplash.com/photo-1744371386847-ded3b4a66017?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.1.0",
  },
  {
    id: "2",
    title: "الإكسير الذهبي",
    image:
      "https://images.unsplash.com/photo-1697840507245-e6ce44da4e4c?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.1.0",
  },
  {
    id: "3",
    title: "كمال عُري",
    image:
      "https://images.unsplash.com/photo-1551061031-9e473ec479e2?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.1.0",
  },
  {
    id: "4",
    title: "جوهر الحرير",
    image:
      "https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.1.0",
  },
];

const PREVIEW_OFFSET = 14;
const PREVIEW_W = 80;
const PREVIEW_H = 100;

export function ShowcaseSplitSection() {
  const [active, setActive] = useState(0);
  const [cursorPreview, setCursorPreview] = useState<{
    x: number;
    y: number;
    image: string;
  } | null>(null);

  const updateCursorPreview = (e: MouseEvent, image: string) => {
    let x = e.clientX + PREVIEW_OFFSET;
    let y = e.clientY + PREVIEW_OFFSET;
    if (typeof window !== "undefined") {
      x = Math.min(x, window.innerWidth - PREVIEW_W - 8);
      y = Math.min(y, window.innerHeight - PREVIEW_H - 8);
      x = Math.max(8, x);
      y = Math.max(8, y);
    }
    setCursorPreview({ x, y, image });
  };

  return (
    <section className="w-full bg-white" aria-label="مختارات العلامة" dir="rtl">
      <div className="mx-auto grid max-w-[1600px] md:grid-cols-2 md:min-h-[min(85vh,820px)]">
        {/* عمود يمين الشاشة: الصورة (أول عنصر في الشبكة مع dir=rtl) */}
        <div className="relative aspect-[4/5] w-full min-h-[280px] bg-neutral-200 md:aspect-auto md:min-h-0">
          {SHOWCASE_ITEMS.map((item, i) => (
            <div
              key={item.id}
              className={`absolute inset-0 transition-opacity duration-500 ease-out ${
                i === active ? "z-10 opacity-100" : "z-0 opacity-0"
              }`}
              aria-hidden={i !== active}
            >
              <Image
                src={item.image}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority={i === 0}
                unoptimized={item.image.startsWith("http") && !/unsplash|ebayimg|cloudinary/.test(item.image)}
              />
            </div>
          ))}
        </div>

        {/* عمود يسار الشاشة: القائمة — خلفية بيضاء، النص يميناً والأيقونات يساراً */}
        <div
          className="flex flex-col justify-center bg-white px-6 py-12 sm:px-10 md:px-14 md:py-16 lg:px-20"
          style={sans}
        >
          <p className="mb-10 text-start text-xs uppercase tracking-[0.35em] text-neutral-500">تجميل مختار</p>
          <ul className="flex flex-col" onMouseLeave={() => setCursorPreview(null)}>
            {SHOWCASE_ITEMS.map((item, i) => {
              const isActive = i === active;
              return (
                <li key={item.id} className="border-b border-neutral-200/90 first:border-t first:border-neutral-200/90">
                  <button
                    type="button"
                    className="flex w-full items-center gap-8 py-6 text-start transition-colors hover:bg-neutral-50 md:gap-10 md:py-7"
                    onMouseEnter={(e) => {
                      setActive(i);
                      updateCursorPreview(e, item.image);
                    }}
                    onMouseMove={(e) => {
                      updateCursorPreview(e, item.image);
                    }}
                    onFocus={() => setActive(i)}
                    aria-current={isActive ? "true" : undefined}
                  >
                    {/* RTL: أول عنصر = يمين (النص)، ثانٍ = يسار (الأيقونة) */}
                    <span
                      className={`min-w-0 flex-1 text-start text-xl font-light italic text-neutral-900 sm:text-2xl md:text-[1.65rem] leading-snug ${
                        isActive ? "text-black" : "text-neutral-700"
                      }`}
                    >
                      {item.title}
                    </span>
                    <span className="shrink-0 text-neutral-900" aria-hidden>
                      {isActive ? (
                        <ArrowRight className="h-5 w-5 stroke-[1.5]" strokeWidth={1.5} />
                      ) : (
                        <Plus className="h-5 w-5 stroke-[1.5]" strokeWidth={1.5} />
                      )}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {cursorPreview ? (
        <div
          className="pointer-events-none fixed z-[100] overflow-hidden rounded-md border border-black/10 bg-white shadow-xl"
          style={{
            left: cursorPreview.x,
            top: cursorPreview.y,
            width: PREVIEW_W,
            height: PREVIEW_H,
          }}
          aria-hidden
        >
          <Image
            src={cursorPreview.image}
            alt=""
            width={PREVIEW_W}
            height={PREVIEW_H}
            className="h-full w-full object-cover"
            unoptimized={
              cursorPreview.image.startsWith("http") &&
              !/unsplash|ebayimg|cloudinary/.test(cursorPreview.image)
            }
          />
        </div>
      ) : null}
    </section>
  );
}
