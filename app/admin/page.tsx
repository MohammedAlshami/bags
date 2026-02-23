import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import Collection from "@/models/Collection";
import User from "@/models/User";
import Order from "@/models/Order";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminDashboardClient } from "./AdminDashboardClient";

export default async function AdminDashboardPage() {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/login");

  await dbConnect();

  const [productCount, collectionCount, customerCount, orderCount] = await Promise.all([
    Product.countDocuments(),
    Collection.countDocuments(),
    User.countDocuments({ role: "customer" }),
    Order.countDocuments(),
  ]);

  const recentCustomers = await User.find({ role: "customer" }).sort({ createdAt: -1 }).limit(5).lean();
  const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5).populate("customer", "username").lean();

  const stats = [
    { label: "Products", value: productCount, href: "/admin/products" },
    { label: "Collections", value: collectionCount, href: "/admin/collections" },
    { label: "Customers", value: customerCount, href: "/admin/customers" },
    { label: "Orders", value: orderCount, href: "/admin/orders" },
  ];

  return (
    <AdminDashboardClient
      stats={stats}
      recentOrders={recentOrders.map((o) => ({
        _id: String(o._id),
        status: o.status,
        total: o.total,
        customer: o.customer as { username?: string } | undefined,
      }))}
      recentCustomers={recentCustomers.map((u) => ({
        _id: String(u._id),
        username: u.username,
      }))}
    />
  );
}
