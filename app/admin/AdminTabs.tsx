"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Boxes, LayoutDashboard, Package, Users, ShoppingBag } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { adminIconClassName, sans } from "@/lib/page-theme";

const TABS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/admin", label: "نظرة عامة", icon: LayoutDashboard },
  { href: "/admin/products", label: "المنتجات", icon: Package },
  { href: "/admin/packages", label: "الباقات", icon: Boxes },
  { href: "/admin/blogs", label: "المدونة", icon: BookOpen },
  { href: "/admin/customers", label: "العملاء", icon: Users },
  { href: "/admin/orders", label: "الطلبات", icon: ShoppingBag },
];

export function AdminTabs() {
  const pathname = usePathname();

  return (
    <>
      <nav className="mb-8 hidden lg:block" aria-label="أقسام لوحة الإدارة">
        <div className="flex gap-6 overflow-x-auto">
          {TABS.map(({ href, label, icon: Icon }) => {
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
        <div className="mx-auto grid max-w-xl grid-cols-6 rounded-full border border-black/5 bg-white/95 px-2 py-2 shadow-[0_14px_40px_rgba(0,0,0,0.16)] backdrop-blur-xl">
          {TABS.map(({ href, label, icon: Icon }) => {
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
