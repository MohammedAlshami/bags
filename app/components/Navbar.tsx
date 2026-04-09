"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useCart } from "@/app/context/CartContext";

const SCROLL_THRESHOLD = 24;

type NavbarProps = {
  /** When true, navbar sits below the home announcement banner. */
  showLandingBanner?: boolean;
};

export default function Navbar({ showLandingBanner = false }: NavbarProps) {
  const brandStyle = { fontFamily: "var(--font-playpen-arabic), sans-serif" };
  const [user, setUser] = useState<{ username: string; role: string } | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { count } = useCart();

  const isHome = pathname === "/";
  const isTransparent = isHome && !scrolled;

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => setUser(data.user ?? null));
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(typeof window !== "undefined" ? window.scrollY > SCROLL_THRESHOLD : false);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed left-0 right-0 z-50 transition-all duration-300 ${showLandingBanner ? "top-10 sm:top-11" : "top-0"}`}
      style={{ backgroundColor: isTransparent ? "transparent" : "#ffffff" }}
    >
      {/* RTL: flex main-start is on the right — nav links sit on the right, login/cart on the left; brand stays physically centered */}
      <nav className="relative z-50 flex w-full flex-row items-center justify-between px-4 sm:px-8 md:px-14 lg:px-24 py-4 sm:py-5 md:py-6">
        <div
          className={`flex flex-1 items-center justify-start gap-4 sm:gap-6 md:gap-8 text-sm font-medium min-w-0 ${isTransparent ? "text-white/90" : "text-gray-600"}`}
        >
          <Link
            href="/shop"
            className={`transition-colors hover:underline whitespace-nowrap ${isTransparent ? "hover:text-white" : "hover:text-black"}`}
          >
            تسوق
          </Link>
          <Link
            href="/about"
            className={`transition-colors hover:underline whitespace-nowrap hidden sm:inline ${isTransparent ? "hover:text-white" : "hover:text-black"}`}
          >
            من نحن
          </Link>
          <Link
            href="/locations"
            className={`transition-colors hover:underline whitespace-nowrap hidden sm:inline ${isTransparent ? "hover:text-white" : "hover:text-black"}`}
          >
            فروعنا
          </Link>
        </div>
        <Link
          href="/"
          className={`text-xl sm:text-2xl font-medium tracking-wide transition-colors duration-300 shrink-0 absolute left-1/2 -translate-x-1/2 ${isTransparent ? "text-white" : "text-black"}`}
          style={brandStyle}
        >
          الملكة جولد
        </Link>
        <div
          className={`flex flex-1 items-center justify-end gap-4 sm:gap-6 md:gap-8 text-sm font-medium min-w-0 ${isTransparent ? "text-white/90" : "text-gray-600"}`}
        >
          {user ? (
            <Link
              href={user.role === "admin" ? "/admin" : "/profile"}
              className={`transition-colors whitespace-nowrap ${isTransparent ? "hover:text-white" : "hover:text-black"}`}
            >
              حسابي
            </Link>
          ) : (
            <Link
              href="/login"
              className={`transition-colors whitespace-nowrap ${isTransparent ? "hover:text-white" : "hover:text-black"}`}
            >
              تسجيل الدخول
            </Link>
          )}
          <Link href="/cart" className={`transition-colors whitespace-nowrap ${isTransparent ? "hover:text-white" : "hover:text-black"}`}>
            السلة ({count})
          </Link>
        </div>
      </nav>
    </header>
  );
}
