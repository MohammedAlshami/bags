"use client";

import Link from "next/link";
import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import { SITE_FAQ_ITEMS } from "@/lib/home-faq-items";
import { sans } from "@/lib/page-theme";

const SECTION_BG = "#FAF8F5";

/** First items shown on home; rest on /about */
const HOME_FAQ_COUNT = 5;

export function HomeFaqSection() {
  const items = SITE_FAQ_ITEMS.slice(0, HOME_FAQ_COUNT);
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section
      className="w-full py-14 md:py-20"
      style={{ backgroundColor: SECTION_BG }}
      aria-labelledby="home-faq-heading"
      dir="rtl"
    >
      <div className="mx-auto max-w-[1600px] px-4 sm:px-8 md:px-14 lg:px-24">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-12 lg:items-start">
          <div className="order-1 flex flex-col text-start">
            <h2
              id="home-faq-heading"
              className="text-2xl font-semibold leading-snug text-neutral-900 md:text-3xl"
              style={{ fontFamily: "var(--font-cormorant), serif" }}
            >
              نُجيبُكِ بكل وضوح
            </h2>
            <p className="mt-4 text-[14px] leading-relaxed text-neutral-600 sm:text-[15px]" style={sans}>
              نلتزم بخدمة عملاء مهذبة وسريعة. إن لم تجدي إجابتك هنا، راسلينا على{" "}
              <a
                href="https://wa.me/967782183149"
                className="font-medium text-brand-primary underline underline-offset-4 hover:text-brand-dark"
                target="_blank"
                rel="noopener noreferrer"
              >
                الواتساب
              </a>
              .
            </p>
            <Link href="/about#faq" className="mt-8 inline-flex w-fit qgb-btn-primary" style={sans} prefetch>
              المزيد من الإجابات
            </Link>
          </div>

          <div className="order-2 flex flex-col gap-3">
            {items.map((item, i) => {
              const isOpen = open === i;
              return (
                <div
                  key={item.q}
                  className={`overflow-hidden rounded-xl border transition-colors ${
                    isOpen
                      ? "border-neutral-200 bg-white"
                      : "border-transparent bg-neutral-100/90 ring-1 ring-neutral-200/60"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-start sm:px-5 sm:py-4"
                    aria-expanded={isOpen}
                    style={sans}
                  >
                    <span className="text-[14px] font-semibold leading-snug text-neutral-900 sm:text-[15px]">
                      {item.q}
                    </span>
                    <span className="shrink-0 text-brand-primary" aria-hidden>
                      {isOpen ? (
                        <Minus className="size-5" strokeWidth={1.75} />
                      ) : (
                        <Plus className="size-5" strokeWidth={1.75} />
                      )}
                    </span>
                  </button>
                  {isOpen ? (
                    <p
                      className="border-t border-neutral-100 px-4 pb-4 pt-0 text-[13px] leading-relaxed text-neutral-600 sm:px-5 sm:text-[14px]"
                      style={sans}
                    >
                      {item.a}
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
