import { sql } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminDashboardClient } from "./AdminDashboardClient";

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function last30DaysRevenueSeries(
  rows: { d: string | Date; revenue: unknown }[]
): { date: string; revenue: number }[] {
  const map = new Map<string, number>();
  for (const row of rows) {
    const raw = row.d;
    const key = typeof raw === "string" ? raw.slice(0, 10) : dayKey(new Date(raw));
    map.set(key, Number(row.revenue));
  }
  const out: { date: string; revenue: number }[] = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const dt = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - i));
    const key = dayKey(dt);
    out.push({ date: key, revenue: map.get(key) ?? 0 });
  }
  return out;
}

export default async function AdminDashboardPage() {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/login");

  const [productCount, customerCount, orderCount, revenueRow, revenueDays, statusRows] =
    await Promise.all([
      sql`SELECT COUNT(*)::int AS c FROM products`,
      sql`SELECT COUNT(*)::int AS c FROM users WHERE role = 'customer'`,
      sql`SELECT COUNT(*)::int AS c FROM orders`,
      sql`
        SELECT COALESCE(SUM(total), 0)::float AS total
        FROM orders
        WHERE status != 'cancelled'
      `,
      sql`
        SELECT o.created_at::date AS d, COALESCE(SUM(o.total), 0)::float AS revenue
        FROM orders o
        WHERE o.status != 'cancelled'
          AND o.created_at >= (CURRENT_TIMESTAMP - interval '30 days')
        GROUP BY o.created_at::date
        ORDER BY o.created_at::date
      `,
      sql`
        SELECT status, COUNT(*)::int AS c
        FROM orders
        GROUP BY status
        ORDER BY status
      `,
    ]);

  const recentCustomers = await sql`
    SELECT id, username FROM users WHERE role = 'customer' ORDER BY created_at DESC LIMIT 5
  `;
  const recentOrders = await sql`
    SELECT o.id, o.status, o.total, u.username AS customer_username
    FROM orders o
    JOIN users u ON u.id = o.customer_id
    ORDER BY o.created_at DESC
    LIMIT 5
  `;

  const stats = [
    {
      label: "المنتجات",
      value: (productCount[0] as { c: number }).c,
      href: "/admin/products",
      iconKey: "products" as const,
    },
    {
      label: "العملاء",
      value: (customerCount[0] as { c: number }).c,
      href: "/admin/customers",
      iconKey: "customers" as const,
    },
    {
      label: "الطلبات",
      value: (orderCount[0] as { c: number }).c,
      href: "/admin/orders",
      iconKey: "orders" as const,
    },
  ];

  const revenueTotal = Number((revenueRow[0] as { total: number }).total);
  const revenueSeries = last30DaysRevenueSeries(
    (revenueDays as { d: string | Date; revenue: unknown }[]).map((r) => ({
      d: r.d,
      revenue: r.revenue,
    }))
  );
  const ordersByStatus = (statusRows as { status: string; c: number }[]).map((r) => ({
    status: r.status,
    count: r.c,
  }));

  return (
    <AdminDashboardClient
      stats={stats}
      recentOrders={recentOrders.map((o) => ({
        _id: String(o.id),
        status: o.status as string,
        total: o.total as number,
        customer: { username: o.customer_username as string },
      }))}
      recentCustomers={recentCustomers.map((u) => ({
        _id: String(u.id),
        username: u.username as string,
      }))}
      revenueTotal={revenueTotal}
      revenueSeries={revenueSeries}
      ordersByStatus={ordersByStatus}
    />
  );
}
