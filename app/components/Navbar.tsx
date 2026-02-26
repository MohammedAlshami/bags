"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useCart } from "@/app/context/CartContext";

const FALL_COLORS_IMAGES = [
  "/Item pictures/2nd_Green_Bag-removebg-preview.png",
  "/Item pictures/basket_bag-removebg-preview.png",
  "/Item pictures/Black_bag-removebg-preview.png",
];

const SCROLL_THRESHOLD = 24;

export default function Navbar() {
  const brandStyle = { fontFamily: "var(--font-cormorant), serif" };
  const [activeMenu, setActiveMenu] = useState<"menu" | "collections" | null>(null);
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
      className="fixed left-0 right-0 top-0 z-50 transition-all duration-300"
      style={{ backgroundColor: isTransparent ? "transparent" : "#ffffff" }}
      onMouseLeave={() => setActiveMenu(null)}
    >
      <nav className="relative z-50 flex w-full flex-row items-center justify-between px-4 sm:px-8 md:px-14 lg:px-24 py-3">
        <div className={`flex flex-1 items-center justify-start gap-4 sm:gap-6 md:gap-8 text-sm font-medium min-w-0 ${isTransparent ? "text-white/90" : "text-gray-600"}`}>
          <Link href="/shop" className={`transition-colors hover:underline whitespace-nowrap ${isTransparent ? "hover:text-white" : "hover:text-black"}`}>
            Shop
          </Link>
          <Link
            href="/collections"
            onMouseEnter={() => setActiveMenu("collections")}
            className={`transition-colors hover:underline whitespace-nowrap ${isTransparent ? "hover:text-white" : "hover:text-black"}`}
          >
            Collections
          </Link>
          <Link href="#about" className={`transition-colors hover:underline whitespace-nowrap hidden sm:inline ${isTransparent ? "hover:text-white" : "hover:text-black"}`}>
            About
          </Link>
        </div>
        <Link
          href="/"
          className={`text-xl sm:text-2xl font-medium tracking-wide transition-colors duration-300 shrink-0 absolute left-1/2 -translate-x-1/2 ${isTransparent ? "text-white" : "text-black"}`}
          style={brandStyle}
        >
          Carol Bouwer
        </Link>
        <div className={`flex flex-1 items-center justify-end gap-4 sm:gap-6 md:gap-8 text-sm font-medium min-w-0 ${isTransparent ? "text-white/90" : "text-gray-600"}`}>
          {user ? (
            <Link href="/profile" className={`transition-colors whitespace-nowrap ${isTransparent ? "hover:text-white" : "hover:text-black"}`}>
              Profile
            </Link>
          ) : (
            <Link href="/login" className={`transition-colors whitespace-nowrap ${isTransparent ? "hover:text-white" : "hover:text-black"}`}>
              Login
            </Link>
          )}
          <Link href="/cart" className={`transition-colors whitespace-nowrap ${isTransparent ? "hover:text-white" : "hover:text-black"}`}>
            Cart ({count})
          </Link>
        </div>
      </nav>

      {/* Mega Menu */}
      <div
        className={`absolute left-0 right-0 top-full border-t border-black/[0.06] shadow-xl transition-all duration-500 ease-out overflow-hidden`}
        style={{
          backgroundColor: "#ffffff",
          maxHeight: activeMenu ? "500px" : "0",
          opacity: activeMenu ? 1 : 0,
          visibility: activeMenu ? "visible" : "hidden",
        }}
        onMouseEnter={() => setActiveMenu(activeMenu)}
        onMouseLeave={() => setActiveMenu(null)}
      >
        <div className="flex w-full flex-col md:flex-row gap-8 md:gap-16 px-6 py-8 sm:px-10 sm:py-14 md:px-20">
          <div className="w-full md:w-1/4 shrink-0">
            <p
              className="mb-6 text-xl sm:text-2xl italic text-gray-400"
              style={{ fontFamily: "var(--font-cormorant), serif" }}
            >
              {activeMenu === "menu" ? "Explore" : "Collections"}
            </p>
            <ul className="space-y-4">
              {["New Arrivals", "Handbags", "Travel", "Accessories", "Gifts"].map((item) => (
                <li key={item}>
                  <Link
                    href="#"
                    className="text-sm font-medium text-black/80 transition-colors hover:text-black hover:underline"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex gap-4 sm:gap-6 md:gap-8 justify-start md:justify-start flex-wrap max-w-2xl">
            {FALL_COLORS_IMAGES.map((src, i) => (
              <Link key={i} href="/collections" className="group w-[120px] sm:w-[140px] md:w-[160px] shrink-0">
                <div className="relative mb-2 aspect-[3/4] overflow-hidden bg-neutral-100">
                  <Image
                    src={src}
                    alt={`Fall colors ${i + 1}`}
                    fill
                    className="object-contain object-center transition-transform duration-300 ease-out group-hover:scale-[1.03]"
                    sizes="(max-width: 640px) 120px, (max-width: 768px) 140px, 160px"
                  />
                </div>
                <p className="text-xs sm:text-sm font-medium text-black/80">Fall colors</p>
                <p className="text-[10px] sm:text-xs text-gray-500 tracking-wide">Shop Now</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
