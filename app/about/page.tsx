import Link from "next/link";
import Image from "next/image";
import { sans, pagePaddingX, IMAGE_WELL } from "@/lib/page-theme";

export default function AboutPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-white" dir="rtl">
      <section className="relative w-full overflow-hidden bg-neutral-900">
        <div className="relative aspect-[21/9] min-h-[220px] w-full md:aspect-[2.4/1] md:min-h-[320px]">
          <Image
            src="/Pixalated.png"
            alt=""
            fill
            className="object-cover object-[50%_88%]"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-black/35" aria-hidden />
          <div className={`absolute inset-0 flex flex-col items-center justify-center ${pagePaddingX} text-center`}>
            <h1 className="text-3xl font-medium text-white md:text-5xl" style={sans}>
              من نحن
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/90 md:text-base" style={sans}>
              الملكة جولد — عناية مختارة بعناية، وإيمان بأن الجمال يبدأ من الثقة والتفاصيل.
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-neutral-200/80 bg-[#FCF0F2] py-16 md:py-24">
        <div className={`mx-auto max-w-3xl ${pagePaddingX}`}>
          <h2 className="text-center text-xl font-medium text-neutral-900 md:text-2xl" style={sans}>
            قيمنا
          </h2>
          <p className="mt-3 text-center text-sm text-neutral-600" style={sans}>
            ثلاث ركائز نعمل عليها كل يوم
          </p>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {[
              { t: "الجودة", d: "مكوّنات موثوقة وعناية في التفاصيل." },
              { t: "الأمانة", d: "وصف واضح وأسعار شفافة." },
              { t: "الخدمة", d: "شحن وإرجاع مُبسّطان لراحتكِ." },
            ].map((row) => (
              <div
                key={row.t}
                className="rounded-2xl border border-neutral-200/80 bg-white p-6 text-center shadow-sm"
                style={sans}
              >
                <h3 className="text-lg font-semibold text-neutral-900">{row.t}</h3>
                <p className="mt-3 text-sm leading-relaxed text-neutral-600">{row.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={`mx-auto max-w-3xl py-16 ${pagePaddingX} md:py-24`}>
        <div
          className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl"
          style={{ backgroundColor: IMAGE_WELL }}
        >
          <Image
            src="/losing_weigh_herbs.png"
            alt=""
            fill
            className="object-contain p-8"
            sizes="(max-width: 768px) 100vw, 48rem"
          />
        </div>
        <div className="mt-12 text-center">
          <Link
            href="/shop"
            className="inline-flex rounded-full bg-neutral-900 px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-neutral-800"
            style={sans}
          >
            تسوقي المنتجات
          </Link>
        </div>
      </section>
    </main>
  );
}
