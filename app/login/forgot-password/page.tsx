"use client";

import Link from "next/link";
import { useState } from "react";
import { sans, pagePaddingX } from "@/lib/page-theme";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
        <p className="mt-4 text-sm text-neutral-600" style={sans}>
          أدخلي بريدك الإلكتروني لإرسال رابط إعادة التعيين عند تفعيل الخدمة.
        </p>
        <form onSubmit={handleSubmit} className="mt-10 space-y-8">
          <div>
            <label htmlFor="forgot-email" className="mb-2 block text-xs text-neutral-500" style={sans}>
              البريد الإلكتروني
            </label>
            <input
              id="forgot-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border-b border-neutral-200 bg-transparent py-3 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none"
              style={sans}
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-full bg-neutral-900 py-4 text-sm font-semibold text-white transition-colors hover:bg-neutral-800"
            style={sans}
          >
            إرسال الرابط
          </button>
        </form>
        <p className="mt-8 text-center">
          <Link href="/login" className="text-sm text-neutral-600 hover:text-black hover:underline" style={sans}>
            العودة لتسجيل الدخول
          </Link>
        </p>
      </div>
    </main>
  );
}
