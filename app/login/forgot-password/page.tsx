"use client";

import Link from "next/link";
import { useState } from "react";
import { sans, pagePaddingX } from "@/lib/page-theme";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(
          typeof data.message === "string" && data.message
            ? data.message
            : "حدث خطأ، يرجى المحاولة مجدداً."
        );
        return;
      }
      setSent(true);
    } catch {
      setError("حدث خطأ في الاتصال، يرجى المحاولة مجدداً.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col bg-white pb-24 pt-24 md:pb-32 md:pt-32" dir="rtl">
      <div className={`mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center py-12 ${pagePaddingX}`}>
        <p className="text-xs text-neutral-500" style={sans}>
          الحساب
        </p>
        <h1 className="mt-2 text-3xl font-medium text-neutral-900 md:text-4xl" style={sans}>
          استعادة كلمة المرور
        </h1>

        {sent ? (
          <div className="mt-10">
            <div className="rounded-2xl border border-neutral-100 bg-neutral-50 p-6" style={sans}>
              <p className="text-sm leading-relaxed text-neutral-700">
                إذا كان البريد الإلكتروني مسجّلاً لدينا، ستصلك رسالة تحتوي على رابط إعادة تعيين كلمة المرور.
                يرجى التحقق من صندوق الوارد أو مجلد الرسائل غير المرغوب فيها.
              </p>
              <p className="mt-3 text-xs text-neutral-500">
                الرابط صالح لمدة ساعة واحدة فقط.
              </p>
            </div>
            <p className="mt-8 text-center">
              <Link
                href="/login"
                className="text-sm text-neutral-600 hover:text-black hover:underline"
                style={sans}
              >
                العودة لتسجيل الدخول
              </Link>
            </p>
          </div>
        ) : (
          <>
            <p className="mt-4 text-sm text-neutral-600" style={sans}>
              أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور.
            </p>

            {error && (
              <p className="mt-4 text-sm text-red-600" role="alert" style={sans}>
                {error}
              </p>
            )}

            <form onSubmit={handleSubmit} className="mt-10 space-y-8">
              <div>
                <label htmlFor="forgot-email" className="mb-2 block text-xs text-neutral-500" style={sans}>
                  البريد الإلكتروني
                </label>
                <input
                  id="forgot-email"
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
              <button
                type="submit"
                disabled={loading}
                className="qgb-btn-primary h-13 w-full text-sm disabled:pointer-events-none disabled:opacity-45"
                style={sans}
              >
                {loading ? "جاري الإرسال…" : "إرسال رابط الاستعادة"}
              </button>
            </form>

            <p className="mt-8 text-center">
              <Link
                href="/login"
                className="text-sm text-neutral-600 hover:text-black hover:underline"
                style={sans}
              >
                العودة لتسجيل الدخول
              </Link>
            </p>
          </>
        )}
      </div>
    </main>
  );
}
