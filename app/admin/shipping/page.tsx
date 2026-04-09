"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Pencil, Check, X } from "lucide-react";
import { adminIconClassName, sans } from "@/lib/page-theme";
import { adminApiErrorAr, orderStatusAr } from "@/lib/admin-ar";
import { AdminSkeletonShippingPage } from "@/lib/admin-skeleton";

type OrderRow = {
  _id: string;
  status: string;
  trackingNumber?: string;
  carrier?: string;
  shippedAt?: string | null;
  customer?: { _id: string; username?: string; fullName?: string };
  total?: number;
};

export default function AdminShippingPage() {
  const [list, setList] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCarrier, setEditCarrier] = useState("");
  const [editTracking, setEditTracking] = useState("");
  const [editMarkShipped, setEditMarkShipped] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchOrders = () =>
    fetch("/api/admin/orders")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load orders");
        return res.json();
      })
      .then((orders: OrderRow[]) => setList(orders.filter((o) => o.status !== "cancelled")));

  useEffect(() => {
    fetchOrders()
      .catch((e) => setError(adminApiErrorAr(e instanceof Error ? e.message : "Error")))
      .finally(() => setLoading(false));
  }, []);

  const startEdit = (o: OrderRow) => {
    setEditingId(o._id);
    setEditCarrier(o.carrier ?? "");
    setEditTracking(o.trackingNumber ?? "");
    setEditMarkShipped(false);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveTracking = async () => {
    if (!editingId) return;
    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        carrier: editCarrier.trim(),
        trackingNumber: editTracking.trim(),
      };
      if (editMarkShipped) {
        body.status = "shipped";
        body.shippedAt = new Date().toISOString();
      }
      const res = await fetch(`/api/admin/orders/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        const raw = typeof d.error === "string" ? d.error : "";
        throw new Error(raw || "Failed to update");
      }
      setEditingId(null);
      await fetchOrders();
    } catch (e) {
      setError(adminApiErrorAr(e instanceof Error ? e.message : "Error"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <AdminSkeletonShippingPage />;
  }
  if (error) {
    return (
      <p className="text-red-600" style={sans} dir="rtl">
        {error}
      </p>
    );
  }

  return (
    <div className="px-2 md:px-4" dir="rtl" style={sans}>
      <p className="text-[10px] uppercase tracking-[0.35em] text-gray-500">الشحن</p>
      <h2 className="mt-2 text-3xl font-medium text-neutral-900 md:text-4xl mb-4">التتبع</h2>
      <p className="text-sm text-neutral-600 mb-6">
        حدّث شركة الشحن ورقم التتبع لأي طلب. يمكنك أيضاً تعيين الطلب كـ«تم الشحن».
      </p>
      <div className="rounded-sm border border-black/10 bg-white">
        {list.length === 0 ? (
          <p className="p-8 text-neutral-500 text-center">لا توجد طلبات بعد.</p>
        ) : (
          <div className="overflow-x-auto overscroll-x-contain">
          <table className="w-full min-w-[56rem] text-sm">
            <thead>
              <tr className="border-b border-black/10 text-right">
                <th className="p-4 font-medium">الطلب</th>
                <th className="p-4 font-medium">العميل</th>
                <th className="p-4 font-medium">الحالة</th>
                <th className="p-4 font-medium">الشركة</th>
                <th className="p-4 font-medium">رقم التتبع</th>
                <th className="p-4 font-medium">تاريخ الشحن</th>
                <th className="p-4 font-medium">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {list.flatMap((o) => [
                <tr key={o._id} className="border-b border-black/5 align-top bg-white">
                  <td className="p-4 font-mono text-neutral-700 text-left" dir="ltr">
                    {o._id.slice(-8)}
                  </td>
                  <td className="p-4 text-neutral-600">{o.customer?.fullName || o.customer?.username || "—"}</td>
                  <td className="p-4">{orderStatusAr(o.status)}</td>
                  <td className="p-4">{o.carrier || "—"}</td>
                  <td className="p-4 font-mono text-left" dir="ltr">
                    {o.trackingNumber || "—"}
                  </td>
                  <td className="p-4 text-neutral-600">
                    {o.shippedAt
                      ? new Date(o.shippedAt).toLocaleDateString("ar-SA", {
                          dateStyle: "short",
                        })
                      : "—"}
                  </td>
                  <td className="p-4">
                    {editingId === o._id ? (
                      <div className="flex gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={saveTracking}
                          disabled={saving}
                          className="inline-flex items-center gap-1 text-black border border-black px-2 py-1 text-xs disabled:opacity-50"
                        >
                          <Check className={`w-3.5 h-3.5 ${adminIconClassName}`} />
                          حفظ
                        </button>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          disabled={saving}
                          className="inline-flex items-center gap-1 text-neutral-600 border border-black/20 px-2 py-1 text-xs"
                        >
                          <X className={`w-3.5 h-3.5 ${adminIconClassName}`} />
                          إلغاء
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => startEdit(o)}
                        className="inline-flex items-center gap-1 text-black underline hover:no-underline"
                      >
                        <Pencil className={`w-3.5 h-3.5 ${adminIconClassName}`} />
                        تحديث
                      </button>
                    )}
                    <Link
                      href={`/admin/orders/${o._id}`}
                      className="block mt-1 text-neutral-500 hover:text-black text-xs"
                    >
                      عرض الطلب
                    </Link>
                  </td>
                </tr>,
                ...(editingId === o._id
                  ? [
                      <tr key={`${o._id}-edit`} className="border-b border-black/5 bg-white">
                        <td colSpan={7} className="p-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl">
                            <div>
                              <label className="block text-[10px] uppercase tracking-widest text-neutral-500 mb-1">
                                شركة الشحن
                              </label>
                              <input
                                value={editCarrier}
                                onChange={(e) => setEditCarrier(e.target.value)}
                                placeholder="مثال: DHL، Aramex"
                                className="w-full border border-black/20 px-3 py-2 text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] uppercase tracking-widest text-neutral-500 mb-1">
                                رقم التتبع
                              </label>
                              <input
                                value={editTracking}
                                onChange={(e) => setEditTracking(e.target.value)}
                                placeholder="رقم التتبع"
                                className="w-full border border-black/20 px-3 py-2 text-sm"
                                dir="ltr"
                              />
                            </div>
                            <div className="flex items-end gap-2">
                              <label className="flex items-center gap-2 text-sm">
                                <input
                                  type="checkbox"
                                  checked={editMarkShipped}
                                  onChange={(e) => setEditMarkShipped(e.target.checked)}
                                />
                                وضع علامة «تم الشحن»
                              </label>
                            </div>
                          </div>
                        </td>
                      </tr>,
                    ]
                  : []),
              ])}
            </tbody>
          </table>
          </div>
        )}
      </div>
    </div>
  );
}
