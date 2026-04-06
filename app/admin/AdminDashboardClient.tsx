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
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
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

function RevenueTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: { date: string; revenue: number } }[];
}) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  const label = new Date(p.date + "T12:00:00Z").toLocaleDateString("ar-SA", {
    day: "numeric",
    month: "short",
  });
  return (
    <div className="rounded-sm border border-black/10 bg-white px-3 py-2 text-sm shadow-md" style={sans}>
      <p className="text-neutral-500 text-xs mb-1">{label}</p>
      <p className="font-medium text-neutral-900">{formatSar(p.revenue)}</p>
    </div>
  );
}

function StatusTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { value: number; payload: { status: string; count: number } }[];
}) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;
  return (
    <div className="rounded-sm border border-black/10 bg-white px-3 py-2 text-sm shadow-md" style={sans}>
      <p className="text-neutral-500 text-xs mb-1">{orderStatusAr(row.status)}</p>
      <p className="font-medium text-neutral-900">{row.count}</p>
    </div>
  );
}

export function AdminDashboardClient({
  stats,
  recentOrders,
  recentCustomers,
  revenueTotal,
  revenueSeries,
  ordersByStatus,
}: {
  stats: Stat[];
  recentOrders: RecentOrder[];
  recentCustomers: RecentCustomer[];
  revenueTotal: number;
  revenueSeries: { date: string; revenue: number }[];
  ordersByStatus: { status: string; count: number }[];
}) {
  const statusChartData = ordersByStatus.map((r) => ({
    status: r.status,
    count: r.count,
    label: orderStatusAr(r.status),
  }));

  return (
    <div className="px-2 md:px-4" dir="rtl">
      <p className="text-[10px] uppercase tracking-[0.35em] text-gray-500" style={sans}>
        الإدارة
      </p>
      <h2 className="mt-2 text-3xl font-medium text-neutral-900 md:text-4xl mb-10" style={sans}>
        نظرة عامة
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-10">
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

      <div className="mb-10 rounded-sm border border-black/10 bg-white p-6 md:p-8">
        <p className="text-sm text-neutral-600 mb-1" style={sans}>
          إجمالي الإيرادات (بدون الطلبات الملغاة)
        </p>
        <p className="text-2xl font-medium text-neutral-900" style={sans}>
          {formatSar(revenueTotal)}
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2 mb-14">
        <section className="rounded-sm border border-black/10 bg-white p-6 md:p-8">
          <h3 className="text-lg font-medium text-black mb-6" style={sans}>
            الإيرادات اليومية (آخر 30 يوماً)
          </h3>
          <div className="h-[280px] w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueSeries} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#171717" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#171717" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: "#737373" }}
                  tickFormatter={(v) =>
                    new Date(String(v) + "T12:00:00Z").toLocaleDateString("ar-SA", {
                      day: "numeric",
                      month: "numeric",
                    })
                  }
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#737373" }}
                  tickFormatter={(v) => new Intl.NumberFormat("ar-SA").format(Number(v))}
                />
                <Tooltip content={<RevenueTooltip />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#171717"
                  strokeWidth={1.5}
                  fill="url(#revFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-sm border border-black/10 bg-white p-6 md:p-8">
          <h3 className="text-lg font-medium text-black mb-6" style={sans}>
            الطلبات حسب الحالة
          </h3>
          {statusChartData.length === 0 ? (
            <p className="text-sm text-neutral-500" style={sans}>
              لا توجد طلبات بعد.
            </p>
          ) : (
            <div className="h-[280px] w-full" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusChartData} margin={{ top: 8, right: 8, left: 0, bottom: 48 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                  <XAxis
                    dataKey="label"
                    type="category"
                    tick={{ fontSize: 10, fill: "#737373" }}
                    interval={0}
                    angle={-25}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis tick={{ fontSize: 10, fill: "#737373" }} allowDecimals={false} />
                  <Tooltip content={<StatusTooltip />} />
                  <Bar dataKey="count" fill="#171717" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>
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
                    {orderStatusAr(o.status ?? "")} · {o.total != null ? formatSar(Number(o.total)) : "—"}
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
