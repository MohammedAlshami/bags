import Image from "next/image";
import { HERO_SLIDE_URLS } from "@/lib/hero-images";

const sans = { fontFamily: "var(--font-playpen-arabic), sans-serif" };
const serif = { fontFamily: "var(--font-cormorant), serif" };

/** Darker rose than previous #FDE8EC — matches text column + image wells */
const PINK = "#E8B4C0";
const TEXT = "#000000";

export function AboutSplitShowcase() {
  return (
    <div className="w-full" dir="rtl">
      {/* Row 1: نص يمين، صورة يسار (في RTL: نص أول عمود يمين) */}
      <section
        className="grid grid-cols-1 md:grid-cols-2 md:min-h-[min(70vh,560px)] md:items-stretch"
        style={{ backgroundColor: PINK }}
      >
        <div
          className="order-1 flex flex-col justify-center px-6 py-12 md:order-none md:px-12 md:py-16 lg:px-16"
          style={{ color: TEXT }}
        >
          <h2 className="text-2xl font-semibold leading-snug md:text-4xl md:leading-tight" style={serif}>
            أطلقي تألقكِ — وكوني أكثر جاذبية
          </h2>
          <p className="mt-6 text-sm leading-relaxed md:text-base" style={sans}>
            نؤمن بأن العناية الحقيقية تكشف ثقتكِ ورقتكِ. منتجاتنا مصمّمة لتمنحكِ نتائج تدريجية وآمنة، بعيداً عن
            المكوّنات المزعجة — لتستمتعي بروتين يومي يليق بكِ.
          </p>
          <ul className="mt-8 space-y-3 text-sm md:text-base" style={sans}>
            <li className="flex items-start gap-2">
              <span className="mt-1 text-lg" aria-hidden>
                ✦
              </span>
              <span>توازن بين الفعالية واللطف على البشرة.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 text-lg" aria-hidden>
                ✦
              </span>
              <span>تفاصيل مختارة بعناية لتجربة فاخرة بسيطة.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1 text-lg" aria-hidden>
                ✦
              </span>
              <span>لأنكِ تستحقين عناية لا تشبه إلا نفسكِ.</span>
            </li>
          </ul>
        </div>
        <div className="relative order-2 min-h-[min(50vh,420px)] w-full overflow-hidden md:order-none md:h-full md:min-h-0">
          <Image
            src={HERO_SLIDE_URLS[0]}
            alt=""
            fill
            className="object-cover object-center"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      </section>

      {/* Row 2: صورة يمين، نص يسار */}
      <section
        className="grid grid-cols-1 md:grid-cols-2 md:min-h-[min(70vh,560px)] md:items-stretch"
        style={{ backgroundColor: PINK }}
      >
        <div className="relative order-2 min-h-[min(50vh,420px)] w-full overflow-hidden md:order-1 md:h-full md:min-h-0">
          <Image
            src={HERO_SLIDE_URLS[1]}
            alt=""
            fill
            className="object-cover object-center"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
        <div
          className="order-1 flex flex-col justify-center px-6 py-12 md:order-2 md:px-12 md:py-16 lg:px-16"
          style={{ color: TEXT }}
        >
          <h2 className="text-2xl font-semibold leading-snug md:text-4xl md:leading-tight" style={serif}>
            عناية تبدأ من الثقة
          </h2>
          <p className="mt-6 text-sm leading-relaxed md:text-base" style={sans}>
            من العناية بالبشرة إلى الشعر والجسم — نجمع لكِ ما تحتاجينه في مكان واحد، بجودة مسجّلة ووصف واضح، لأن
            الشفافية جزء من تجربتكِ معنا.
          </p>
        </div>
      </section>
    </div>
  );
}
