"use client";

import Link from "next/link";
import { ArrowLeft, Globe, Instagram } from "lucide-react";
import { pagePaddingX } from "@/lib/page-theme";

const font = { fontFamily: "var(--font-playpen-arabic), sans-serif" };

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

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.881 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-pink-500/10 text-white" style={{ ...font, background: "linear-gradient(180deg, #121212 0%, #0a0a0a 100%)" }} role="contentinfo" dir="rtl">
      <style>{`
        .brand-gradient-text {
          background: linear-gradient(to right, #d44c7d, #f06292);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .cta-banner {
          background: linear-gradient(135deg, rgba(212, 76, 125, 0.15) 0%, rgba(212, 76, 125, 0.05) 100%);
          border: 1px solid rgba(212, 76, 125, 0.2);
          backdrop-filter: blur(10px);
        }
        .whatsapp-btn {
          background: #d44c7d;
          transition: all 0.3s ease;
        }
        .whatsapp-btn:hover {
          background: #ffffff;
          color: #d44c7d;
        }
        .nav-link {
          transition: color 0.3s ease;
          color: #9ca3af;
        }
        .nav-link:hover {
          color: #d44c7d;
        }
      `}</style>

      <div className={`mx-auto max-w-[1920px] ${pagePaddingX} pt-16 pb-8`}>
        <div className="cta-banner relative mb-16 flex flex-col items-center overflow-hidden rounded-3xl p-8 text-center md:p-12">
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-pink-500/10 blur-3xl" aria-hidden />
          <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-pink-500/10 blur-3xl" aria-hidden />

          <div className="relative z-10">
            <span className="mb-3 block text-sm font-bold uppercase tracking-[0.2em] text-pink-400">قناة الواتساب</span>
            <h3 className="mb-8 text-2xl font-bold text-white md:text-4xl">تابعينا على القناة للحصول على آخر العروض</h3>
            <a
              href="https://whatsapp.com/channel/0029Vb6EdFc3GJP6WMzfXn2N"
              className="whatsapp-btn mx-auto inline-flex w-fit items-center gap-3 rounded-full px-10 py-4 font-bold text-white"
              target="_blank"
              rel="noreferrer"
            >
              <span>انضمي إلينا الآن</span>
              <ArrowLeft className="text-xs opacity-70" size={14} aria-hidden />
            </a>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-2 items-start gap-8 border-b border-gray-800 pb-12 text-right md:grid-cols-3 md:gap-12">
          <div className="col-span-2 ml-auto flex w-fit flex-col items-start text-left md:col-span-1 md:ml-0 md:w-auto md:items-start md:text-right" dir="rtl">
            <h2 className="mb-4 text-4xl font-bold brand-gradient-text">الملكة جولد</h2>
            <p className="max-w-xs self-start text-left text-sm leading-relaxed text-gray-400">
              عناية متكاملة بالجسم والبشرة والشعر بمنتجات طبيعية وآمنة، تمنحك نتائج تدريجية تليق بك.
            </p>
            <div className="mt-6 flex w-full justify-start gap-4 md:justify-start">
              <a
                href="https://www.instagram.com/queen__007696"
                aria-label="Instagram"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-10 w-10 items-center justify-center rounded-full bg-[#d44c7d] transition-colors hover:bg-white"
              >
                <Instagram className="h-4 w-4 text-white transition-colors group-hover:text-[#d44c7d]" aria-hidden />
              </a>
              <a
                href={WA_HREF}
                aria-label="WhatsApp"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-10 w-10 items-center justify-center rounded-full bg-[#25D366] transition-colors hover:bg-white"
              >
                <WhatsAppIcon className="h-4 w-4 fill-white transition-colors group-hover:fill-[#25D366]" />
              </a>
            </div>
          </div>

          <div className="min-w-0 text-right">
            <h4 className="mb-6 font-bold text-white">روابط سريعة</h4>
            <ul className="space-y-4">
              {QUICK_LINKS.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="nav-link">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="min-w-0 text-right">
            <h4 className="mb-6 font-bold text-white">عن الملكة جولد</h4>
            <ul className="space-y-4">
              {ABOUT_LINKS.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="nav-link">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 text-xs text-gray-500 md:flex-row">
          <div className="order-2 flex gap-4 md:order-1">
            <span>© 2024 الملكة جولد - جميع الحقوق محفوظة</span>
            <Link href="#" className="underline hover:text-white">
              سياسة الخصوصية
            </Link>
          </div>

          <div className="order-1 flex items-center gap-6 md:order-2">
            <div className="flex items-center gap-2 cursor-pointer hover:text-white">
              <Globe className="h-4 w-4" aria-hidden />
              <span>العربية / اليمن - الريال</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
