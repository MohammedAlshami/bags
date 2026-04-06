"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { sans } from "@/lib/page-theme";
import { formatSar } from "@/lib/format-sar";
import { adminApiErrorAr, orderStatusAr } from "@/lib/admin-ar";

type CustomerRef = { _id: string; username?: string; email?: string; fullName?: string };
type OrderRow = {
  _id: string;
  customer: CustomerRef;
  total: number;
  status: string;
  createdAt: string;
  items?: { name?: string; quantity?: number; price?: string }[];
};

export default function AdminOrdersPage() {
  const [list, setList] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/orders")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load orders");
        return res.json();
      })
      .then(setList)
      .catch((e) => setError(adminApiErrorAr(e instanceof Error ? e.message : "Error")))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <p className="text-neutral-500" style={sans} dir="rtl">
        جاري التحميل…
      </p>
    );
  }
  if (error) {
    return (
      <p className="text-red-600" style={sans} dir="rtl">
        {error}
      </p>
    );
  }

  const customerLabel = (c: CustomerRef) => c?.username ?? (c?.fullName || c?.email) ?? "—";

  return (
    <div dir="rtl" style={sans}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-medium text-neutral-900">الطلبات</h2>
      </div>
      <div className="bg-white border border-black/10 rounded-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-black/10 text-right">
              <th className="p-4 font-medium">العميل</th>
              <th className="p-4 font-medium">التاريخ</th>
              <th className="p-4 font-medium">الحالة</th>
              <th className="p-4 font-medium">الإجمالي</th>
              <th className="p-4 font-medium">إجراء</th>
            </tr>
          </thead>
          <tbody>
            {list.map((o) => (
              <tr key={o._id} className="border-b border-black/5 bg-white">
                <td className="p-4">
                  {o.customer?._id ? (
                    <Link href={`/admin/customers/${o.customer._id}`} className="text-black underline hover:no-underline">
                      {customerLabel(o.customer)}
                    </Link>
                  ) : (
                    customerLabel(o.customer)
                  )}
                </td>
                <td className="p-4 text-neutral-600">
                  {o.createdAt
                    ? new Date(o.createdAt).toLocaleDateString("ar-SA", { dateStyle: "medium" })
                    : "—"}
                </td>
                <td className="p-4">{orderStatusAr(o.status ?? "")}</td>
                <td className="p-4">{o.total != null ? formatSar(Number(o.total)) : "—"}</td>
                <td className="p-4">
                  <Link href={`/admin/orders/${o._id}`} className="text-black underline hover:no-underline">
                    عرض الطلب
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.length === 0 && <p className="p-8 text-neutral-500 text-center">لا توجد طلبات بعد.</p>}
      </div>
    </div>
  );
}
