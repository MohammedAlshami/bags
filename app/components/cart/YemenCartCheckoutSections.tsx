import { sans } from "@/lib/page-theme";
import { yemenTransferFootnotes, yemenTransferPaymentBlocks } from "@/lib/yemen-checkout-transfer";

function Mono({ children }: { children: string }) {
  return (
    <span className="font-mono text-[13px] tabular-nums text-neutral-900" dir="ltr">
      {children}
    </span>
  );
}

/** Full transfer instructions on `/cart?payment=…` */
export function YemenPaymentStepTransferSection() {
  return (
    <div className="space-y-5 text-sm leading-relaxed text-neutral-700" style={sans}>
      <p className="text-neutral-800">
        <span className="me-1" aria-hidden>
          🔻
        </span>
        لتأكيد الطلب يرجى تحويل المبلغ عبر أحد طرق الدفع التالية:
      </p>

      <div className="space-y-4">
        {yemenTransferPaymentBlocks.map((block, index) => (
          <div
            key={block.title}
            className="rounded-xl border border-neutral-200/90 bg-neutral-50/80 px-4 py-3.5 ring-1 ring-neutral-100"
          >
            <p className="font-semibold text-neutral-900">
              {index > 0 ? (
                <span className="me-1.5 text-base" aria-hidden>
                  🔆
                </span>
              ) : null}
              {block.title}
            </p>
            <ul className="mt-2.5 space-y-1.5 text-[13px] text-neutral-700">
              {block.lines.map((line) => {
                const colon = line.indexOf(":");
                if (colon === -1) {
                  return (
                    <li key={line} className="flex items-start gap-2">
                      <span className="mt-1.5 shrink-0 text-[10px] text-brand-primary" aria-hidden>
                        ▪
                      </span>
                      <span>{line}</span>
                    </li>
                  );
                }
                const label = line.slice(0, colon + 1);
                const value = line.slice(colon + 1).trim();
                const showMono = /\d/.test(value) && value.length <= 20;
                return (
                  <li key={line} className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
                    <span className="shrink-0 text-[10px] text-brand-primary pt-1" aria-hidden>
                      ▪
                    </span>
                    <span>{label}</span>
                    {showMono ? <Mono>{value}</Mono> : <span className="font-medium text-neutral-900">{value}</span>}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <div className="space-y-2 rounded-xl border border-amber-200/80 bg-amber-50/50 px-4 py-3 text-[13px] text-neutral-800">
        {yemenTransferFootnotes.map((note) => (
          <p key={note}>
            <span className="me-1" aria-hidden>
              🔻
            </span>
            {note}
          </p>
        ))}
      </div>
    </div>
  );
}

/** Shown in cart sidebar before «تأكيد الطلب» — payment & delivery options */
export function YemenPreCheckoutPaymentDeliveryGuide() {
  return (
    <section
      className="rounded-2xl border border-neutral-200 bg-white p-4 ring-1 ring-neutral-100/80"
      style={sans}
      aria-labelledby="yemen-checkout-guide-title"
    >
      <h2 id="yemen-checkout-guide-title" className="text-sm font-semibold text-neutral-900">
        خيارات الدفع والتوصيل
      </h2>
      <p className="mt-2 text-[11px] leading-relaxed text-neutral-500">
        <span className="me-1" aria-hidden>
          ✳️
        </span>
        راجعي النقاط التالية قبل الدفع؛ أدخلي معلوماتك في خانة العنوان أعلاه كما يلي حسب منطقتك.
      </p>

      <div className="mt-4 space-y-4 text-[13px] leading-relaxed text-neutral-700">
        <div>
          <p className="font-semibold text-neutral-900">إذا كنتِ في صنعاء — يمكن الدفع عند الاستلام</p>
          <p className="mt-1.5 text-neutral-600">أدخلي معلوماتك في العنوان المحفوظ.</p>
          <p className="mt-2 text-xs font-medium text-neutral-500">في حال تواجدك في صنعاء أرسلي الآتي ضمن العنوان أو التواصل:</p>
          <ul className="mt-1.5 space-y-1 ps-1">
            <li className="flex gap-2">
              <span aria-hidden>▶️</span>
              <span>موقعك</span>
            </li>
            <li className="flex gap-2">
              <span aria-hidden>▶️</span>
              <span>رقم التواصل</span>
            </li>
          </ul>
        </div>

        <div className="border-t border-neutral-200/80 pt-4">
          <p className="font-semibold text-neutral-900">إذا كنتِ بمحافظة أخرى — الدفع مسبق مع سعر التوصيل</p>
          <p className="mt-1.5 text-neutral-800">
            <Mono>1000</Mono> ريال يمني، <Mono>8</Mono> ريال سعودي
          </p>
          <p className="mt-2 text-xs font-medium text-neutral-500">في حال تواجدك بمحافظة أخرى أرسلي الآتي:</p>
          <ul className="mt-1.5 space-y-1 ps-1">
            <li className="flex gap-2">
              <span aria-hidden>▶️</span>
              <span>المحافظة</span>
            </li>
            <li className="flex gap-2">
              <span aria-hidden>▶️</span>
              <span>اسم المستلم الثلاثي</span>
            </li>
            <li className="flex gap-2">
              <span aria-hidden>▶️</span>
              <span>رقم التواصل</span>
            </li>
          </ul>
        </div>

        <div className="border-t border-neutral-200/80 pt-4 text-neutral-700">
          <p>
            <span className="me-1" aria-hidden>
              📦
            </span>
            الاستلام يكون من مكتب القدسي. بمجرد وصول الطلب للمكتب يتم التواصل معكم
            <span className="mx-0.5" aria-hidden>
              ⏰
            </span>
            .
          </p>
          <p className="mt-2 text-[13px] text-red-800/90">
            <span className="me-1" aria-hidden>
              🔴
            </span>
            مدة التوصيل من 4 إلى 5 أيام بعد الإيداع كأقصى مدة.
          </p>
        </div>

        <div className="rounded-xl border border-brand-primary/25 bg-brand-light/20 px-3 py-2.5 text-[12px] text-neutral-800">
          <p className="font-semibold text-brand-dark">بعد تأكيد الطلب</p>
          <p className="mt-1 leading-relaxed">
            تظهر حالة «جاري التأكيد» — سيتم التواصل معكِ بعد مراجعة الطلب، ثم تنتقلين إلى الصفحة التالية (مثل صفحة رفع سند التحويل عند اختيار التحويل البنكي).
          </p>
        </div>
      </div>
    </section>
  );
}
