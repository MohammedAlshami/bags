"use client";

import Link from "next/link";
import { SafeImage } from "@/app/components/SafeImage";
import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart } from "@/app/context/CartContext";
import { sans, pagePaddingX } from "@/lib/page-theme";
import { STORE_LOCATIONS } from "@/lib/store-locations";
import { BANK_TRANSFER_INFO } from "@/lib/bank-info";

function formatSar(n: number) {
  return (
    new Intl.NumberFormat("ar-SA", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n) + " ر.س"
  );
}

type MeUser = { username: string; role: string } | null;

function CartSkeleton() {
  return (
    <main className="min-h-screen bg-white pb-24 pt-24 md:pb-32 md:pt-32" dir="rtl">
      <div className={`mx-auto max-w-[1920px] ${pagePaddingX}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-32 rounded bg-neutral-200" />
          <div className="h-40 rounded bg-neutral-100" />
        </div>
      </div>
    </main>
  );
}

function CartCheckoutInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentOrderId = searchParams.get("payment");

  const { items, removeFromCart, updateQuantity, subtotal, clearCart } = useCart();
  const [me, setMe] = useState<MeUser | undefined>(undefined);
  const [branchKey, setBranchKey] = useState<string>(STORE_LOCATIONS[0]?.id ?? "");
  const [placing, setPlacing] = useState(false);
  const [placeError, setPlaceError] = useState<string | null>(null);

  const [paymentOrder, setPaymentOrder] = useState<{
    _id: string;
    total: number;
    status: string;
    paymentProofUrl?: string | null;
  } | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [uploadBusy, setUploadBusy] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setMe(d.user ?? null))
      .catch(() => setMe(null));
  }, []);

  useEffect(() => {
    if (!paymentOrderId) {
      setPaymentOrder(null);
      return;
    }
    setPaymentLoading(true);
    setPaymentError(null);
    fetch(`/api/me/orders/${paymentOrderId}`, { credentials: "include" })
      .then((r) => {
        if (r.status === 401) {
          router.replace(`/login?next=${encodeURIComponent(`/cart?payment=${paymentOrderId}`)}`);
          return null;
        }
        if (!r.ok) throw new Error("Failed to load order");
        return r.json();
      })
      .then((data) => {
        if (data) {
          setPaymentOrder({
            _id: data._id,
            total: data.total,
            status: data.status,
            paymentProofUrl: data.paymentProofUrl ?? null,
          });
        }
      })
      .catch(() => setPaymentError("تعذر تحميل الطلب."))
      .finally(() => setPaymentLoading(false));
  }, [paymentOrderId, router]);

  const placeOrder = useCallback(async () => {
    if (!branchKey || items.length === 0) return;
    setPlacing(true);
    setPlaceError(null);
    try {
      const res = await fetch("/api/me/orders", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          branchKey,
          items: items.map((i) => ({
            slug: i.slug,
            name: i.name,
            price: i.price,
            quantity: i.quantity,
            image: i.image,
          })),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) {
        router.push(`/login?next=${encodeURIComponent("/cart")}`);
        return;
      }
      if (!res.ok) {
        const err = typeof data.error === "string" ? data.error : "";
        throw new Error(err || "تعذر إنشاء الطلب");
      }
      clearCart();
      router.replace(`/cart?payment=${data._id}`);
    } catch (e) {
      setPlaceError(e instanceof Error ? e.message : "خطأ");
    } finally {
      setPlacing(false);
    }
  }, [branchKey, items, clearCart, router]);

  const uploadSlip = async (file: File) => {
    if (!paymentOrderId || !paymentOrder) return;
    setUploadBusy(true);
    setPaymentError(null);
    try {
      const fd = new FormData();
      fd.set("file", file);
      const up = await fetch("/api/me/upload", { method: "POST", body: fd, credentials: "include" });
      const upData = await up.json().catch(() => ({}));
      if (!up.ok) {
        const err = typeof upData.error === "string" ? upData.error : "";
        throw new Error(err || "فشل رفع الملف");
      }
      const url = typeof upData.url === "string" ? upData.url : "";
      if (!url) throw new Error("فشل رفع الملف");

      const patch = await fetch(`/api/me/orders/${paymentOrderId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentProofUrl: url }),
      });
      const pData = await patch.json().catch(() => ({}));
      if (!patch.ok) {
        const err = typeof pData.error === "string" ? pData.error : "";
        throw new Error(err || "تعذر حفظ إثبات الدفع");
      }
      setPaymentOrder({
        _id: pData._id,
        total: pData.total,
        status: pData.status,
        paymentProofUrl: pData.paymentProofUrl ?? null,
      });
    } catch (e) {
      setPaymentError(e instanceof Error ? e.message : "خطأ");
    } finally {
      setUploadBusy(false);
    }
  };

  const isCustomer = me?.role === "customer";
  const showPaymentStep = Boolean(paymentOrderId);

  if (me === undefined) {
    return <CartSkeleton />;
  }

  if (showPaymentStep) {
    return (
      <main className="min-h-screen bg-white pb-24 pt-24 md:pb-32 md:pt-32" dir="rtl">
        <div className={`mx-auto max-w-2xl ${pagePaddingX}`}>
          <p className="text-xs text-neutral-500" style={sans}>
            الدفع
          </p>
          <h1 className="mt-2 text-3xl font-medium text-neutral-900 md:text-4xl" style={sans}>
            إتمام الدفع
          </h1>
          <p className="mt-2 text-sm text-neutral-600" style={sans}>
            حوّل المبلغ إلى حسابنا، ثم ارفع صورة إثبات التحويل. اذكر رقم الطلب في وصف التحويل إن أمكن.
          </p>

          {paymentLoading ? (
            <div className="mt-10 animate-pulse space-y-4">
              <div className="h-32 rounded-xl bg-neutral-100" />
              <div className="h-24 rounded-xl bg-neutral-100" />
            </div>
          ) : paymentError && !paymentOrder ? (
            <p className="mt-8 text-red-600" style={sans}>
              {paymentError}
            </p>
          ) : paymentOrder ? (
            <div className="mt-10 space-y-8">
              <section className="rounded-2xl border border-neutral-200 bg-[#FCF0F2]/40 p-6">
                <p className="text-xs text-neutral-500" style={sans}>
                  رقم الطلب (انسخيه في ملاحظات التحويل)
                </p>
                <p className="mt-2 font-mono text-lg text-neutral-900 break-all" dir="ltr">
                  {paymentOrder._id}
                </p>
                <p className="mt-4 text-sm text-neutral-700" style={sans}>
                  المبلغ المستحق:{" "}
                  <span className="font-semibold text-neutral-900">{formatSar(Number(paymentOrder.total))}</span>
                </p>
              </section>

              <section className="rounded-2xl border border-neutral-200 bg-white p-6">
                <h2 className="text-lg font-semibold text-neutral-900" style={sans}>
                  بيانات التحويل البنكي
                </h2>
                <dl className="mt-4 space-y-3 text-sm" style={sans}>
                  <div>
                    <dt className="text-neutral-500">البنك</dt>
                    <dd className="font-medium text-neutral-900">{BANK_TRANSFER_INFO.bankName}</dd>
                  </div>
                  <div>
                    <dt className="text-neutral-500">اسم الحساب</dt>
                    <dd className="font-medium text-neutral-900">{BANK_TRANSFER_INFO.accountName}</dd>
                  </div>
                  <div>
                    <dt className="text-neutral-500">الآيبان (IBAN)</dt>
                    <dd className="font-mono text-neutral-900" dir="ltr">
                      {BANK_TRANSFER_INFO.iban}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-neutral-500">رقم الحساب</dt>
                    <dd className="font-mono text-neutral-900" dir="ltr">
                      {BANK_TRANSFER_INFO.accountNumber}
                    </dd>
                  </div>
                </dl>
                <p className="mt-4 text-xs text-neutral-600" style={sans}>
                  {BANK_TRANSFER_INFO.referenceHint}
                </p>
              </section>

              {paymentError ? (
                <p className="text-sm text-red-600" role="alert">
                  {paymentError}
                </p>
              ) : null}

              <section className="rounded-2xl border border-neutral-200 bg-white p-6">
                <h2 className="text-lg font-semibold text-neutral-900" style={sans}>
                  إثبات الدفع
                </h2>
                {paymentOrder.paymentProofUrl ? (
                  <div className="mt-4 space-y-4">
                    <p className="text-sm text-emerald-700" style={sans}>
                      تم رفع إثبات الدفع. سنراجع الطلب قريباً.
                    </p>
                    <div className="relative max-h-80 w-full overflow-hidden rounded-xl border border-neutral-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={paymentOrder.paymentProofUrl}
                        alt="إثبات الدفع"
                        className="max-h-80 w-full object-contain"
                      />
                    </div>
                    <label className="inline-flex cursor-pointer text-sm text-neutral-600 underline">
                      <input
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        disabled={uploadBusy}
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          e.target.value = "";
                          if (f) void uploadSlip(f);
                        }}
                      />
                      {uploadBusy ? "جاري الرفع…" : "استبدال الصورة"}
                    </label>
                  </div>
                ) : (
                  <div className="mt-4">
                    <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50 px-6 py-10 transition-colors hover:border-neutral-400">
                      <input
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        disabled={uploadBusy}
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          e.target.value = "";
                          if (f) void uploadSlip(f);
                        }}
                      />
                      <span className="text-sm font-medium text-neutral-800" style={sans}>
                        {uploadBusy ? "جاري الرفع…" : "اضغط لرفع صورة الحوالة أو الإيصال"}
                      </span>
                      <span className="mt-1 text-xs text-neutral-500">PNG، JPG، WebP</span>
                    </label>
                  </div>
                )}
              </section>

              <div className="flex flex-wrap gap-4">
                <Link
                  href="/profile"
                  className="inline-flex rounded-full border border-neutral-900 bg-neutral-900 px-6 py-3 text-sm font-semibold text-white"
                  style={sans}
                >
                  طلباتي
                </Link>
                <Link href="/shop" className="inline-flex text-sm text-neutral-600 underline" style={sans}>
                  متابعة التسوق
                </Link>
              </div>
            </div>
          ) : null}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white pb-24 pt-24 md:pb-32 md:pt-32" dir="rtl">
      <div className={`mx-auto max-w-[1920px] ${pagePaddingX}`}>
        <div className="mb-8">
          <p className="text-xs text-neutral-500" style={sans}>
            السلة
          </p>
          <h1 className="mt-2 text-3xl font-medium text-neutral-900 md:text-4xl" style={sans}>
            سلّتك
          </h1>
        </div>

        {items.length === 0 ? (
          <div className="py-16 text-center">
            <p className="mb-6 text-neutral-600" style={sans}>
              السلة فارغة.
            </p>
            <Link
              href="/shop"
              className="inline-block rounded-full border border-neutral-900 bg-neutral-900 px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-neutral-800"
              style={sans}
            >
              متابعة التسوق
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-12 lg:flex-row lg:gap-16">
            <div className="flex-1 space-y-8">
              {items.map((item) => (
                <div key={item.slug} className="flex gap-6 border-b border-neutral-100 pb-8">
                  <div className="relative h-32 w-28 shrink-0 overflow-hidden rounded-xl bg-[#FCF0F2] md:h-40 md:w-32">
                    <SafeImage src={item.image} alt={item.name} fill className="object-contain p-2" sizes="128px" />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col justify-between">
                    <div className="flex justify-between gap-4">
                      <div>
                        <h2 className="text-base font-semibold text-neutral-900" style={sans}>
                          {item.name}
                        </h2>
                        <p className="mt-0.5 text-sm text-neutral-500" style={sans}>
                          {item.price}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.slug)}
                        className="shrink-0 text-xs text-neutral-400 transition-colors hover:text-black"
                        style={sans}
                        aria-label={`إزالة ${item.name} من السلة`}
                      >
                        إزالة
                      </button>
                    </div>
                    <div className="mt-4 flex items-center gap-4">
                      <label htmlFor={`qty-${item.slug}`} className="text-xs text-neutral-500" style={sans}>
                        الكمية
                      </label>
                      <select
                        id={`qty-${item.slug}`}
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.slug, Number(e.target.value))}
                        className="border border-neutral-200 bg-white px-3 py-1.5 text-sm text-black focus:outline-none focus:ring-1 focus:ring-neutral-400"
                        style={sans}
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="shrink-0 lg:w-96">
              <div className="sticky top-32 border-t border-neutral-200 pt-8">
                <p className="text-xs text-neutral-500" style={sans}>
                  المجموع الفرعي
                </p>
                <p className="mt-2 text-2xl font-medium text-neutral-900" style={sans}>
                  {formatSar(subtotal)}
                </p>
                <p className="mt-2 text-xs text-neutral-500" style={sans}>
                  يُستكمل الدفع بالتحويل البنكي بعد تأكيد الطلب.
                </p>

                {!isCustomer ? (
                  <div className="mt-6 space-y-3">
                    <p className="text-sm text-neutral-600" style={sans}>
                      سجّلي الدخول لإتمام الطلب واختيار الفرع.
                    </p>
                    <Link
                      href={`/login?next=${encodeURIComponent("/cart")}`}
                      className="block w-full rounded-full bg-neutral-900 py-4 text-center text-sm font-semibold text-white"
                      style={sans}
                    >
                      تسجيل الدخول
                    </Link>
                  </div>
                ) : (
                  <div className="mt-6 space-y-4">
                    <div>
                      <label htmlFor="branch" className="mb-2 block text-sm font-medium text-neutral-800" style={sans}>
                        الفرع المطلوب
                      </label>
                      <select
                        id="branch"
                        value={branchKey}
                        onChange={(e) => setBranchKey(e.target.value)}
                        className="w-full border border-neutral-200 bg-white px-3 py-3 text-sm text-black"
                        style={sans}
                      >
                        {STORE_LOCATIONS.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name} — {b.city}
                          </option>
                        ))}
                      </select>
                      <p className="mt-1 text-xs text-neutral-500" style={sans}>
                        اختاري الفرع الذي تفضّلين استلام الطلب منه أو التنسيق معه.
                      </p>
                    </div>
                    {placeError ? (
                      <p className="text-sm text-red-600" role="alert">
                        {placeError}
                      </p>
                    ) : null}
                    <button
                      type="button"
                      disabled={placing || !branchKey}
                      onClick={() => void placeOrder()}
                      className="w-full rounded-full bg-neutral-900 py-4 text-sm font-semibold text-white transition-colors hover:bg-neutral-800 disabled:opacity-50"
                      style={sans}
                    >
                      {placing ? "جاري إنشاء الطلب…" : "تأكيد الطلب والدفع"}
                    </button>
                  </div>
                )}

                <Link
                  href="/shop"
                  className="mt-4 block text-center text-sm text-neutral-600 underline-offset-2 hover:text-black hover:underline"
                  style={sans}
                >
                  متابعة التسوق
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function CartPage() {
  return (
    <Suspense fallback={<CartSkeleton />}>
      <CartCheckoutInner />
    </Suspense>
  );
}
