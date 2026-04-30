"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { SITE_FAQ_ITEMS } from "@/lib/home-faq-items";

const sans = { fontFamily: "var(--font-playpen-arabic), sans-serif" };
const serif = { fontFamily: "var(--font-cormorant), serif" };

const FAQ_ITEMS = SITE_FAQ_ITEMS;

export function AboutFaq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="w-full scroll-mt-24 bg-white py-16 md:py-24" aria-labelledby="about-faq-heading" dir="rtl">
      <div className="mx-auto max-w-3xl px-4 sm:px-8 md:px-6">
        <h2 id="about-faq-heading" className="text-center text-3xl font-semibold text-neutral-900 md:text-4xl" style={serif}>
          أسئلة شائعة
        </h2>

        <ul className="mt-12 divide-y divide-neutral-200">
          {FAQ_ITEMS.map((item, i) => {
            const isOpen = open === i;
            return (
              <li key={item.q}>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full cursor-pointer items-start justify-between gap-4 py-5 text-start transition-colors hover:bg-neutral-50/80"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm font-medium text-neutral-900 md:text-base" style={sans}>
                    {i + 1}. {item.q}
                  </span>
                  <span className="shrink-0 text-neutral-500">
                    <Plus className={`h-5 w-5 transition-transform ${isOpen ? "rotate-45" : ""}`} strokeWidth={1.5} />
                  </span>
                </button>
                {isOpen && (
                  <p className="pb-5 text-sm leading-relaxed text-neutral-600 md:text-base" style={sans}>
                    {item.a}
                  </p>
                )}
              </li>
            );
          })}
        </ul>

        <p className="mt-10 text-center text-xs text-neutral-500 md:text-sm" style={sans}>
          لمزيد من الاستفسارات تواصلي معنا عبر{" "}
          <a href="https://wa.me/967782183149" className="underline underline-offset-4 hover:text-neutral-800">
            واتساب
          </a>
          .
        </p>
      </div>
    </section>
  );
}
