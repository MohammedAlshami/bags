"use client";

import Link from "next/link";
import {
  Package,
  FolderKanban,
  Users,
  ShoppingBag,
  ShoppingCart,
  UserCircle,
} from "lucide-react";
import { formatSar } from "@/lib/format-sar";
import { sans } from "@/lib/page-theme";
import { orderStatusAr } from "@/lib/admin-ar";

type StatIconKey = "products" | "collections" | "customers" | "orders";

type Stat = { label: string; value: number; href: string; iconKey: StatIconKey };
type RecentOrder = { _id: string; status?: string; total?: number; customer?: { username?: string } };
type RecentCustomer = { _id: string; username?: string };

const STAT_ICONS: Record<StatIconKey, React.ComponentType<{ className?: string }>> = {
  products: Package,
  collections: FolderKanban,
  customers: Users,
  orders: ShoppingBag,
};

export function AdminDashboardClient({
  stats,
  recentOrders,
  recentCustomers,
}: {
  stats: Stat[];
  recentOrders: RecentOrder[];
  recentCustomers: RecentCustomer[];
}) {
  return (
    <div className="px-2 md:px-4" dir="rtl">
      <p className="text-[10px] uppercase tracking-[0.35em] text-gray-500" style={sans}>
        الإدارة
      </p>
      <h2 className="mt-2 text-3xl font-medium text-neutral-900 md:text-4xl mb-10" style={sans}>
        نظرة عامة
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-14">
        {stats.map(({ label, value, href, iconKey }) => {
          const Icon = STAT_ICONS[iconKey];
          return (
            <Link
              key={href}
              href={href}
              className="block p-6 md:p-8 bg-white border border-black/10 rounded-sm hover:border-black/20 transition-colors group"
            >
              <span className="inline-flex text-neutral-400 group-hover:text-black/70 transition-colors mb-3">
                <Icon className="w-5 h-5" strokeWidth={1.25} />
              </span>
              <p className="text-3xl font-medium text-black" style={sans}>
                {value}
              </p>
              <p className="text-sm text-neutral-500 mt-1" style={sans}>
                {label}
              </p>
            </Link>
          );
        })}
      </div>
      <div className="grid md:grid-cols-2 gap-8">
        <section className="bg-white border border-black/10 rounded-sm p-6 md:p-8">
          <div className="flex items-center gap-3 mb-5">
            <ShoppingCart className="w-5 h-5 text-neutral-500" strokeWidth={1.25} />
            <h3 className="text-lg font-medium text-black" style={sans}>
              أحدث الطلبات
            </h3>
          </div>
          {recentOrders.length > 0 ? (
            <ul className="space-y-3">
              {recentOrders.map((o) => (
                <li key={String(o._id)} className="flex justify-between gap-2 text-sm text-neutral-700" style={sans}>
                  <span>{o.customer?.username ?? "—"}</span>
                  <span className="shrink-0 text-left">
                    {orderStatusAr(o.status ?? "")} ·{" "}
                    {o.total != null ? formatSar(Number(o.total)) : "—"}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-neutral-500" style={sans}>
              لا توجد طلبات بعد.
            </p>
          )}
        </section>
        <section className="bg-white border border-black/10 rounded-sm p-6 md:p-8">
          <div className="flex items-center gap-3 mb-5">
            <UserCircle className="w-5 h-5 text-neutral-500" strokeWidth={1.25} />
            <h3 className="text-lg font-medium text-black" style={sans}>
              أحدث العملاء
            </h3>
          </div>
          {recentCustomers.length > 0 ? (
            <ul className="space-y-3">
              {recentCustomers.map((u) => (
                <li key={String(u._id)} className="text-sm text-neutral-700" style={sans}>
                  {u.username ?? "—"}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-neutral-500" style={sans}>
              لا يوجد عملاء بعد.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
