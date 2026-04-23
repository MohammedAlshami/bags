"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Home, MapPin, ShoppingBag, ShoppingCart, UserCircle2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useCart } from "@/app/context/CartContext";
import { adminIconClassName, pagePaddingX } from "@/lib/page-theme";

type MobileNavItem = { href: string; label: string; icon: LucideIcon };

const MOBILE_NAV_ITEMS: MobileNavItem[] = [
  { href: "/", label: "\u0627\u0644\u0631\u0626\u064a\u0633\u064a\u0629", icon: Home },
  { href: "/shop", label: "\u062a\u0633\u0648\u0642", icon: ShoppingBag },
  { href: "/cart", label: "\u0627\u0644\u0633\u0644\u0629", icon: ShoppingCart },
  { href: "/profile", label: "\u062d\u0633\u0627\u0628\u064a", icon: UserCircle2 },
];

const TXT = {
  shop: "\u062a\u0633\u0648\u0642",
  blog: "\u0627\u0644\u0645\u062f\u0648\u0646\u0629",
  about: "\u0645\u0646 \u0646\u062d\u0646",
  locations: "\u0646\u0642\u0627\u0637 \u0627\u0644\u0628\u064a\u0639",
  account: "\u062d\u0633\u0627\u0628\u064a",
  login: "\u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062f\u062e\u0648\u0644",
  cart: "\u0627\u0644\u0633\u0644\u0629",
  brand: "\u0627\u0644\u0645\u0644\u0643\u0629 \u062c\u0648\u0644\u062f",
  quickNav: "\u0627\u0644\u062a\u0646\u0642\u0644 \u0627\u0644\u0633\u0631\u064a\u0639",
};

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
      <header className="relative z-50" style={{ backgroundColor: isShopPink ? "#FAEFF6" : "#ffffff" }}>
        <div className={`mx-auto w-full max-w-[1920px] ${pagePaddingX}`}>
          <nav className="hidden h-16 items-center justify-between lg:flex" dir="ltr">
            <div className="flex items-center gap-12 text-sm font-medium text-gray-600" dir="rtl">
              <div className="flex items-center gap-6">
                <Link href="/shop" className="whitespace-nowrap transition-colors hover:underline hover:text-black">{TXT.shop}</Link>
                <Link href="/blog" className="whitespace-nowrap transition-colors hover:underline hover:text-black">{TXT.blog}</Link>
                <Link href="/about" className="whitespace-nowrap transition-colors hover:underline hover:text-black">{TXT.about}</Link>
                <Link href="/locations" className="whitespace-nowrap transition-colors hover:underline hover:text-black">{TXT.locations}</Link>
              </div>

              {user ? (
                <Link href={user.role === "admin" ? "/admin" : "/profile"} className="whitespace-nowrap transition-colors hover:text-black">{TXT.account}</Link>
              ) : (
                <Link href="/login" className="whitespace-nowrap transition-colors hover:text-black">{TXT.login}</Link>
              )}
              <Link href="/cart" className="whitespace-nowrap transition-colors hover:text-black">{TXT.cart} ({count})</Link>
            </div>

            <Link href="/" className="flex shrink-0 items-center gap-3">
              <span className="text-lg font-semibold leading-none text-[#d44c7d]">{TXT.brand}</span>
              <img src="/logo_img.png" alt={TXT.brand} className="h-12 w-auto object-contain" width={160} height={60} />
            </Link>
          </nav>

          <nav className="flex h-14 items-center justify-between lg:hidden" dir="rtl">
            <Link href="/" className="flex shrink-0 items-center gap-2">
              <img src="/logo_img.png" alt={TXT.brand} className="h-12 w-auto object-contain" width={160} height={60} />
              <span className="self-center text-sm font-medium leading-none text-[#d44c7d]">{TXT.brand}</span>
            </Link>
            <div className="flex shrink-0 items-center">
              <Link href="/locations" className="flex items-center gap-1.5 whitespace-nowrap text-sm font-medium text-gray-600 transition-colors hover:text-black">
                <MapPin className={`h-4 w-4 ${adminIconClassName}`} aria-hidden />
                {TXT.locations}
              </Link>
            </div>
          </nav>
        </div>
      </header>

      <div className="fixed inset-x-0 bottom-0 z-50 px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] lg:hidden">
        <nav
          aria-label={TXT.quickNav}
          className="mx-auto grid max-w-sm grid-cols-4 place-items-center rounded-full border border-black/5 bg-white/95 px-1.5 py-2 backdrop-blur-xl"
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
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
