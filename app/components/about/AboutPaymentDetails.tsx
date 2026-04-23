import { Banknote, CheckCircle2, Clock3, CreditCard, ShieldCheck, Smartphone } from "lucide-react";

const sans = { fontFamily: "var(--font-playpen-arabic), sans-serif" };
const serif = { fontFamily: "var(--font-cormorant), serif" };

const PAYMENT_METHODS = [
  {
    Icon: Smartphone,
    title: "تحويل محفظة / كاش ون",
    body: "رقم المحفظة: 782731816. يرجى إرسال لقطة شاشة أو سند التحويل لتأكيد الطلب.",
  },
  {
    Icon: CreditCard,
    title: "الحسابات البنكية",
    body: "حسابات الكريمي: 3096848233 (يمني) و 3096823095 (سعودي).",
  },
  {
    Icon: Banknote,
    title: "الدفع عند الاستلام",
    body: "متاح لبعض مناطق التوصيل المحلية حسب التغطية، ويتم تأكيده قبل الشحن بعد إضافة بياناتك كاملة.",
  },
] as const;

const NOTES = [
  "يرجى إرسال سند التحويل أو لقطة الشاشة لاعتماد الطلب.",
  "عند اختيار الدفع قبل الاستلام، أضيفي بياناتك كاملة وموقعك بالتفصيل.",
  "التوصيل إلى المحافظات الأخرى يتم بسعر مختلف حسب المدينة وطريقة الشحن.",
  "عادةً يتم اعتماد الطلب بعد التحقق من عملية الدفع أو الحوالة.",
] as const;

export function AboutPaymentDetails() {
  return (
    <section className="w-full bg-[#FAEFF6] py-16 md:py-24" dir="rtl" aria-labelledby="about-payment-heading">
      <div className="mx-auto max-w-6xl px-4 sm:px-8 md:px-14 lg:px-24">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#B63A6B]" style={sans}>
            بيانات التحويل
          </p>
          <h2 id="about-payment-heading" className="mt-3 text-3xl font-semibold text-neutral-900 md:text-5xl" style={serif}>
            طرق الدفع والتأكيد
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-neutral-600 md:text-base" style={sans}>
            نعرض لكِ طرق الدفع المتاحة بشكل واضح حتى يكون طلبكِ أسرع وأسهل، مع توضيح ما يلزم لإتمام التأكيد.
          </p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {PAYMENT_METHODS.map(({ Icon, title, body }) => (
            <article key={title} className="rounded-3xl bg-white p-6 ring-1 ring-black/5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#B63A6B]/10 text-[#B63A6B]">
                <Icon className="h-6 w-6" aria-hidden />
              </div>
              <h3 className="mt-5 text-xl font-semibold text-neutral-900" style={serif}>
                {title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-neutral-600" style={sans}>
                {body}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="rounded-3xl bg-white p-6 ring-1 ring-black/5 md:p-8">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-[#B63A6B]" aria-hidden />
              <h3 className="text-xl font-semibold text-neutral-900" style={serif}>
                ملاحظات مهمة
              </h3>
            </div>
            <ul className="mt-5 space-y-3">
              {NOTES.map((note) => (
                <li key={note} className="flex items-start gap-3 text-sm leading-relaxed text-neutral-700" style={sans}>
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#B63A6B]" aria-hidden />
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-3xl bg-white p-6 ring-1 ring-black/5 md:p-8">
            <div className="flex items-center gap-3">
              <Clock3 className="h-5 w-5 text-[#B63A6B]" aria-hidden />
              <h3 className="text-xl font-semibold text-neutral-900" style={serif}>
                اعتماد الطلب
              </h3>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-neutral-600" style={sans}>
              يرجى إرسال سند الدفع أو لقطة الشاشة بعد التحويل، حتى يتم اعتماد الطلب مباشرة. وفي حال اختيار الشحن
              للمحافظات الأخرى يتم تأكيد تفاصيل التوصيل والسعر قبل الإرسال.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
