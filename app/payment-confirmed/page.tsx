"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { CheckCircle } from "lucide-react";
import { sans, pagePaddingX } from "@/lib/page-theme";

function PaymentConfirmedContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  return (
    <main className="min-h-screen bg-white pb-24 pt-24 md:pb-32 md:pt-32" dir="rtl">
      <div className={`mx-auto max-w-2xl ${pagePaddingX}`}>
        {/* Label */}
        <p className="text-xs text-neutral-500" style={sans}>
          تأكيد الدفع
        </p>

        {/* Heading */}
        <h1 className="mt-2 text-3xl font-medium text-neutral-900 md:text-4xl" style={sans}>
          تم استلام إثبات الدفع
        </h1>

        {/* Sub-text */}
        <p className="mt-2 text-sm text-neutral-600" style={sans}>
          شكراً لك. تم استلام إيصال الحوالة بنجاح وسنراجع طلبك قريباً.
        </p>

        <div className="mt-10 space-y-8">
          {/* Confirmation card */}
          <section className="rounded-2xl border border-emerald-200/80 bg-emerald-50/40 p-6">
            <div className="flex items-start gap-4">
              <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" strokeWidth={2} />
              <div>
                <p className="text-sm font-semibold text-neutral-900" style={sans}>
                  تم استلام الإيصال
                </p>
                {orderId && (
                  <p className="mt-1 text-sm text-neutral-600" style={sans}>
                    رقم الطلب:{" "}
                    <span
                      className="font-mono text-[13px] font-semibold tabular-nums text-neutral-900"
                      dir="ltr"
                    >
                      #{orderId.slice(-8).toUpperCase()}
                    </span>
                  </p>
                )}
                <p className="mt-3 text-sm leading-relaxed text-neutral-600" style={sans}>
                  سنتواصل معك قريباً بعد مراجعة الطلب. يمكنك متابعة حالة الطلب من صفحة الطلبات.
                </p>
              </div>
            </div>
          </section>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href={orderId ? `/profile/orders/${encodeURIComponent(orderId)}` : "/profile"}
              className="inline-flex rounded-full bg-[#B63A6B] px-6 py-3 text-sm font-semibold text-white transition-[filter] hover:brightness-110"
              style={sans}
            >
              حالة الطلب
            </Link>
            <Link
              href="/shop"
              className="inline-flex items-center text-sm text-neutral-600 underline-offset-4 hover:text-neutral-900 hover:underline"
              style={sans}
            >
              متابعة التسوق
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function PaymentConfirmedPage() {
  return (
    <Suspense>
      <PaymentConfirmedContent />
    </Suspense>
  );
}
