"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, Users, ShoppingBag } from "lucide-react";

import { adminIconClassName, sans } from "@/lib/page-theme";

const TABS = [
  { href: "/admin", label: "نظرة عامة", icon: LayoutDashboard },
  { href: "/admin/products", label: "المنتجات", icon: Package },
  { href: "/admin/customers", label: "العملاء", icon: Users },
  { href: "/admin/orders", label: "الطلبات", icon: ShoppingBag },
];

export function AdminTabs() {
  const pathname = usePathname();

  return (
    <nav className="mb-8" aria-label="أقسام لوحة الإدارة">
      <div className="flex gap-6 overflow-x-auto">
        {TABS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== "/admin" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                isActive
                  ? "border-black text-black"
                  : "border-transparent text-neutral-500 hover:text-black"
              }`}
              style={isActive ? sans : undefined}
            >
              <Icon className={`w-4 h-4 shrink-0 ${adminIconClassName}`} strokeWidth={1.5} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
