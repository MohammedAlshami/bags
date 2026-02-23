"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, FolderKanban, Users, ShoppingBag, Truck } from "lucide-react";

const serif = { fontFamily: "var(--font-cormorant), serif" };

const TABS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/collections", label: "Collections", icon: FolderKanban },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/shipping", label: "Shipping", icon: Truck },
];

export function AdminTabs() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-black/10 mb-8" aria-label="Admin sections">
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
              style={isActive ? serif : undefined}
            >
              <Icon className="w-4 h-4 shrink-0" strokeWidth={1.5} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
