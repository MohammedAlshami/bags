import Link from "next/link";
import { Check, Instagram, Leaf, MessageCircle, Sparkles } from "lucide-react";

const sans = { fontFamily: "var(--font-playpen-arabic), sans-serif" };
const serif = { fontFamily: "var(--font-cormorant), serif" };

const FEATURES = [
  { Icon: Check, label: "لجميع أنواع البشرة" },
  { Icon: Leaf, label: "مكوّنات طبيعية" },
  { Icon: Sparkles, label: "لطيف على الحساسية" },
] as const;

export function AboutBrandStory() {
  return (
    <section className="w-full bg-white py-20 md:py-28" dir="rtl">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-8 md:px-10">
        <h2
          className="text-2xl font-normal leading-snug text-neutral-900 md:text-4xl md:leading-tight lg:text-[2.75rem]"
          style={serif}
        >
          نصنع منتجات نظيفة ومسؤولة بمكوّنات نختارها بعناية — لبشرة أجمل وعالم أنظف، لأنكِ تستحقين الأفضل دون
          مساومة.
        </h2>
        <p className="mx-auto mt-10 max-w-2xl text-sm leading-relaxed text-neutral-600 md:text-base" style={sans}>
          بشرتكِ تحمل مسؤولية حمايتكِ من العوامل الخارجية، وتستحق لمسة طبيعية تكشف قوتكِ ورقتكِ. نقدّم لكِ عناية
          متكاملة بالجسم والبشرة والشعر، بفعالية عالية ونتائج تدريجية آمنة.
        </p>

        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-6">
          {FEATURES.map(({ Icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-3 text-center">
              <Icon className="h-8 w-8 text-neutral-900" strokeWidth={1.25} aria-hidden />
              <span className="text-xs font-semibold uppercase tracking-wide text-neutral-800 md:text-sm" style={sans}>
                {label}
              </span>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-20 max-w-lg text-center">
          <h3 className="text-xl font-medium tracking-tight text-neutral-900 md:text-2xl" style={serif}>
            تواصل معنا
          </h3>
          <p className="mt-3 text-xs text-neutral-500 md:text-sm" style={sans}>
            نحن هنا لأي استفسار
          </p>
          <div className="mt-8 flex flex-col items-center gap-6 sm:flex-row sm:justify-center sm:gap-12">
            <Link
              href="https://www.instagram.com/queen__007696"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2.5 text-neutral-800 transition-colors hover:text-[#B63A6B]"
              style={sans}
            >
              <Instagram className="h-5 w-5 shrink-0 text-neutral-600 transition-colors group-hover:text-[#B63A6B]" strokeWidth={1.5} />
              <span className="text-sm md:text-base">
                إنستغرام وتيك توك: <span className="font-semibold">queen__007696</span>
              </span>
            </Link>
            <Link
              href="https://wa.me/967782183149"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2.5 text-neutral-800 transition-colors hover:text-[#25D366]"
              style={sans}
            >
              <MessageCircle className="h-5 w-5 shrink-0 text-neutral-600 transition-colors group-hover:text-[#25D366]" strokeWidth={1.5} />
              <span className="text-sm md:text-base">
                واتساب: <span className="font-semibold tabular-nums">782183149</span>
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
