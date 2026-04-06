"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Truck } from "lucide-react";
import { sans, pagePaddingX } from "@/lib/page-theme";

type TrackResult = {
  orderId: string;
  status: string;
  trackingNumber: string | null;
  carrier: string | null;
  shippedAt: string | null;
};

function statusAr(s: string) {
  const m: Record<string, string> = {
    pending: "قيد الانتظار",
    processing: "قيد التجهيز",
    shipped: "تم الشحن",
    delivered: "تم التسليم",
    cancelled: "ملغاة",
  };
  return m[s] ?? s;
}

export default function TrackContent() {
  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<TrackResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const id = searchParams.get("orderId")?.trim();
    if (id) setOrderId(id);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    const id = orderId.trim();
    const em = email.trim();
    if (!id || !em) {
      setError("يرجى إدخال رقم الطلب والبريد الإلكتروني.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/track?orderId=${encodeURIComponent(id)}&email=${encodeURIComponent(em)}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "لم يُعثر على الطلب. تحققي من الرقم والبريد.");
        return;
      }
      setResult(data);
    } catch {
      setError("حدث خطأ. حاولي مرة أخرى.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white py-16 md:py-24" dir="rtl">
      <div className={`mx-auto max-w-xl ${pagePaddingX}`}>
        <p className="text-xs text-neutral-500" style={sans}>
          التتبع
        </p>
        <h1 className="mt-2 text-3xl font-medium text-neutral-900 md:text-4xl" style={sans}>
          تتبع الطلب
        </h1>
        <p className="mt-3 text-sm text-neutral-600" style={sans}>
          أدخلي رقم الطلب من رسالة التأكيد والبريد المستخدم عند الشراء.
        </p>

        <form onSubmit={handleSubmit} className="mb-10 mt-8 space-y-4">
          <div>
            <label htmlFor="orderId" className="mb-1 block text-xs text-neutral-500" style={sans}>
              رقم الطلب
            </label>
            <input
              id="orderId"
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="w-full border border-black/20 px-4 py-3 text-sm focus:border-black focus:outline-none"
              style={sans}
            />
          </div>
          <div>
            <label htmlFor="email" className="mb-1 block text-xs text-neutral-500" style={sans}>
              البريد الإلكتروني
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-black/20 px-4 py-3 text-sm focus:border-black focus:outline-none"
              style={sans}
            />
          </div>
          {error && (
            <p className="text-sm text-red-600" style={sans}>
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-neutral-900 py-3 text-sm font-semibold text-white disabled:opacity-50"
            style={sans}
          >
            {loading ? "جاري البحث…" : "تتبع"}
          </button>
        </form>

        {result && (
          <div className="rounded-sm border border-black/10 bg-white p-6 md:p-8">
            <div className="mb-5 flex items-center gap-2">
              <Truck className="h-5 w-5 text-neutral-500" strokeWidth={1.25} />
              <h2 className="text-lg font-medium text-black" style={sans}>
                حالة الطلب
              </h2>
            </div>
            <dl className="space-y-4 text-sm">
              <div>
                <dt className="text-xs text-neutral-500" style={sans}>
                  الحالة
                </dt>
                <dd className="mt-0.5 text-neutral-900" style={sans}>
                  {statusAr(result.status)}
                </dd>
              </div>
              {result.carrier && (
                <div>
                  <dt className="text-xs text-neutral-500" style={sans}>
                    الناقل
                  </dt>
                  <dd className="mt-0.5 text-neutral-900" style={sans}>
                    {result.carrier}
                  </dd>
                </div>
              )}
              {result.trackingNumber && (
                <div>
                  <dt className="text-xs text-neutral-500" style={sans}>
                    رقم التتبع
                  </dt>
                  <dd className="mt-0.5 font-mono text-neutral-900">{result.trackingNumber}</dd>
                </div>
              )}
              {result.shippedAt && (
                <div>
                  <dt className="text-xs text-neutral-500" style={sans}>
                    تاريخ الشحن
                  </dt>
                  <dd className="mt-0.5 text-neutral-700" style={sans}>
                    {new Date(result.shippedAt).toLocaleDateString("ar-SA", { dateStyle: "medium" })}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        )}
      </div>
    </main>
  );
}
