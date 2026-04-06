"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { sans, pagePaddingX } from "@/lib/page-theme";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password, role: "customer" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = typeof data.error === "string" ? data.error : "";
        if (msg.includes("taken")) setError("اسم المستخدم مستخدم مسبقاً.");
        else if (msg.includes("required")) setError("يرجى إدخال اسم المستخدم وكلمة المرور.");
        else setError(msg || "تعذّر إنشاء الحساب.");
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
      <div className={`mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center py-12 ${pagePaddingX}`}>
        <p className="text-xs text-neutral-500" style={sans}>
          الحساب
        </p>
        <h1 className="mt-2 text-3xl font-medium text-neutral-900 md:text-4xl" style={sans}>
          إنشاء حساب
        </h1>

        {error && (
          <p className="mt-4 text-sm text-red-600" role="alert" style={sans}>
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-10 space-y-8">
          <div>
            <label htmlFor="register-username" className="mb-2 block text-xs text-neutral-500" style={sans}>
              اسم المستخدم
            </label>
            <input
              id="register-username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full border-b border-neutral-200 bg-transparent py-3 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none"
              style={sans}
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
              className="w-full border-b border-neutral-200 bg-transparent py-3 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none"
              style={sans}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-neutral-900 py-4 text-sm font-semibold text-white transition-colors hover:bg-neutral-800 disabled:opacity-50"
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
