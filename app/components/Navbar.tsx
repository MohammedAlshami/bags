"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Home, ShoppingBag, ShoppingCart, UserCircle2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useCart } from "@/app/context/CartContext";
import { adminIconClassName } from "@/lib/page-theme";

const SCROLL_THRESHOLD = 24;

type NavbarProps = Record<string, never>;

type MobileNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  authOnly?: boolean;
};

const MOBILE_NAV_ITEMS: MobileNavItem[] = [
  { href: "/", label: "الرئيسية", icon: Home },
  { href: "/shop", label: "تسوق", icon: ShoppingBag },
  { href: "/cart", label: "السلة", icon: ShoppingCart },
  { href: "/login", label: "حسابي", icon: UserCircle2, authOnly: true },
];

export default function Navbar(_: NavbarProps) {
  const [user, setUser] = useState<{ username: string; role: string } | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { count } = useCart();

  const isHome = pathname === "/";
  const showHeader = !scrolled;
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
    <>
      <header
        className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${showHeader ? "block" : "hidden"}`}
        style={{ backgroundColor: isTransparent ? "transparent" : "#ffffff" }}
      >
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-8 md:px-14 lg:px-24">
          <nav className="hidden h-20 items-center justify-between lg:grid lg:grid-cols-[1fr_auto_1fr]">
            <div className={`flex items-center justify-start gap-6 text-sm font-medium ${isTransparent ? "text-white/90" : "text-gray-600"}`}>
              <Link href="/locations" className={`whitespace-nowrap transition-colors hover:underline ${isTransparent ? "hover:text-white" : "hover:text-black"}`}>
                الفروع
              </Link>
              <Link href="/shop" className={`whitespace-nowrap transition-colors hover:underline ${isTransparent ? "hover:text-white" : "hover:text-black"}`}>
                تسوق
              </Link>
              <Link href="/about" className={`whitespace-nowrap transition-colors hover:underline ${isTransparent ? "hover:text-white" : "hover:text-black"}`}>
                من نحن
              </Link>
            </div>

            <Link href="/" className="shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element -- local static logo loads faster as a plain image */}
              <img src="/logo_img.png" alt="الملكة جولد" className="h-20 w-auto object-contain" width={240} height={90} />
            </Link>

            <div className={`flex items-center justify-end gap-6 text-sm font-medium ${isTransparent ? "text-white/90" : "text-gray-600"}`}>
              {user ? (
                <Link href={user.role === "admin" ? "/admin" : "/profile"} className={`whitespace-nowrap transition-colors ${isTransparent ? "hover:text-white" : "hover:text-black"}`}>
                  حسابي
                </Link>
              ) : (
                <Link href="/login" className={`whitespace-nowrap transition-colors ${isTransparent ? "hover:text-white" : "hover:text-black"}`}>
                  تسجيل الدخول
                </Link>
              )}
              <Link href="/cart" className={`whitespace-nowrap transition-colors ${isTransparent ? "hover:text-white" : "hover:text-black"}`}>
                السلة ({count})
              </Link>
            </div>
          </nav>

          <nav className="relative flex h-16 items-center justify-start lg:hidden">
            <Link href="/locations" className={`whitespace-nowrap text-sm font-medium transition-colors ${isTransparent ? "text-white/90 hover:text-white" : "text-gray-600 hover:text-black"}`}>
              الفروع
            </Link>

            <Link href="/" className="absolute left-1/2 -translate-x-1/2 shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element -- local static logo loads faster as a plain image */}
              <img src="/logo_img.png" alt="الملكة جولد" className="h-14 w-auto object-contain" width={180} height={68} />
            </Link>
          </nav>
        </div>
      </header>

      <div className="fixed inset-x-0 bottom-0 z-50 px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] lg:hidden">
        <nav
          aria-label="التنقل السريع"
          className="mx-auto grid max-w-sm grid-cols-4 rounded-full border border-black/5 bg-white/95 px-2 py-2 shadow-[0_14px_40px_rgba(0,0,0,0.16)] backdrop-blur-xl"
        >
          {MOBILE_NAV_ITEMS.map(({ href, label, icon: Icon, authOnly }) => {
            const targetHref = href === "/login" ? (user ? (user.role === "admin" ? "/admin" : "/profile") : "/login") : href;
            const isActive = targetHref === "/" ? pathname === "/" : pathname === targetHref || pathname.startsWith(`${targetHref}/`);
            const shouldHide = authOnly && !user;

            if (shouldHide) return null;

            return (
              <Link
                key={href}
                href={targetHref}
                className={`relative flex min-w-0 flex-col items-center justify-center gap-1.5 rounded-full px-2 py-1.5 text-[10px] font-medium leading-none transition-colors ${
                  isActive ? "text-black" : "text-neutral-500"
                }`}
              >
                <Icon className={`h-5 w-5 ${adminIconClassName}`} aria-hidden />
                <span className="truncate">{label}</span>
                {href === "/cart" && count > 0 ? (
                  <span className="absolute right-2 top-1 h-5 min-w-5 rounded-full bg-black px-1 text-[10px] leading-5 text-white">
                    {count}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
