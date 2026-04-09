"use client";

import Link from "next/link";
import Image from "next/image";
import { FormEvent } from "react";
import { Instagram } from "lucide-react";

const font = { fontFamily: "var(--font-playpen-arabic), sans-serif" };

const FOOTER_NAV = [
  { label: "من نحن", href: "/about" },
  { label: "فروعنا", href: "/locations" },
  { label: "المجموعة", href: "/shop" },
  { label: "المعرض", href: "/shop" },
  { label: "المتجر", href: "/shop" },
];

const SOCIAL_LINKS = [
  { label: "Instagram", href: "https://www.instagram.com/queen__007696", Icon: Instagram },
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
              className="shrink-0 rounded-e-full px-6 py-3 text-xs font-semibold text-white transition-colors hover:brightness-110 sm:px-8 sm:text-sm"
              style={{ backgroundColor: "#B63A6B" }}
            >
              اشترك
            </button>
          </form>
        </div>

        <div className="pb-14 pt-6 text-center md:pb-16 md:pt-8">
          <p
            className="text-5xl font-semibold tracking-wide sm:text-6xl md:text-7xl"
            style={{ ...font, color: "#B63A6B" }}
          >
            الملكة جولد
          </p>
          <p className="mx-auto mt-8 max-w-2xl text-sm leading-relaxed text-white/70 sm:text-base" style={font}>
            عناية متكاملة بالجسم والبشرة والشعر بمنتجات طبيعية وآمنة، تمنحك نتائج تدريجية تليق بك.
          </p>

          <nav aria-label="روابط سريعة" className="mt-9">
            <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
              {FOOTER_NAV.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-sm font-semibold uppercase tracking-wide text-white/85 transition-colors hover:text-white">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-8 flex items-center justify-center gap-3">
            {SOCIAL_LINKS.map(({ label, href, Icon }) => (
              <Link
                key={label}
                href={href}
                aria-label={label}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full text-white transition-colors hover:brightness-110"
                style={{ backgroundColor: "#B63A6B" }}
              >
                <Icon className="h-5 w-5 text-white" strokeWidth={1.8} />
              </Link>
            ))}
          </div>
        </div>

        <div className="py-5">
          <div className="flex flex-col items-center justify-between gap-3 text-center md:flex-row md:text-start">
            <p className="text-xs text-white/70 sm:text-sm" style={font}>
              العربية / اليمن - الريال
            </p>
            <p className="text-xs text-white/70 sm:text-sm" style={font}>
              © 2026 الملكة جولد - <Link href="#" className="underline underline-offset-4">سياسة الخصوصية</Link>
            </p>
            <div className="flex items-center gap-2" style={font}>
              <span className="flex h-7 items-center rounded bg-white px-2">
                <Image
                  src="https://commons.wikimedia.org/wiki/Special:FilePath/Visa_2021.svg"
                  alt="Visa"
                  width={48}
                  height={14}
                  className="h-3.5 w-auto"
                />
              </span>
              <span className="flex h-7 items-center rounded bg-white px-2">
                <Image
                  src="https://commons.wikimedia.org/wiki/Special:FilePath/Mastercard_2019_logo.svg"
                  alt="Mastercard"
                  width={48}
                  height={16}
                  className="h-4 w-auto"
                />
              </span>
              <span className="flex h-7 items-center rounded bg-white px-2">
                <Image
                  src="https://commons.wikimedia.org/wiki/Special:FilePath/PayPal.svg"
                  alt="PayPal"
                  width={52}
                  height={14}
                  className="h-3.5 w-auto"
                />
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
