"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Home, MapPin, ShoppingBag, ShoppingCart, UserCircle2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useCart } from "@/app/context/CartContext";
import { adminIconClassName, pagePaddingX } from "@/lib/page-theme";

type MobileNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

const MOBILE_NAV_ITEMS: MobileNavItem[] = [
  { href: "/", label: "الرئيسية", icon: Home },
  { href: "/shop", label: "تسوق", icon: ShoppingBag },
  { href: "/cart", label: "السلة", icon: ShoppingCart },
  { href: "/profile", label: "حسابي", icon: UserCircle2 },
];

export default function Navbar() {
  const [user, setUser] = useState<{ username: string; role: string } | null>(null);
  const [shopBg, setShopBg] = useState<"white" | "pink">("white");
  const pathname = usePathname();
  const { count } = useCart();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => setUser(data.user ?? null));
  }, [pathname]);

  useEffect(() => {
    const syncShopBg = () => {
      const next = (document.body.dataset.shopBg as "white" | "pink" | undefined) ?? "white";
      setShopBg(next);
    };

    syncShopBg();
    window.addEventListener("shop-bg-change", syncShopBg as EventListener);
    return () => window.removeEventListener("shop-bg-change", syncShopBg as EventListener);
  }, []);

  const isShopPink = pathname === "/shop" && shopBg === "pink";

  return (
    <>
      <header
        className="relative z-50"
        style={{ backgroundColor: isShopPink ? "#FAEFF6" : "#ffffff" }}
      >
        <div className={`mx-auto w-full max-w-[1920px] ${pagePaddingX}`}>
          <nav className="hidden h-16 items-center justify-between lg:flex" dir="ltr">
            <div className="flex items-center gap-6 text-sm font-medium text-gray-600">
              <Link href="/locations" className="whitespace-nowrap transition-colors hover:underline hover:text-black">
                الفروع
              </Link>
              <Link href="/shop" className="whitespace-nowrap transition-colors hover:underline hover:text-black">
                تسوق
              </Link>
              <Link href="/about" className="whitespace-nowrap transition-colors hover:underline hover:text-black">
                من نحن
              </Link>
              {user ? (
                <Link href={user.role === "admin" ? "/admin" : "/profile"} className="whitespace-nowrap transition-colors hover:text-black">
                  حسابي
                </Link>
              ) : (
                <Link href="/login" className="whitespace-nowrap transition-colors hover:text-black">
                  تسجيل الدخول
                </Link>
              )}
              <Link href="/cart" className="whitespace-nowrap transition-colors hover:text-black">
                السلة ({count})
              </Link>
            </div>

            <Link href="/" className="flex shrink-0 items-center gap-3">
              <span className="text-lg font-semibold leading-none text-[#d44c7d]">الملكة جولد</span>
              {/* eslint-disable-next-line @next/next/no-img-element -- local static logo loads faster as a plain image */}
              <img src="/logo_img.png" alt="الملكة جولد" className="h-12 w-auto object-contain" width={160} height={60} />
            </Link>
          </nav>

          <nav className="flex h-14 items-center justify-between lg:hidden" dir="rtl">
            <div className="flex items-center gap-2 shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element -- local static logo loads faster as a plain image */}
              <img src="/logo_img.png" alt="الملكة جولد" className="h-12 w-auto object-contain" width={160} height={60} />
              <span className="self-center text-sm font-medium leading-none text-[#d44c7d]">الملكة جولد</span>
            </div>

            <div className="flex items-center shrink-0">
              <Link href="/locations" className="flex items-center gap-1.5 whitespace-nowrap text-sm font-medium text-gray-600 transition-colors hover:text-black">
                <MapPin className={`h-4 w-4 ${adminIconClassName}`} aria-hidden />
                الفروع
              </Link>
            </div>
          </nav>
        </div>
      </header>

      <div className="fixed inset-x-0 bottom-0 z-50 px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] lg:hidden">
        <nav
          aria-label="التنقل السريع"
          className="mx-auto grid max-w-sm grid-cols-4 place-items-center rounded-full border border-black/5 bg-white/95 px-1.5 py-2 shadow-[0_14px_40px_rgba(0,0,0,0.16)] backdrop-blur-xl"
        >
          {MOBILE_NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const targetHref = href === "/profile" ? (user ? (user.role === "admin" ? "/admin" : "/profile") : "/login") : href;
            const isActive = targetHref === "/" ? pathname === "/" : pathname === targetHref || pathname.startsWith(`${targetHref}/`);

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
