"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Boxes, LayoutDashboard, MapPin, Package, Users, ShoppingBag, Share2, Megaphone, Image, MessageSquare, HelpCircle, Shield, User } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { adminIconClassName, sans } from "@/lib/page-theme";

const TABS: { href: string; label: string; icon: LucideIcon; superadminOnly?: boolean }[] = [
  { href: "/admin", label: "نظرة عامة", icon: LayoutDashboard },
  { href: "/admin/products", label: "المنتجات", icon: Package },
  { href: "/admin/packages", label: "الباقات", icon: Boxes },
  { href: "/admin/store-locations", label: "نقاط البيع", icon: MapPin },
  { href: "/admin/blogs", label: "المدونة", icon: BookOpen },
  { href: "/admin/customers", label: "العملاء", icon: Users },
  { href: "/admin/orders", label: "الطلبات", icon: ShoppingBag },
  { href: "/admin/social-links", label: "روابط التواصل", icon: Share2 },
  { href: "/admin/ad-strips", label: "تسويق الصفحة الرئيسية", icon: Megaphone },
  { href: "/admin/before-after", label: "قبل وبعد", icon: Image },
  { href: "/admin/reviews", label: "التقييمات", icon: MessageSquare },
  { href: "/admin/faq-items", label: "الأسئلة", icon: HelpCircle },
  { href: "/admin/profile", label: "الملف الشخصي", icon: User },
  { href: "/admin/users", label: "المستخدمين", icon: Shield, superadminOnly: true },
];

export function AdminTabs({ role }: { role?: string }) {
  const pathname = usePathname();
  const isSuperadmin = role === "superadmin";
  const visibleTabs = TABS.filter((t) => !t.superadminOnly || isSuperadmin);

  return (
    <>
      <nav className="mb-8 hidden lg:block" aria-label="أقسام لوحة الإدارة">
        <div className="flex gap-6 overflow-x-auto">
          {visibleTabs.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || (href !== "/admin" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 whitespace-nowrap border-b-2 py-4 text-sm font-medium transition-colors ${
                  isActive ? "border-black text-black" : "border-transparent text-neutral-500 hover:text-black"
                }`}
                style={isActive ? sans : undefined}
              >
                <Icon className={`h-4 w-4 shrink-0 ${adminIconClassName}`} strokeWidth={1.5} />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>

      <nav className="fixed inset-x-0 bottom-0 z-50 px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] lg:hidden" aria-label="أقسام لوحة الإدارة">
        <div className="mx-auto grid max-w-xl grid-cols-6 rounded-xl border border-black/5 bg-white/95 px-2 py-2 backdrop-blur-xl">
          {visibleTabs.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || (href !== "/admin" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`flex min-w-0 flex-col items-center justify-center gap-1 rounded-full px-2 py-1.5 text-[10px] font-medium leading-none transition-colors ${
                  isActive ? "text-black" : "text-neutral-500"
                }`}
                style={isActive ? sans : undefined}
              >
                <Icon className={`h-5 w-5 shrink-0 ${adminIconClassName}`} strokeWidth={1.5} />
                <span className="truncate">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
