import { sql } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminDashboardClient } from "./AdminDashboardClient";

export default async function AdminDashboardPage() {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/login");

  const [productCount, collectionCount, customerCount, orderCount] = await Promise.all([
    sql`SELECT COUNT(*)::int AS c FROM products`,
    sql`SELECT COUNT(*)::int AS c FROM collections`,
    sql`SELECT COUNT(*)::int AS c FROM users WHERE role = 'customer'`,
    sql`SELECT COUNT(*)::int AS c FROM orders`,
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
      label: "المجموعات",
      value: (collectionCount[0] as { c: number }).c,
      href: "/admin/collections",
      iconKey: "collections" as const,
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
    />
  );
}
