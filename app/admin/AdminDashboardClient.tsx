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

const serif = { fontFamily: "var(--font-cormorant), serif" };

type Stat = { label: string; value: number; href: string };
type RecentOrder = { _id: string; status?: string; total?: number; customer?: { username?: string } };
type RecentCustomer = { _id: string; username?: string };

const STAT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Products: Package,
  Collections: FolderKanban,
  Customers: Users,
  Orders: ShoppingBag,
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
    <div className="px-2 md:px-4">
      <p className="text-[10px] uppercase tracking-[0.35em] text-gray-500">Admin</p>
      <h2 className="mt-2 text-3xl font-light text-neutral-900 md:text-4xl mb-10" style={serif}>
        Overview
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-14">
        {stats.map(({ label, value, href }) => {
          const Icon = STAT_ICONS[label];
          return (
            <Link
              key={label}
              href={href}
              className="block p-6 md:p-8 bg-white border border-black/10 rounded-sm hover:border-black/20 transition-colors group"
            >
              {Icon && (
                <span className="inline-flex text-neutral-400 group-hover:text-black/70 transition-colors mb-3">
                  <Icon className="w-5 h-5" strokeWidth={1.25} />
                </span>
              )}
              <p className="text-3xl font-light text-black" style={serif}>
                {value}
              </p>
              <p className="text-sm text-neutral-500 mt-1">{label}</p>
            </Link>
          );
        })}
      </div>
      <div className="grid md:grid-cols-2 gap-8">
        <section className="bg-white border border-black/10 rounded-sm p-6 md:p-8">
          <div className="flex items-center gap-3 mb-5">
            <ShoppingCart className="w-5 h-5 text-neutral-500" strokeWidth={1.25} />
            <h3 className="text-lg font-light text-black" style={serif}>
              Recent orders
            </h3>
          </div>
          {recentOrders.length > 0 ? (
            <ul className="space-y-3">
              {recentOrders.map((o) => (
                <li key={String(o._id)} className="flex justify-between text-sm text-neutral-700">
                  <span>{o.customer?.username ?? "—"}</span>
                  <span>
                    {o.status ?? "—"} · {o.total != null ? `$${Number(o.total)}` : "—"}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-neutral-500">No orders yet.</p>
          )}
        </section>
        <section className="bg-white border border-black/10 rounded-sm p-6 md:p-8">
          <div className="flex items-center gap-3 mb-5">
            <UserCircle className="w-5 h-5 text-neutral-500" strokeWidth={1.25} />
            <h3 className="text-lg font-light text-black" style={serif}>
              Recent customers
            </h3>
          </div>
          {recentCustomers.length > 0 ? (
            <ul className="space-y-3">
              {recentCustomers.map((u) => (
                <li key={String(u._id)} className="text-sm text-neutral-700">
                  {u.username ?? "—"}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-neutral-500">No customers yet.</p>
          )}
        </section>
      </div>
    </div>
  );
}
