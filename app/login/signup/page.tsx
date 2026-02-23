"use client";

import Link from "next/link";
import { useState } from "react";

const serif = { fontFamily: "var(--font-cormorant), serif" };
const bgWhite = { backgroundColor: "#ffffff" };

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder: wire up to your auth provider
  };

  return (
    <main className="min-h-screen flex flex-col pt-24 pb-24 md:pt-32 md:pb-32" style={bgWhite}>
      <div className="flex-1 flex flex-col items-center justify-center mx-10 md:mx-20 py-12">
        <div className="w-full max-w-md">
          <p className="text-[10px] uppercase tracking-[0.35em] text-gray-500">Account</p>
          <h1 className="mt-2 text-4xl font-light text-neutral-900 md:text-5xl" style={serif}>
            Create account
          </h1>
          <form onSubmit={handleSubmit} className="mt-10 space-y-8">
            <div>
              <label htmlFor="signup-email" className="block text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-2">
                Email
              </label>
              <input
                id="signup-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full border-b border-neutral-200 bg-transparent py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label htmlFor="signup-password" className="block text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-2">
                Password
              </label>
              <input
                id="signup-password"
                type="password"
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
                Create account
              </button>
              <p className="text-center text-sm text-gray-600">
                Already have an account?{" "}
                <Link href="/login" className="hover:text-black hover:underline">Sign in</Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
