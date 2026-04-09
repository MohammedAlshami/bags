"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { sans, pagePaddingX } from "@/lib/page-theme";

function mapLoginError(msg: string): string {
  if (msg.includes("Invalid") || msg.includes("password")) return "اسم المستخدم أو كلمة المرور غير صحيحة.";
  if (msg.includes("required")) return "يرجى إدخال اسم المستخدم وكلمة المرور.";
  return msg || "تعذّر تسجيل الدخول.";
}

function safeNextPath(raw: string | null): string | null {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return null;
  return raw;
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: username.trim(), password }),
      credentials: "include",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(mapLoginError(typeof data.error === "string" ? data.error : ""));
      return;
    }
    const next = safeNextPath(searchParams.get("next"));
    router.push(next ?? "/");
    router.refresh();
  };

  return (
    <main className="flex min-h-screen flex-col bg-white pb-24 pt-24 md:pb-32 md:pt-32" dir="rtl">
      <div className={`mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center py-12 ${pagePaddingX}`}>
        <p className="text-xs text-neutral-500" style={sans}>
          الحساب
        </p>
        <h1 className="mt-2 text-3xl font-medium text-neutral-900 md:text-4xl" style={sans}>
          تسجيل الدخول
        </h1>

        {error && (
          <p className="mt-4 text-sm text-red-600" role="alert" style={sans}>
            {error}
          </p>
        )}
        <form onSubmit={handleSubmit} className="mt-10 space-y-8">
          <div>
            <label htmlFor="login-username" className="mb-2 block text-xs text-neutral-500" style={sans}>
              اسم المستخدم
            </label>
            <input
              id="login-username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full border-b border-neutral-200 bg-transparent py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none"
              style={sans}
            />
          </div>
          <div>
            <label htmlFor="login-password" className="mb-2 block text-xs text-neutral-500" style={sans}>
              كلمة المرور
            </label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border-b border-neutral-200 bg-transparent py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none"
              style={sans}
            />
          </div>
          <div className="flex flex-col gap-6">
            <button
              type="submit"
              className="w-full rounded-full bg-neutral-900 py-4 text-sm font-semibold text-white transition-colors hover:bg-neutral-800"
              style={sans}
            >
              دخول
            </button>
            <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
              <Link href="/login/forgot-password" className="text-neutral-600 transition-colors hover:text-black hover:underline" style={sans}>
                نسيت كلمة المرور؟
              </Link>
            </div>
          </div>
        </form>

        <p className="mt-10 text-center text-xs text-neutral-500" style={sans}>
          ليس لديك حساب؟{" "}
          <Link href="/register" className="font-medium text-neutral-900 underline underline-offset-2 hover:no-underline">
            إنشاء حساب
          </Link>
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
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
      <LoginForm />
    </Suspense>
  );
}
