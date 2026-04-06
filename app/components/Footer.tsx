"use client";

import Link from "next/link";
import { FormEvent } from "react";

const font = { fontFamily: "var(--font-playpen-arabic), sans-serif" };

const CATEGORIES = [
  { label: "حمام وجسم", href: "/shop" },
  { label: "العناية بالجسم", href: "/shop" },
  { label: "العناية بالوجه", href: "/shop" },
  { label: "العناية بالشعر", href: "/shop" },
  { label: "العناية باليدين", href: "/shop" },
  { label: "الزيوت العطرية", href: "/shop" },
  { label: "تخفيضات %", href: "/shop" },
];

const CUSTOMER_SERVICE = [
  { label: "الأسئلة الشائعة", href: "#" },
  { label: "الشحن", href: "#" },
  { label: "تواصل معنا", href: "#" },
];

const INFORMATION = [
  { label: "الإرجاع والاسترداد", href: "#" },
  { label: "المستندات القانونية", href: "#" },
  { label: "من نحن", href: "/about" },
  { label: "مميزات الموقع", href: "#" },
];

export function Footer() {
  function handleNewsletterSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
  }

  return (
    <footer
      className="text-white"
      style={{ ...font, backgroundColor: "#151515" }}
      role="contentinfo"
      dir="rtl"
    >
      <div className="w-full px-4 sm:px-8 md:px-14 lg:px-24">
        <div className="py-12 text-center md:py-14">
          <h2 id="newsletter-heading" className="text-xl font-semibold tracking-tight text-white sm:text-2xl md:text-3xl">
            خصم 20٪ على طلبك الأول
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm text-white/75 sm:text-base">
            انضم إلى قائمتنا البريدية للحصول على عروض حصرية وآخر الأخبار.
          </p>
          <form
            className="mx-auto mt-8 flex w-full max-w-xl items-stretch overflow-hidden rounded-full border border-white/20 bg-white/5 sm:mt-10"
            onSubmit={handleNewsletterSubmit}
            noValidate
            aria-labelledby="newsletter-heading"
          >
            <input
              type="email"
              name="email"
              autoComplete="email"
              placeholder="البريد الإلكتروني"
              className="min-h-[48px] min-w-0 flex-1 rounded-s-full border-0 bg-transparent px-4 py-3 text-sm text-white placeholder:text-white/45 focus:outline-none focus:ring-0"
              dir="rtl"
              required
            />
            <button
              type="submit"
              className="shrink-0 rounded-e-full bg-white px-6 py-3 text-xs font-semibold text-neutral-950 transition-colors hover:bg-white/90 sm:px-8 sm:text-sm"
            >
              اشترك
            </button>
          </form>
        </div>

        <div className="grid grid-cols-1 gap-x-8 gap-y-10 py-14 min-[480px]:grid-cols-2 sm:gap-x-10 sm:gap-y-12 lg:grid-cols-4 lg:gap-x-8 lg:gap-y-10">
          <nav aria-label="التصنيفات">
            <h3 className="text-sm font-semibold tracking-wide text-white">التصنيفات</h3>
            <ul className="mt-6 flex flex-col gap-3">
              {CATEGORIES.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-sm text-white/80 transition-colors hover:text-white">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="خدمة العملاء">
            <h3 className="text-sm font-semibold tracking-wide text-white">خدمة العملاء</h3>
            <ul className="mt-6 flex flex-col gap-3">
              {CUSTOMER_SERVICE.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-sm text-white/80 transition-colors hover:text-white">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="معلومات">
            <h3 className="text-sm font-semibold tracking-wide text-white">معلومات</h3>
            <ul className="mt-6 flex flex-col gap-3">
              {INFORMATION.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-sm text-white/80 transition-colors hover:text-white">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h3 className="text-sm font-semibold tracking-wide text-white">من نحن</h3>
            <p className="mt-6 text-sm leading-relaxed text-white/75">
              نقدّم لك منتجات مختارة بعناية لتجربة تسوق فاخرة. جودة، أصالة، وخدمة تليق بك. اكتشف المزيد عبر{" "}
              <Link href="/about" className="underline underline-offset-4 transition-colors hover:text-white">
                من نحن
              </Link>
              .
            </p>
          </div>
        </div>

        <div className="pb-14 pt-12 text-center md:pb-16 md:pt-20">
          <p
            className="text-6xl font-light leading-[0.95] tracking-tight text-white sm:text-7xl md:text-8xl lg:text-9xl xl:text-[10rem]"
            style={font}
          >
            الملكة جولد
          </p>
        </div>
      </div>
    </footer>
  );
}
