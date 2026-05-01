"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  Menu,
  Search,
  User,
  ShoppingBag,
  ChevronDown,
  X,
  Plus,
  Minus,
} from "lucide-react";
import { useCart } from "@/app/context/CartContext";
import { parsePrice, type CartItem } from "@/lib/cart";
import { pagePaddingX, sans, serif, adminIconClassName } from "@/lib/page-theme";
import { formatSar } from "@/lib/format-sar";
import { SafeImage } from "@/app/components/SafeImage";
import type { NavCategory } from "@/lib/get-nav-categories";
import { Home, MapPin, UserCircle2, ShoppingCart } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const TXT = {
  brand: "الملكة جولد",
  shop: "تسوق",
  blog: "المدونة",
  about: "عن الملكة جولد",
  locations: "نقاط البيع",
  account: "حسابي",
  login: "تسجيل الدخول",
  quickNav: "التنقل السريع",
};

/** Pixels: hide header when scrolling down; show when scrolling up */
const SCROLL_DIR_THRESHOLD = 8;
/** Always show the bar when within this many px of the top */
const SCROLL_TOP_REVEAL_PX = 20;
/** Side cart panel transition duration (ms); keep in sync with `duration-[]` on cart UI */
const CART_DRAWER_MS = 300;

const ABOUT_LINKS = [
  { label: "من نحن", href: "/about" },
  { label: "المدونة", href: "/blog" },
  { label: "نقاط البيع", href: "/locations" },
] as const;

function splitInto3(cats: NavCategory[]): [NavCategory[], NavCategory[], NavCategory[]] {
  if (cats.length === 0) return [[], [], []];
  const a = Math.ceil(cats.length / 3);
  const b = Math.ceil((cats.length - a) / 2) + a;
  return [cats.slice(0, a), cats.slice(a, b), cats.slice(b)];
}

const MEGA_TITLES = ["تسوقي حسب الفئة", "اكتشفي المزيد", "مختارات"] as const;

function getMainNavMenu(): MenuItemConfig[] {
  return [
    { id: "home", label: "الرئيسية", href: "/" },
    { id: "shop", label: "تسوق", hasMega: true as const },
    { id: "about", label: TXT.about, hasDropdown: true as const, aboutLinks: [...ABOUT_LINKS] },
    { id: "blog", label: "المدونة", href: "/blog" },
    { id: "presets", label: "تشكيلة المجموعات", hasMega: true as const },
  ];
}

type AboutLink = { label: string; href: string };

type MenuItemConfig = {
  id: string;
  label: string;
  href?: string;
  hasMega?: boolean;
  hasDropdown?: boolean;
  aboutLinks?: readonly AboutLink[];
};

type MobileNavItem = { href: string; label: string; icon: LucideIcon };
const MOBILE_NAV_ITEMS: MobileNavItem[] = [
  { href: "/", label: "الرئيسية", icon: Home },
  { href: "/shop", label: "تسوق", icon: ShoppingBag },
  { href: "/cart", label: "السلة", icon: ShoppingCart },
  { href: "/profile", label: "حسابي", icon: UserCircle2 },
];

function lineTotalString(item: CartItem): string {
  return formatSar(parsePrice(item.price) * item.quantity);
}

/** Shop-page-style cards for «تشكيلة المجموعات» mega only (not «تسوق»). */
function NavMegaCategoryCard({ c }: { c: NavCategory }) {
  const img = c.image?.trim();
  return (
    <Link
      href={`/shop?category=${encodeURIComponent(c.id)}`}
      className="group relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-neutral-100 outline-none ring-0 transition hover:opacity-[0.98] focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2"
      prefetch
    >
      {img ? (
        <SafeImage
          src={img}
          alt={c.name}
          fill
          className="object-cover object-center transition duration-700 ease-out group-hover:scale-[1.05]"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-200 to-neutral-100" aria-hidden />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent" aria-hidden />
      <div className="absolute inset-x-0 bottom-0 flex flex-col items-stretch p-4 text-right text-white md:p-5">
        <p className="text-sm font-medium text-white/85 md:text-base" style={sans}>
          ( {c.productCount.toLocaleString("ar-SA")} منتج )
        </p>
        <h3
          className="mt-1 text-xl font-semibold leading-snug md:text-2xl lg:text-[1.65rem]"
          style={serif}
        >
          {c.name}
        </h3>
        <span
          className="mt-4 inline-flex w-fit self-end border border-white/90 px-4 py-2 text-xs font-semibold tracking-[0.14em] text-white md:text-[13px]"
          style={sans}
        >
          عرض المنتجات
        </span>
      </div>
    </Link>
  );
}

type NavbarProps = {
  categories: NavCategory[];
};

export default function Navbar({ categories }: NavbarProps) {
  const [user, setUser] = useState<{ username: string; role: string } | null>(null);
  const [shopBg, setShopBg] = useState<"white" | "pink">("white");
  const pathname = usePathname();
  const { items, count, removeFromCart, updateQuantity, subtotal } = useCart();

  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [headerBarVisible, setHeaderBarVisible] = useState(true);
  const [headerSpacerPx, setHeaderSpacerPx] = useState(100);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartMounted, setCartMounted] = useState(false);
  const [cartDrawerEnter, setCartDrawerEnter] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const lastScrollY = useRef(0);
  const headerShellRef = useRef<HTMLElement | null>(null);

  const isShopPink = pathname === "/shop" && shopBg === "pink";

  const shopMegaCategories = useMemo(
    () => categories.filter((c) => c.productCount > 0),
    [categories]
  );

  const shopMegaColumns = useMemo(() => splitInto3(categories), [categories]);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
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

  useEffect(() => {
    if (cartOpen) {
      setCartMounted(true);
      const a = requestAnimationFrame(() => {
        requestAnimationFrame(() => setCartDrawerEnter(true));
      });
      return () => cancelAnimationFrame(a);
    }
    setCartDrawerEnter(false);
    const t = window.setTimeout(() => setCartMounted(false), CART_DRAWER_MS);
    return () => window.clearTimeout(t);
  }, [cartOpen]);

  useLayoutEffect(() => {
    const el = headerShellRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setHeaderSpacerPx(el.offsetHeight);
    });
    ro.observe(el);
    setHeaderSpacerPx(el.offsetHeight);
    return () => ro.disconnect();
  }, [activeMenu, pathname, isShopPink, scrolled]);

  useEffect(() => {
    const onScroll = () => {
      const y = Math.max(0, window.scrollY);
      setScrolled(y > 20);
      if (cartMounted || mobileMenuOpen) {
        lastScrollY.current = y;
        return;
      }
      if (y < SCROLL_TOP_REVEAL_PX) {
        setHeaderBarVisible(true);
        lastScrollY.current = y;
        return;
      }
      const delta = y - lastScrollY.current;
      if (delta > SCROLL_DIR_THRESHOLD) {
        setHeaderBarVisible(false);
        setActiveMenu(null);
        setCurrencyOpen(false);
      } else if (delta < -SCROLL_DIR_THRESHOLD) {
        setHeaderBarVisible(true);
      }
      lastScrollY.current = y;
    };
    lastScrollY.current = typeof window !== "undefined" ? window.scrollY : 0;
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [cartMounted, mobileMenuOpen]);

  useEffect(() => {
    if (!cartMounted && !mobileMenuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [cartMounted, mobileMenuOpen]);

  useEffect(() => {
    setActiveMenu(null);
    setMobileMenuOpen(false);
    setCartOpen(false);
    setHeaderBarVisible(true);
  }, [pathname]);

  const menuItems = getMainNavMenu();

  const topBarBg = isShopPink ? "#FAEFF6" : "#ffffff";
  const mainNavClass = isShopPink ? "bg-[#FAEFF6]" : "bg-white";
  const iconAccent = isShopPink ? "text-[#B63A6B] hover:text-black" : "text-gray-500 hover:text-black";
  const logoSrc = "/logo_img.png";

  const showHeaderBar = headerBarVisible || cartMounted || mobileMenuOpen;

  return (
    <div
      className={`w-full text-[#2d2d2d] ${isShopPink ? "bg-[#FAEFF6]" : "bg-white"}`}
      dir="rtl"
    >
      <header
        ref={headerShellRef}
        className={`fixed start-0 end-0 top-0 z-50 w-full max-w-full transition-transform duration-300 ease-out ${
          showHeaderBar ? "translate-y-0" : "-translate-y-full"
        } ${!showHeaderBar ? "pointer-events-none" : ""} ${isShopPink ? "bg-[#FAEFF6]" : "bg-white"}`}
      >
      {/* ——— Desktop: top + main nav + marquee ——— */}
      <div className="hidden overflow-visible lg:block">
        <div
          className="relative z-50 overflow-visible border-b border-gray-100 py-2 px-6"
          style={{ backgroundColor: topBarBg, ...sans }}
        >
          <div className="mx-auto flex min-h-[4.5rem] max-w-[1920px] items-center justify-between text-[12px] font-medium uppercase tracking-widest">
            <div className="relative z-20 flex min-h-9 items-center self-center">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setCurrencyOpen(!currencyOpen)}
                  className="inline-flex h-9 cursor-pointer items-center gap-1 transition-colors hover:text-black"
                >
                  ريال سعودي
                  <ChevronDown size={10} strokeWidth={2.25} className="opacity-80" />
                </button>
                {currencyOpen ? (
                  <div className="absolute start-0 top-full z-[100] mt-2 min-w-[180px] border border-gray-100 bg-white p-4 shadow-xl">
                    <p className="mb-2 border-b pb-1 text-gray-400" style={sans}>
                      اختر العملة
                    </p>
                    <div className="flex flex-col gap-3">
                      {["السعودية", "الإمارات", "الكويت", "مصر"].map((country) => (
                        <button
                          key={country}
                          type="button"
                          className="flex items-center gap-2 text-start transition-colors hover:text-amber-800"
                          style={sans}
                        >
                          <span className="h-3 w-4 rounded-sm bg-gray-200" aria-hidden />
                          <span>
                            {country} (SAR)
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="pointer-events-none absolute inset-x-0 top-1/2 z-10 flex -translate-y-1/2 justify-center">
              <Link
                href="/"
                className="pointer-events-auto flex w-max max-w-[min(92vw,240px)] flex-col items-center gap-0.5 text-center"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={logoSrc}
                  alt=""
                  className="mx-auto h-10 w-auto max-w-[min(200px,28vw)] object-contain"
                  width={200}
                  height={48}
                />
                <span
                  className="text-base font-semibold leading-tight text-[#d44c7d] normal-case tracking-normal sm:text-lg"
                  style={sans}
                >
                  {TXT.brand}
                </span>
              </Link>
            </div>

            <div className="z-20 flex min-h-9 items-center justify-end gap-1 sm:gap-4">
              <Link
                href="/shop"
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center"
                title="تصفح المتجر"
                aria-label="تصفح المتجر"
              >
                <Search size={18} className={`shrink-0 ${iconAccent} transition-colors`} strokeWidth={2.25} />
              </Link>
              {user ? (
                <Link
                  href={user.role === "admin" ? "/admin" : "/profile"}
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center"
                  title={TXT.account}
                  aria-label={TXT.account}
                >
                  <User size={18} className={`shrink-0 ${iconAccent} transition-colors`} strokeWidth={2.25} />
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center"
                  title={TXT.login}
                  aria-label={TXT.login}
                >
                  <User size={18} className={`shrink-0 ${iconAccent} transition-colors`} strokeWidth={2.25} />
                </Link>
              )}
              <div className="relative flex h-9 w-9 items-center justify-center">
                <button
                  type="button"
                  onClick={() => setCartOpen(true)}
                  className="group inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full transition-all duration-200 hover:bg-brand-light/40 active:scale-[0.97]"
                  title="السلة"
                  aria-label="السلة"
                >
                  <ShoppingBag
                    size={18}
                    className={`shrink-0 transition-colors ${
                      isShopPink
                        ? "text-[#B63A6B] group-hover:text-brand-dark"
                        : "text-gray-500 group-hover:text-brand-primary"
                    }`}
                    strokeWidth={2.25}
                  />
                  {count > 0 ? (
                    <span
                      className="absolute -end-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-gray-800 text-[8px] text-white"
                      style={sans}
                    >
                      {count > 99 ? "99+" : count}
                    </span>
                  ) : null}
                </button>
              </div>
            </div>
          </div>
        </div>

        <nav
          className={`relative z-40 border-gray-100 transition-all duration-300 ${
            scrolled ? "py-2 shadow-sm" : "py-4"
          } ${mainNavClass} border-b border-gray-100`}
        >
          <div className="relative" onMouseLeave={() => setActiveMenu(null)}>
            <div className={`mx-auto w-full max-w-7xl ${pagePaddingX}`}>
              <ul className="flex min-h-10 items-center justify-center gap-6 text-[12px] font-medium uppercase tracking-widest xl:gap-8">
              {menuItems.map((item) => (
                <li
                  key={item.id}
                  className="group relative flex items-center"
                  onMouseEnter={() => {
                    if (item.hasMega || item.hasDropdown) setActiveMenu(item.id);
                  }}
                >
                  {item.id === "home" || item.id === "blog" ? (
                    <Link
                      href={item.href ?? "/"}
                      className={`inline-flex h-9 items-center border-b-2 border-transparent transition-colors hover:border-amber-800 ${
                        pathname === (item.href ?? "") ||
                        (item.id === "blog" && (pathname === "/blog" || pathname?.startsWith("/blog/")))
                          ? "border-amber-800"
                          : ""
                      }`}
                    >
                      {item.label}
                    </Link>
                  ) : null}
                  {item.id === "shop" && item.hasMega ? (
                    <Link
                      href="/shop"
                      className={`inline-flex h-9 min-h-9 items-center gap-1 border-b-2 border-transparent transition-colors hover:border-amber-800 ${
                        activeMenu === "shop" || pathname === "/shop" || pathname?.startsWith("/product/")
                          ? "border-amber-800"
                          : ""
                      }`}
                    >
                      {item.label}
                      <ChevronDown
                        size={12}
                        strokeWidth={2.5}
                        className={`shrink-0 transition-transform duration-200 ${activeMenu === "shop" ? "rotate-180" : ""}`}
                        aria-hidden
                      />
                    </Link>
                  ) : null}
                  {item.id === "about" && item.hasDropdown && item.aboutLinks ? (
                    <span className="inline-flex h-9 min-h-9 cursor-default items-center gap-1 border-b-2 border-transparent text-inherit transition-colors hover:border-amber-800">
                      {item.label}
                      <ChevronDown
                        size={12}
                        strokeWidth={2.5}
                        className={`shrink-0 transition-transform duration-200 ${activeMenu === "about" ? "rotate-180" : ""}`}
                        aria-hidden
                      />
                    </span>
                  ) : null}
                  {item.id === "presets" && item.hasMega ? (
                    <Link
                      href="/shop"
                      className={`inline-flex h-9 min-h-9 items-center gap-1 border-b-2 border-transparent transition-colors hover:border-amber-800 ${
                        activeMenu === "presets" ? "border-amber-800" : ""
                      }`}
                    >
                      {item.label}
                      <ChevronDown
                        size={12}
                        strokeWidth={2.5}
                        className={`shrink-0 transition-transform duration-200 ${activeMenu === "presets" ? "rotate-180" : ""}`}
                        aria-hidden
                      />
                    </Link>
                  ) : null}

                  {item.id === "about" && item.hasDropdown && item.aboutLinks && activeMenu === "about" ? (
                    <div className="absolute end-0 top-full z-50 w-48 animate-[fade_0.2s_ease-out] border-t border-gray-100 bg-white py-4 shadow-2xl">
                      {item.aboutLinks.map((l) => (
                        <Link
                          key={l.label}
                          href={l.href}
                          className="block px-6 py-2 text-gray-500 transition-colors hover:bg-gray-50 hover:text-black"
                          style={sans}
                        >
                          {l.label}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </li>
              ))}
              </ul>
            </div>

            {activeMenu === "shop" ? (
              <div
                className="absolute end-0 start-0 top-full z-30 w-full border-t border-gray-100 bg-white shadow-2xl"
                onMouseEnter={() => setActiveMenu("shop")}
              >
                <div className="mx-auto grid max-w-7xl grid-cols-12 gap-8 p-8 xl:p-12" style={sans}>
                  {([shopMegaColumns[0], shopMegaColumns[1], shopMegaColumns[2]] as const).map((chunk, idx) => (
                    <div key={MEGA_TITLES[idx]} className="col-span-2">
                      <h3 className="mb-4 border-b border-gray-100 pb-2 text-lg font-semibold not-italic text-gray-800">
                        {MEGA_TITLES[idx]}
                      </h3>
                      <ul className="space-y-3">
                        {chunk.length === 0 && idx === 0 ? (
                          <li>
                            <Link
                              href="/shop"
                              className="text-xs font-medium tracking-widest text-gray-500 transition-colors hover:text-black"
                              style={sans}
                            >
                              {TXT.shop}
                            </Link>
                          </li>
                        ) : (
                          chunk.map((c) => (
                            <li key={c.id}>
                              <Link
                                href={`/shop#cat-${c.id}`}
                                className="text-xs font-medium tracking-widest text-gray-500 transition-colors hover:text-black"
                              >
                                {c.name}
                              </Link>
                            </li>
                          ))
                        )}
                      </ul>
                    </div>
                  ))}
                  <div className="relative col-span-6 h-[min(70vw,240px)] overflow-hidden rounded-sm bg-[#f2f0eb] min-[1200px]:h-[280px]">
                    <div className="absolute inset-0 z-10 flex flex-col justify-center p-6 sm:p-10" style={sans}>
                      <span className="mb-1 text-[10px] font-bold uppercase tracking-widest text-red-800">مميز</span>
                      <h2 className="mb-3 max-w-[200px] text-2xl font-medium leading-tight text-gray-800 min-[1200px]:text-3xl">
                        تسوقي اختياراتك المفضلة
                      </h2>
                      <Link
                        href="/shop"
                        className="w-fit border-b-2 border-black pb-0.5 text-[10px] font-bold uppercase tracking-widest transition-colors hover:border-amber-800 hover:text-amber-800"
                      >
                        استكشف الآن
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {activeMenu === "presets" ? (
              <div
                className="absolute end-0 start-0 top-full z-30 w-full border-t border-gray-100 bg-white shadow-2xl"
                onMouseEnter={() => setActiveMenu("presets")}
              >
                <div className="mx-auto max-w-7xl p-8 xl:p-12" style={sans}>
                  <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-gray-100 pb-4">
                    <h3 className="text-lg font-semibold text-gray-900">تشكيلة المجموعات</h3>
                    <Link
                      href="/shop"
                      className="text-xs font-bold uppercase tracking-widest text-gray-500 transition-colors hover:text-black"
                    >
                      كل المنتجات
                    </Link>
                  </div>
                  {shopMegaCategories.length === 0 ? (
                    <Link
                      href="/shop"
                      className="text-sm text-gray-500 underline-offset-2 hover:text-black"
                    >
                      {TXT.shop}
                    </Link>
                  ) : (
                    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
                      {shopMegaCategories.map((c) => (
                        <NavMegaCategoryCard key={c.id} c={c} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </nav>
      </div>

      {/* ——— Mobile: compact header ——— */}
      <div className="border-b border-gray-100 px-3 py-2 lg:hidden" style={{ backgroundColor: topBarBg, ...sans }}>
        <div className="mx-auto flex max-w-[1920px] items-center justify-between">
          <button
            type="button"
            className="inline-flex p-1 text-gray-600"
            onClick={() => {
              setMobileMenuOpen(true);
              setCartOpen(false);
            }}
            aria-label="قائمة التنقل"
          >
            <Menu className="h-6 w-6" strokeWidth={2.25} />
          </button>
          <Link href="/" className="min-w-0 flex-1 text-center" aria-label={TXT.brand}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logoSrc}
              alt=""
              className="mx-auto h-8 w-auto max-w-[160px] object-contain"
            />
            <span className="sr-only">{TXT.brand}</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/shop" className="inline-flex" aria-label="تصفح المتجر">
              <Search className="h-5 w-5 text-gray-500" strokeWidth={2.25} />
            </Link>
            {user ? (
              <Link
                href={user.role === "admin" ? "/admin" : "/profile"}
                className="inline-flex"
                aria-label={TXT.account}
              >
                <User className="h-5 w-5 text-gray-500" strokeWidth={2.25} />
              </Link>
            ) : (
              <Link href="/login" className="inline-flex" aria-label={TXT.login}>
                <User className="h-5 w-5 text-gray-500" strokeWidth={2.25} />
              </Link>
            )}
            <button
              type="button"
              className="group relative inline-flex cursor-pointer items-center justify-center rounded-full p-1.5 transition-all duration-200 hover:bg-brand-light/40 active:scale-[0.97]"
              onClick={() => {
                setCartOpen(true);
                setMobileMenuOpen(false);
              }}
              aria-label="السلة"
            >
              <ShoppingBag
                className="h-5 w-5 text-gray-500 transition-colors group-hover:text-brand-primary"
                strokeWidth={2.25}
              />
              {count > 0 ? (
                <span className="absolute -end-1 -top-1 min-h-[0.9rem] min-w-[0.9rem] rounded-full bg-gray-800 px-0.5 text-[8px] leading-4 text-white">
                  {count > 9 ? "9+" : count}
                </span>
              ) : null}
            </button>
          </div>
        </div>
      </div>
      </header>

      <div
        aria-hidden
        className="shrink-0 [transition:height_0.2s_ease]"
        style={{ height: Math.max(headerSpacerPx, 1) }}
      />

      {mobileMenuOpen ? (
        <>
          <div
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm transition-opacity lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden
          />
          <div
            className="fixed inset-y-0 start-0 z-[101] flex w-full max-w-sm flex-col overflow-y-auto border-e border-gray-100 bg-white shadow-2xl lg:hidden"
            style={sans}
          >
            <div className="flex items-center justify-between border-b border-gray-100 p-4">
              <span className="text-sm font-medium text-gray-800">قائمة</span>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-500 hover:text-black"
                aria-label="إغلاق"
              >
                <X size={22} />
              </button>
            </div>
            <ul className="p-2">
              {menuItems.map((item) => {
                if (item.href) {
                  return (
                    <li key={item.id} className="border-b border-gray-50 last:border-0">
                      <Link
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-4 py-3 text-sm text-gray-800"
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                }
                if (item.id === "shop") {
                  return (
                    <li key="shop" className="border-b border-gray-50">
                      <Link
                        href="/shop"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-4 py-3 text-sm text-gray-800"
                      >
                        {item.label}
                      </Link>
                      <ul className="pr-2 pb-2 text-xs text-gray-500">
                        {categories.length === 0 ? (
                          <li className="px-3 py-1.5">—</li>
                        ) : (
                          categories.map((c) => (
                            <li key={c.id} className="px-3 py-1.5">
                              <Link
                                href={`/shop#cat-${c.id}`}
                                onClick={() => setMobileMenuOpen(false)}
                                className="text-gray-600"
                              >
                                {c.name}
                              </Link>
                            </li>
                          ))
                        )}
                      </ul>
                    </li>
                  );
                }
                if (item.id === "about" && item.aboutLinks) {
                  return (
                    <li key="about" className="border-b border-gray-50">
                      <span className="block px-4 py-3 text-sm text-gray-400">{item.label}</span>
                      {item.aboutLinks.map((l) => (
                        <Link
                          key={l.label}
                          href={l.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className="block py-1.5 pe-4 ps-6 text-sm text-gray-800"
                        >
                          {l.label}
                        </Link>
                      ))}
                    </li>
                  );
                }
                if (item.id === "presets" && item.hasMega) {
                  return (
                    <li key="presets" className="border-b border-gray-50">
                      <span className="block px-4 py-3 text-sm text-gray-400">{item.label}</span>
                      {shopMegaCategories.length === 0 ? (
                        <Link
                          href="/shop"
                          onClick={() => setMobileMenuOpen(false)}
                          className="block py-1.5 pe-4 ps-6 text-sm text-gray-800"
                        >
                          {TXT.shop}
                        </Link>
                      ) : (
                        shopMegaCategories.map((c) => (
                          <Link
                            key={c.id}
                            href={`/shop?category=${encodeURIComponent(c.id)}`}
                            onClick={() => setMobileMenuOpen(false)}
                            className="block py-1.5 pe-4 ps-6 text-sm text-gray-800"
                          >
                            {c.name}
                          </Link>
                        ))
                      )}
                    </li>
                  );
                }
                return null;
              })}
            </ul>
            <div className="mt-auto border-t border-gray-100 p-4">
              <div className="mb-2 flex items-center gap-1 text-xs text-gray-500">
                <MapPin className={adminIconClassName} size={14} />
                <Link href="/locations" onClick={() => setMobileMenuOpen(false)}>
                  {TXT.locations}
                </Link>
              </div>
            </div>
          </div>
        </>
      ) : null}

      {/* Side cart (RTL: drawer on physical left) */}
      {cartMounted ? (
        <>
          <div
            className={`fixed inset-0 z-[100] transition-opacity duration-300 ease-out ${
              cartDrawerEnter ? "bg-black/40 opacity-100 backdrop-blur-sm" : "bg-black/40 opacity-0 backdrop-blur-sm"
            }`}
            onClick={() => setCartOpen(false)}
            aria-hidden
          />
          <div
            className={`fixed left-0 top-0 z-[101] flex h-full w-full max-w-[min(100vw,450px)] flex-col border-r border-gray-100 bg-white shadow-2xl will-change-transform transition-transform duration-300 ease-out ${
              cartDrawerEnter ? "translate-x-0" : "-translate-x-full"
            }`}
            role="dialog"
            aria-label="عربة التسوق"
            style={sans}
            dir="rtl"
          >
            <div className="flex items-center justify-between border-b border-gray-100 p-4 sm:p-6">
              <h2 className="text-2xl font-medium text-gray-800 sm:text-3xl" style={sans}>
                اختياراتك
              </h2>
              <button
                type="button"
                onClick={() => setCartOpen(false)}
                className="text-gray-400 transition-colors hover:text-black"
                aria-label="إغلاق"
              >
                <X size={24} />
              </button>
            </div>

            <div className="cute-scrollbar flex-1 space-y-8 overflow-y-auto p-4 sm:p-6">
              {items.length === 0 ? (
                <p className="text-sm text-gray-500" style={sans}>
                  السلة فارغة. أضيفي أول منتج!
                </p>
              ) : null}
              {items.map((item) => (
                <div key={item.slug} className="flex gap-4">
                  <div className="relative h-32 w-24 flex-shrink-0 overflow-hidden bg-[#f9f7f2] sm:h-36 sm:w-28">
                    <SafeImage
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-contain p-1"
                      sizes="112px"
                    />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="mb-0.5 flex items-start justify-between gap-2">
                      <h3 className="text-base font-medium sm:text-lg" style={sans}>
                        {item.name}
                      </h3>
                      <span className="shrink-0 text-sm" style={sans}>
                        {lineTotalString(item)}
                      </span>
                    </div>
                    <p className="text-[10px] uppercase tracking-widest text-gray-400" style={sans}>
                      {item.price}
                    </p>
                    <div className="mt-auto flex items-center justify-between gap-2 pt-3">
                      <div
                        className="inline-flex items-center gap-2 border border-gray-200 bg-white px-2 py-1.5"
                        style={sans}
                      >
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.slug, item.quantity - 1)}
                          className="text-gray-500 transition-colors hover:text-black"
                          aria-label="تقليل"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="min-w-[1.2rem] text-center text-xs">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.slug, item.quantity + 1)}
                          className="text-gray-500 transition-colors hover:text-black"
                          aria-label="زيادة"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.slug)}
                        className="shrink-0 text-[10px] uppercase tracking-widest text-gray-400 transition-colors hover:text-red-800"
                        style={sans}
                      >
                        إزالة
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {items.length > 0 ? (
                <div className="border-t border-gray-100 pt-6">
                  <h4 className="mb-3 text-lg font-medium" style={sans}>
                    تنسيق مثالي
                  </h4>
                  <p className="text-xs text-gray-500" style={sans}>
                    اكتشفي مكملات العناية في{" "}
                    <Link href="/shop" onClick={() => setCartOpen(false)} className="text-black underline-offset-2 hover:underline">
                      صفحة المتجر
                    </Link>
                    .
                  </p>
                </div>
              ) : null}
            </div>

            <div className="border-t border-gray-100 bg-white p-4 sm:p-6">
              <div className="mb-4 flex flex-col gap-1 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
                <span className="text-xs font-bold uppercase tracking-widest text-gray-700" style={sans}>
                  المجموع
                </span>
                <div className="text-start sm:text-end">
                  <span className="text-2xl font-medium" style={sans}>
                    {formatSar(subtotal)}
                  </span>
                  <p
                    className="mt-0.5 text-[9px] leading-relaxed text-gray-400 [text-transform:none]"
                    style={sans}
                  >
                    الضرائب، الخصومات والشحن مُحسوبة عند إتمام الطلب.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 min-[400px]:grid-cols-2 min-[400px]:gap-4" style={sans}>
                <Link
                  href="/cart"
                  onClick={() => setCartOpen(false)}
                  className="qgb-btn-outline w-full"
                  style={sans}
                >
                  عرض السلة
                </Link>
                <Link
                  href="/cart"
                  onClick={() => setCartOpen(false)}
                  className="qgb-btn-primary w-full"
                  style={sans}
                >
                  إتمام الشراء
                </Link>
              </div>
            </div>
          </div>
        </>
      ) : null}

      {/* Mobile bottom bar */}
      <div className="fixed inset-x-0 bottom-0 z-50 px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] lg:hidden">
        <nav
          aria-label={TXT.quickNav}
          className="mx-auto grid max-w-sm grid-cols-4 place-items-center rounded-full border border-black/5 bg-white/95 px-1.5 py-2 backdrop-blur-xl"
        >
          {MOBILE_NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const targetHref =
              href === "/profile" ? (user ? (user.role === "admin" ? "/admin" : "/profile") : "/login") : href;
            const isActive =
              targetHref === "/"
                ? pathname === "/"
                : href === "/cart"
                  ? pathname === "/cart" || cartMounted
                  : pathname === targetHref || (targetHref ? pathname?.startsWith(`${targetHref}/`) : false);
            if (href === "/cart") {
              return (
                <button
                  type="button"
                  key="cart"
                  onClick={() => {
                    setCartOpen(true);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex min-w-0 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-full px-2 py-1.5 text-[10px] font-medium leading-none transition-colors hover:bg-brand-light/35 active:scale-95 ${
                    isActive ? "text-black" : "text-neutral-500"
                  }`}
                >
                  <ShoppingCart className={`h-5 w-5 ${adminIconClassName}`} aria-hidden />
                  <span className="truncate">{label}</span>
                </button>
              );
            }
            return (
              <Link
                key={href}
                href={targetHref}
                className={`flex min-w-0 flex-col items-center justify-center gap-1.5 rounded-full px-2 py-1.5 text-[10px] font-medium leading-none transition-colors ${
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

      <style
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: `@keyframes fade{from{opacity:0}to{opacity:1}}`,
        }}
      />
    </div>
  );
}
