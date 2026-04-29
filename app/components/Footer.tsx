"use client";

import Link from "next/link";
import { ArrowLeft, Globe, Instagram } from "lucide-react";
import { pagePaddingX, sans } from "@/lib/page-theme";

const QUICK_LINKS = [
  { label: "المتجر الرئيسي", href: "/shop" },
  { label: "المدونة", href: "/blog" },
  { label: "جديد المجموعة", href: "/shop" },
  { label: "العروض الخاصة", href: "/shop" },
  { label: "آراء العملاء", href: "/shop" },
];

const ABOUT_LINKS = [
  { label: "من نحن", href: "/about" },
  { label: "نقاط البيع", href: "/locations" },
  { label: "الأسئلة الشائعة", href: "/about" },
  { label: "تواصل معنا", href: "/about" },
];

const WA_HREF = "https://wa.me/967782183149";
/** Match `Navbar` home branding */
const LOGO_SRC = "/logo_img.png";
const BRAND_NAME = "الملكة جولد";
const WA_CHANNEL_HREF = "https://whatsapp.com/channel/0029Vb6EdFc3GJP6WMzfXn2N";

const linkClass =
  "text-[15px] sm:text-base text-body transition-colors hover:text-brand-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.881 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer
      className="bg-white text-body"
      style={sans}
      role="contentinfo"
      dir="rtl"
    >
      <div className={`mx-auto max-w-[1920px] ${pagePaddingX} pt-12 pb-8`}>
        <div className="mb-8 flex flex-col gap-8 border-b border-brand-light pb-12 lg:mb-10 lg:flex-row lg:items-stretch lg:gap-10 xl:gap-12">
          <div
            className="order-2 min-w-0 flex-1 lg:order-1"
          >
        <div className="grid grid-cols-2 items-start gap-8 text-right md:grid-cols-3 md:gap-12">
          <div
            className="col-span-2 ml-auto flex w-fit flex-col items-start text-left md:col-span-1 md:ml-0 md:w-auto md:items-start md:text-right"
            dir="rtl"
          >
            <Link href="/" className="mb-4 block w-fit transition-opacity hover:opacity-90" aria-label={BRAND_NAME}>
              {/* eslint-disable-next-line @next/next/no-img-element — matches Navbar */}
              <img
                src={LOGO_SRC}
                alt=""
                className="h-12 w-auto max-w-[200px] object-contain sm:h-14"
                width={200}
                height={56}
              />
            </Link>
            <h2 className="mb-2 text-2xl font-bold text-brand-primary sm:text-3xl">{BRAND_NAME}</h2>
            <p className="max-w-md self-start text-right text-[15px] leading-relaxed text-body sm:text-base sm:leading-relaxed">
              عناية متكاملة بالجسم والبشرة والشعر بمنتجات طبيعية وآمنة، تمنحك نتائج تدريجية تليق بك.
            </p>
            <div className="mt-6 flex w-full justify-start gap-3 md:justify-start">
              <a
                href="https://www.instagram.com/queen__007696"
                aria-label="Instagram"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-11 w-11 items-center justify-center rounded-full bg-brand-primary text-white transition-colors hover:bg-brand-dark sm:h-12 sm:w-12"
              >
                <Instagram className="h-5 w-5" aria-hidden />
              </a>
              <a
                href={WA_HREF}
                aria-label="WhatsApp"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-11 w-11 items-center justify-center rounded-full bg-[#25D366] text-white transition-colors hover:bg-[#1ebe57] sm:h-12 sm:w-12"
              >
                <WhatsAppIcon className="h-5 w-5 fill-current" />
              </a>
            </div>
          </div>

          <div className="min-w-0 text-right">
            <h4 className="mb-4 text-sm font-bold uppercase tracking-wide text-brand-primary sm:text-base">
              روابط سريعة
            </h4>
            <ul className="space-y-3.5 sm:space-y-4">
              {QUICK_LINKS.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className={linkClass}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="min-w-0 text-right">
            <h4 className="mb-4 text-sm font-bold uppercase tracking-wide text-brand-primary sm:text-base">
              عن الملكة جولد
            </h4>
            <ul className="space-y-3.5 sm:space-y-4">
              {ABOUT_LINKS.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className={linkClass}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        </div>

        <div
          className="order-1 w-full shrink-0 sm:max-w-md lg:order-2 lg:max-w-sm xl:max-w-md"
          aria-label="دعوة قناة واتساب"
        >
          <div className="relative overflow-hidden rounded-3xl border border-brand-light bg-gradient-to-br from-white via-brand-light/20 to-white p-[1px]">
            <div className="relative h-full min-h-0 overflow-hidden rounded-[22px] bg-white/95 px-5 py-7 sm:px-6 sm:py-8">
              <div
                className="pointer-events-none absolute -start-16 -top-16 size-48 rounded-full bg-brand-accent/20 blur-2xl"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute -bottom-12 -end-12 size-40 rounded-full bg-brand-primary/10 blur-2xl"
                aria-hidden
              />

              <div className="relative z-10 flex flex-col items-stretch gap-4 text-right">
                <span className="inline-flex h-[22px] w-fit items-center self-end rounded-full bg-brand-primary px-2.5 text-[11px] font-semibold text-white">
                  قناة الواتساب
                </span>
                <h3 className="text-balance text-base font-semibold leading-snug text-title sm:text-lg">
                  تابعينا على القناة للحصول على آخر العروض والجديد
                </h3>
                <a
                  href={WA_CHANNEL_HREF}
                  className="qgb-btn-primary inline-flex w-full min-w-0 items-center justify-center gap-2.5"
                  target="_blank"
                  rel="noreferrer"
                >
                  <WhatsAppIcon className="size-4 shrink-0 fill-current" />
                  <span>انضمي إلينا الآن</span>
                  <ArrowLeft className="size-3.5 opacity-90" aria-hidden />
                </a>
              </div>
            </div>
          </div>
        </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="order-2 flex flex-wrap justify-center gap-x-5 gap-y-1.5 md:order-1">
            <span className="text-sm text-body sm:text-base">© 2026 الملكة جولد — جميع الحقوق محفوظة</span>
            <Link
              href="#"
              className="text-sm text-body underline decoration-brand-accent/60 underline-offset-2 transition-colors hover:text-brand-primary sm:text-base"
            >
              سياسة الخصوصية
            </Link>
          </div>

          <div className="order-1 flex items-center gap-2 md:order-2">
            <Globe className="h-4 w-4 shrink-0 text-brand-accent" aria-hidden />
            <span className="text-sm text-body sm:text-base">العربية / اليمن - الريال</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
