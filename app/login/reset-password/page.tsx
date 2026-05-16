"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { sans, pagePaddingX } from "@/lib/page-theme";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  if (!token) {
    return (
      <main className="flex min-h-screen flex-col bg-white pb-24 pt-24 md:pb-32 md:pt-32" dir="rtl">
        <div className={`mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center py-12 ${pagePaddingX}`}>
          <p className="text-sm text-red-600" style={sans}>
            الرابط غير صالح أو منتهي الصلاحية.
          </p>
          <p className="mt-6 text-center">
            <Link href="/login/forgot-password" className="text-sm text-neutral-600 hover:text-black hover:underline" style={sans}>
              طلب رابط جديد
            </Link>
          </p>
        </div>
      </main>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("كلمتا المرور غير متطابقتين.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
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
      setDone(true);
      setTimeout(() => router.push("/login"), 3000);
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
          تعيين كلمة مرور جديدة
        </h1>

        {done ? (
          <div className="mt-10">
            <div className="rounded-2xl border border-neutral-100 bg-neutral-50 p-6" style={sans}>
              <p className="text-sm leading-relaxed text-neutral-700">
                تم تغيير كلمة المرور بنجاح. سيتم تحويلك لصفحة تسجيل الدخول…
              </p>
            </div>
            <p className="mt-6 text-center">
              <Link href="/login" className="text-sm text-neutral-600 hover:text-black hover:underline" style={sans}>
                تسجيل الدخول الآن
              </Link>
            </p>
          </div>
        ) : (
          <>
            {error && (
              <p className="mt-4 text-sm text-red-600" role="alert" style={sans}>
                {error}
              </p>
            )}

            <form onSubmit={handleSubmit} className="mt-10 space-y-8">
              <div>
                <label htmlFor="reset-password" className="mb-2 block text-xs text-neutral-500" style={sans}>
                  كلمة المرور الجديدة
                </label>
                <input
                  id="reset-password"
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
                <label htmlFor="reset-confirm" className="mb-2 block text-xs text-neutral-500" style={sans}>
                  تأكيد كلمة المرور
                </label>
                <input
                  id="reset-confirm"
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

              <button
                type="submit"
                disabled={loading}
                className="qgb-btn-primary h-13 w-full text-sm disabled:pointer-events-none disabled:opacity-45"
                style={sans}
              >
                {loading ? "جاري الحفظ…" : "حفظ كلمة المرور"}
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen flex-col items-center justify-center bg-white" dir="rtl">
          <p className="text-neutral-500" style={sans}>
            جاري التحميل…
          </p>
        </main>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
