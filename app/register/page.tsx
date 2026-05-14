"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { sans, pagePaddingX } from "@/lib/page-theme";
import { ProvinceSelectDropdown } from "@/app/components/ProvinceSelectDropdown";
import { isValidCheckoutProvinceId } from "@/lib/checkout-provinces";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [address, setAddress] = useState("");
  const [provinceId, setProvinceId] = useState("");
  const [phone, setPhone] = useState("");
  const [errorModal, setErrorModal] = useState<{ message: string; detail?: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!errorModal) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setErrorModal(null);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [errorModal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorModal(null);
    if (password !== confirmPassword) {
      setErrorModal({ message: "كلمتا المرور غير متطابقتين." });
      return;
    }
    if (!provinceId.trim() || !isValidCheckoutProvinceId(provinceId)) {
      setErrorModal({ message: "اختر المحافظة." });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim(),
          password,
          address: address.trim(),
          provinceId: provinceId.trim(),
          phone: phone.trim(),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        message?: string;
        error?: string;
        detail?: string;
      };
      if (!res.ok) {
        const msg =
          typeof data.message === "string"
            ? data.message
            : typeof data.error === "string"
              ? data.error
              : "";
        const detail = typeof data.detail === "string" && data.detail.trim() !== "" ? data.detail : undefined;
        setErrorModal({
          message: msg || "تعذّر إنشاء الحساب.",
          ...(detail ? { detail } : {}),
        });
        return;
      }
      router.push("/login");
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col bg-white pb-24 pt-24 md:pb-32 md:pt-32" dir="rtl">
      {errorModal ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" aria-live="assertive">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="إغلاق"
            onClick={() => setErrorModal(null)}
          />
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="register-error-title"
            aria-describedby="register-error-desc"
            className="relative z-[1] w-full max-w-md rounded-2xl border border-black/[0.06] bg-white p-6 shadow-xl ring-1 ring-black/[0.04]"
            style={sans}
          >
            <h2 id="register-error-title" className="text-lg font-medium text-neutral-900">
              تنبيه
            </h2>
            <p id="register-error-desc" className="mt-3 text-sm leading-relaxed text-red-700">
              {errorModal.message}
            </p>
            {errorModal.detail ? (
              <pre
                className="mt-4 max-h-40 overflow-auto rounded-lg bg-neutral-100 p-3 text-start text-xs leading-relaxed text-neutral-700"
                dir="ltr"
              >
                {errorModal.detail}
              </pre>
            ) : null}
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setErrorModal(null)}
                className="qgb-btn-primary rounded-full px-8 py-3 text-sm"
                style={sans}
              >
                حسناً
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className={`mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center py-12 ${pagePaddingX}`}>
        <p className="text-xs text-neutral-500" style={sans}>
          الحساب
        </p>
        <h1 className="mt-2 text-3xl font-medium text-neutral-900 md:text-4xl" style={sans}>
          إنشاء حساب
        </h1>
        <p className="mt-3 text-sm text-neutral-600" style={sans}>
          سجّل بياناتك للطلب والتوصيل. يمكنك لاحقاً تسجيل الدخول بالبريد الإلكتروني وكلمة المرور.
        </p>

        <form onSubmit={handleSubmit} className="mt-10 space-y-8">
          <div>
            <label htmlFor="register-fullName" className="mb-2 block text-xs text-neutral-500" style={sans}>
              الاسم الكامل
            </label>
            <input
              id="register-fullName"
              type="text"
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full border-b border-neutral-200 bg-transparent py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none"
              style={sans}
            />
          </div>
          <div>
            <label htmlFor="register-email" className="mb-2 block text-xs text-neutral-500" style={sans}>
              البريد الإلكتروني
            </label>
            <input
              id="register-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border-b border-neutral-200 bg-transparent py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none"
              style={sans}
              dir="ltr"
            />
          </div>
          <div>
            <label htmlFor="register-password" className="mb-2 block text-xs text-neutral-500" style={sans}>
              كلمة المرور
            </label>
            <input
              id="register-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full border-b border-neutral-200 bg-transparent py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none"
              style={sans}
            />
          </div>
          <div>
            <label htmlFor="register-confirm" className="mb-2 block text-xs text-neutral-500" style={sans}>
              تأكيد كلمة المرور
            </label>
            <input
              id="register-confirm"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="w-full border-b border-neutral-200 bg-transparent py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none"
              style={sans}
            />
          </div>
          <div>
            <label htmlFor="register-address" className="mb-2 block text-xs text-neutral-500" style={sans}>
              عنوان الشحن
            </label>
            <textarea
              id="register-address"
              autoComplete="street-address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              rows={3}
              className="w-full resize-y border-b border-neutral-200 bg-transparent py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none"
              style={sans}
            />
          </div>
          <div>
            <label htmlFor="register-province" className="mb-2 block text-xs text-neutral-500" style={sans}>
              المحافظة
            </label>
            <ProvinceSelectDropdown id="register-province" value={provinceId} onChange={setProvinceId} />
          </div>
          <div>
            <label htmlFor="register-phone" className="mb-2 block text-xs text-neutral-500" style={sans}>
              رقم الجوال
            </label>
            <input
              id="register-phone"
              type="tel"
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="w-full border-b border-neutral-200 bg-transparent py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none"
              style={sans}
              dir="ltr"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="qgb-btn-primary h-13 w-full text-sm disabled:pointer-events-none disabled:opacity-45"
            style={sans}
          >
            {loading ? "جاري الإنشاء…" : "إنشاء الحساب"}
          </button>
        </form>

        <p className="mt-10 text-center text-sm text-neutral-600" style={sans}>
          لديك حساب؟{" "}
          <Link href="/login" className="font-medium text-neutral-900 underline underline-offset-2 hover:no-underline">
            تسجيل الدخول
          </Link>
        </p>
      </div>
    </main>
  );
}
