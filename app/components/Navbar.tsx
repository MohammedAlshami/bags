"use client";

import Link from "next/link";
import { useState } from "react";

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

  return (
    <header
      className="fixed left-0 right-0 top-0 z-50 pt-3 pb-6 transition-all duration-300"
      style={{ backgroundColor: "#ffffff" }}
      onMouseLeave={() => setActiveMenu(null)}
    >
      <nav className="relative z-50 flex w-full flex-col items-center gap-4 px-14 md:px-24">
        <Link href="/" className="text-3xl font-medium tracking-wide text-black" style={brandStyle}>
          Carol Bouwer
        </Link>
        <div className="flex w-full items-center justify-between border-t border-black/[0.06] pt-4">
          <button
            onMouseEnter={() => setActiveMenu("menu")}
            onClick={() => setActiveMenu(activeMenu === "menu" ? null : "menu")}
            className="flex items-center gap-2 text-gray-600 transition-colors hover:text-black"
          >
            <MenuIcon className="h-5 w-5" />
            <span className="text-sm font-medium">Menu</span>
          </button>
          <div className="flex items-center gap-8 text-sm font-medium text-gray-600">
            <Link href="#shop" className="transition-colors hover:text-black hover:underline">
              Shop
            </Link>
            <button
              onMouseEnter={() => setActiveMenu("collections")}
              className="transition-colors hover:text-black hover:underline focus:outline-none"
            >
              Collections
            </button>
            <Link href="#about" className="transition-colors hover:text-black hover:underline">
              About
            </Link>
          </div>
          <div className="flex items-center gap-4 text-sm font-medium text-gray-600">
            <span>Search</span>
            <span>Cart (0)</span>
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
        <div className="flex w-full gap-16 px-10 py-14 md:px-20">
          <div className="w-1/4">
            <p
              className="mb-6 text-2xl italic text-gray-400"
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
          <div className="flex flex-1 gap-8">
            {[1, 2, 3].map((i) => (
              <Link key={i} href="#" className="group flex-1">
                <div className="mb-4 aspect-[3/4] overflow-hidden bg-black/[0.04]">
                  <div className="h-full w-full bg-black/[0.06] transition-transform duration-700 group-hover:scale-[1.02]" />
                </div>
                <p className="text-sm font-medium text-black/80">Featured {i}</p>
                <p className="text-xs text-gray-500 tracking-wide">Shop Now</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
