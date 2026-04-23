"use client";

import Link from "next/link";
import { ArrowLeft, Globe, Instagram } from "lucide-react";
import { pagePaddingX } from "@/lib/page-theme";

const font = { fontFamily: "var(--font-playpen-arabic), sans-serif" };

const QUICK_LINKS = [
  { label: "المتجر الرئيسي", href: "/shop" },
  { label: "جديد المجموعة", href: "/shop" },
  { label: "العروض الخاصة", href: "/shop" },
  { label: "آراء العملاء", href: "/shop" },
];

const ABOUT_LINKS = [
  { label: "من نحن", href: "/about" },
  { label: "فروعنا", href: "/locations" },
  { label: "الأسئلة الشائعة", href: "/about" },
  { label: "تواصل معنا", href: "/about" },
];

const SOCIAL_LINKS = [
  { label: "Instagram", href: "https://www.instagram.com/queen__007696", Icon: Instagram },
  { label: "Snapchat", href: "#", Icon: Instagram },
  { label: "TikTok", href: "#", Icon: Instagram },
];

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

        <div className="mb-8 grid grid-cols-1 items-start gap-12 border-b border-gray-800 pb-12 text-center md:grid-cols-3 md:text-right">
          <div className="flex flex-col items-center md:items-start">
            <h2 className="mb-4 text-4xl font-bold brand-gradient-text">الملكة جولد</h2>
            <p className="max-w-xs text-sm leading-relaxed text-gray-400">
              عناية متكاملة بالجسم والبشرة والشعر بمنتجات طبيعية وآمنة، تمنحك نتائج تدريجية تليق بك.
            </p>
            <div className="mt-6 flex gap-4">
              {SOCIAL_LINKS.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex h-10 w-10 items-center justify-center rounded-full bg-[#d44c7d] transition-colors hover:bg-white"
                >
                  <Icon className="h-4 w-4 text-white transition-colors group-hover:text-[#d44c7d]" aria-hidden />
                </a>
              ))}
            </div>
          </div>

          <div>
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

          <div>
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
