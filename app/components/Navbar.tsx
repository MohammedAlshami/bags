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

const MenuIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <line x1="4" x2="20" y1="12" y2="12" />
    <line x1="4" x2="20" y1="6" y2="6" />
    <line x1="4" x2="20" y1="18" y2="18" />
  </svg>
);

export default function Navbar() {
  const brandStyle = { fontFamily: "var(--font-cormorant), serif" };
  const [activeMenu, setActiveMenu] = useState<"menu" | "collections" | null>(null);
  const [user, setUser] = useState<{ username: string; role: string } | null>(null);
  const pathname = usePathname();
  const { count } = useCart();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => setUser(data.user ?? null));
  }, [pathname]);

  return (
    <header
      className="fixed left-0 right-0 top-0 z-50 pt-3 pb-6 transition-all duration-300"
      style={{ backgroundColor: "#ffffff" }}
      onMouseLeave={() => setActiveMenu(null)}
    >
      <nav className="relative z-50 flex w-full flex-col items-center gap-4 px-4 sm:px-8 md:px-14 lg:px-24">
        <Link href="/" className="text-2xl sm:text-3xl font-medium tracking-wide text-black" style={brandStyle}>
          Carol Bouwer
        </Link>
        <div className="flex w-full items-center justify-between border-t border-black/[0.06] pt-4 gap-4">
          <button
            onMouseEnter={() => setActiveMenu("menu")}
            onClick={() => setActiveMenu(activeMenu === "menu" ? null : "menu")}
            className="flex items-center gap-2 text-gray-600 transition-colors hover:text-black shrink-0"
          >
            <MenuIcon className="h-5 w-5" />
            <span className="text-sm font-medium">Menu</span>
          </button>
          <div className="flex items-center gap-4 sm:gap-6 md:gap-8 text-sm font-medium text-gray-600 shrink-0">
            <Link href="/shop" className="transition-colors hover:text-black hover:underline whitespace-nowrap">
              Shop
            </Link>
            <Link
              href="/collections"
              onMouseEnter={() => setActiveMenu("collections")}
              className="transition-colors hover:text-black hover:underline whitespace-nowrap"
            >
              Collections
            </Link>
            <Link href="#about" className="transition-colors hover:text-black hover:underline whitespace-nowrap hidden sm:inline">
              About
            </Link>
          </div>
          <div className="flex items-center gap-4 sm:gap-6 shrink-0">
            {user ? (
              <Link href="/profile" className="text-sm font-medium text-gray-600 hover:text-black transition-colors whitespace-nowrap">
                Profile
              </Link>
            ) : (
              <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-black transition-colors whitespace-nowrap">
                Login
              </Link>
            )}
            <Link href="/cart" className="text-sm font-medium text-gray-600 hover:text-black transition-colors whitespace-nowrap">
              Cart ({count})
            </Link>
          </div>
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
