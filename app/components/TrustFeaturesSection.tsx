"use client";

import { Recycle, Sprout, Truck, Rabbit } from "lucide-react";

const sans = { fontFamily: "var(--font-playpen-arabic), sans-serif" };

const ITEMS: { Icon: typeof Recycle; title: string; desc: string }[] = [
  {
    Icon: Recycle,
    title: "عبوات عملية",
    desc: "عبوات سهلة الاستخدام ومصممة لتحافظ على جودة المنتج.",
  },
  {
    Icon: Sprout,
    title: "مكوّنات مختارة",
    desc: "تركيبات مدروسة بمكوّنات تناسب العناية اليومية بالبشرة.",
  },
  {
    Icon: Truck,
    title: "شحن سريع",
    desc: "توصيل سريع إلى باب منزلك في معظم المناطق.",
  },
  {
    Icon: Rabbit,
    title: "لطيف على البشرة",
    desc: "منتجات مختارة بعناية لتناسب روتين العناية اليومي.",
  },
];

export function TrustFeaturesSection() {
  return (
    <section className="bg-white py-12 md:py-16" aria-labelledby="trust-features-heading" dir="rtl">
      <div className="w-full px-4 sm:px-8 md:px-14 lg:px-24">
        <h2
          id="trust-features-heading"
          className="mb-10 text-center text-lg font-medium text-neutral-900 md:mb-12 md:text-xl"
          style={sans}
        >
          مميزات العناية
        </h2>
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-10">
          {ITEMS.map(({ Icon, title, desc }) => (
            <div key={title} className="flex flex-col items-center text-center">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FCF0F2] text-neutral-800 md:h-16 md:w-16"
                aria-hidden
              >
                <Icon className="h-7 w-7 md:h-8 md:w-8" strokeWidth={1.25} />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-neutral-900 md:text-base" style={sans}>
                {title}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-neutral-600 md:text-sm" style={sans}>
                {desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
