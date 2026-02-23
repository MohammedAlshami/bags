"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const serif = { fontFamily: "var(--font-cormorant), serif" };
const bgWhite = { backgroundColor: "#ffffff" };

export default function LoginPage() {
  const router = useRouter();
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
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error || "Invalid username or password");
      return;
    }
    router.push("/");
    router.refresh();
  };

  return (
    <main className="min-h-screen flex flex-col pt-24 pb-24 md:pt-32 md:pb-32" style={bgWhite}>
      <div className="flex-1 flex flex-col items-center justify-center mx-10 md:mx-20 py-12">
        <div className="w-full max-w-md">
          <p className="text-[10px] uppercase tracking-[0.35em] text-gray-500">Account</p>
          <h1 className="mt-2 text-4xl font-light text-neutral-900 md:text-5xl" style={serif}>
            Login
          </h1>

          {error && (
            <p className="mt-4 text-sm text-red-600" role="alert">{error}</p>
          )}
          <form onSubmit={handleSubmit} className="mt-10 space-y-8">
            <div>
              <label htmlFor="login-username" className="block text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-2">
                Username
              </label>
              <input
                id="login-username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                required
                className="w-full border-b border-neutral-200 bg-transparent py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label htmlFor="login-password" className="block text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-2">
                Password
              </label>
              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full border-b border-neutral-200 bg-transparent py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none transition-colors"
              />
            </div>
            <div className="flex flex-col gap-6">
              <button
                type="submit"
                className="w-full border border-black bg-black py-4 text-sm font-medium text-white uppercase tracking-widest transition-colors hover:bg-neutral-800"
              >
                Sign in
              </button>
              <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
                <Link
                  href="/login/forgot-password"
                  className="text-gray-600 transition-colors hover:text-black hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
            </div>
          </form>

          <p className="mt-12 text-center text-xs text-gray-500">
            By signing in, you agree to our{" "}
            <Link href="#" className="underline hover:text-black">Terms</Link>
            {" "}and{" "}
            <Link href="#" className="underline hover:text-black">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </main>
  );
}
