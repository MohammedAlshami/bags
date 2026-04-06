"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  MapPin,
  Package,
  User,
  ChevronDown,
  Truck,
  Pencil,
  ExternalLink,
} from "lucide-react";

import { sans } from "@/lib/page-theme";
import { formatSar } from "@/lib/format-sar";
import { adminApiErrorAr, orderStatusAr } from "@/lib/admin-ar";

type ShippingAddress = {
  fullName?: string;
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postCode?: string;
  country?: string;
};
type CustomerRef = {
  _id: string;
  username?: string;
  email?: string;
  fullName?: string;
  address?: string;
  phone?: string;
};
type OrderItem = { slug?: string; name?: string; price?: string; quantity?: number };
type OrderDetail = {
  _id: string;
  customer: CustomerRef;
  items: OrderItem[];
  total: number;
  status: string;
  shippingAddress?: ShippingAddress;
  trackingNumber?: string;
  carrier?: string;
  shippedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

const STATUS_OPTIONS = ["pending", "paid", "shipped", "cancelled"] as const;

function formatShippingAddress(sa: ShippingAddress | null | undefined): string {
  if (!sa) return "";
  const parts = [
    sa.fullName,
    sa.line1,
    sa.line2,
    [sa.city, sa.state].filter(Boolean).join(", "),
    sa.postCode,
    sa.country,
  ].filter(Boolean);
  return parts.join("\n") || "";
}

function parseItemPrice(price: string | undefined): number {
  const n = parseFloat(String(price ?? "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

export default function AdminOrderDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusSelectOpen, setStatusSelectOpen] = useState(false);
  const [editShippingOpen, setEditShippingOpen] = useState(false);
  const [savingShipping, setSavingShipping] = useState(false);
  const [editShipping, setEditShipping] = useState<ShippingAddress>({});
  const [editTracking, setEditTracking] = useState("");
  const [editCarrier, setEditCarrier] = useState("");

  const fetchOrder = () =>
    fetch(`/api/admin/orders/${id}`)
      .then((res) => {
        if (res.status === 404) throw new Error("Order not found");
        if (!res.ok) throw new Error("Failed to load order");
        return res.json();
      });

  useEffect(() => {
    if (!id) return;
    fetchOrder()
      .then(setOrder)
      .catch((e) => setError(adminApiErrorAr(e instanceof Error ? e.message : "Error")))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (order && editShippingOpen) {
      setEditShipping(order.shippingAddress ?? {});
      setEditTracking(order.trackingNumber ?? "");
      setEditCarrier(order.carrier ?? "");
    }
  }, [order, editShippingOpen]);

  const updateStatus = async (newStatus: string) => {
    if (!order) return;
    setUpdatingStatus(true);
    setStatusSelectOpen(false);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update order");
      const updated = await res.json();
      setOrder(updated);
    } catch (e) {
      setError(adminApiErrorAr(e instanceof Error ? e.message : "Error"));
    } finally {
      setUpdatingStatus(false);
    }
  };

  const saveShippingAndTracking = async () => {
    setSavingShipping(true);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shippingAddress: editShipping,
          trackingNumber: editTracking,
          carrier: editCarrier,
        }),
      });
      if (!res.ok) throw new Error("Failed to update order");
      const updated = await res.json();
      setOrder(updated);
      setEditShippingOpen(false);
    } catch (e) {
      setError(adminApiErrorAr(e instanceof Error ? e.message : "Error"));
    } finally {
      setSavingShipping(false);
    }
  };

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
  if (!order) return null;

  const customer = order.customer ?? {};
  const orderShipping = formatShippingAddress(order.shippingAddress);
  const shippingDisplay =
    orderShipping.trim() || customer.address?.trim() || "لا يوجد عنوان محفوظ.";

  const dateOpts: Intl.DateTimeFormatOptions = { dateStyle: "medium" };

  return (
    <div className="px-2 md:px-4" dir="rtl" style={sans}>
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-black mb-6"
      >
        العودة إلى الطلبات
        <ArrowRight className="w-4 h-4 shrink-0" strokeWidth={1.5} aria-hidden />
      </Link>

      <p className="text-[10px] uppercase tracking-[0.35em] text-gray-500">طلب</p>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-3xl font-light text-neutral-900 md:text-4xl">
          طلب {order._id.slice(-8)}
        </h2>
        <div className="flex items-center gap-3">
          <span className="text-sm text-neutral-600">
            {order.createdAt
              ? new Date(order.createdAt).toLocaleDateString("ar-SA", dateOpts)
              : "—"}
          </span>
          <div className="relative">
            <button
              type="button"
              onClick={() => setStatusSelectOpen((v) => !v)}
              disabled={updatingStatus}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-black/20 rounded-sm text-sm disabled:opacity-50"
            >
              {orderStatusAr(order.status)}
              <ChevronDown className="w-4 h-4" aria-hidden />
            </button>
            {statusSelectOpen && (
              <div className="absolute end-0 top-full mt-1 bg-white border border-black/10 rounded-sm shadow-lg py-1 z-10 min-w-[140px]">
                {STATUS_OPTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => updateStatus(s)}
                    className={`block w-full text-end px-4 py-2 text-sm hover:bg-neutral-50 ${
                      order.status === s ? "font-semibold" : ""
                    }`}
                  >
                    {orderStatusAr(s)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mt-8 mb-8">
        <section className="bg-white border border-black/10 rounded-sm p-6 md:p-8">
          <h3 className="text-lg font-light text-black mb-5 flex items-center gap-2">
            <User className="w-5 h-5 text-neutral-500 shrink-0" strokeWidth={1.25} aria-hidden />
            العميل
          </h3>
          <p className="text-sm text-neutral-900 font-medium">
            {customer.fullName || customer.username || "—"}
          </p>
          <p className="text-sm text-neutral-600 mt-0.5" dir="ltr">
            {customer.email || "—"}
          </p>
          {customer.phone && (
            <p className="text-sm text-neutral-600 mt-0.5" dir="ltr">
              {customer.phone}
            </p>
          )}
          <Link
            href={`/admin/customers/${customer._id}`}
            className="inline-block mt-3 text-sm text-black underline hover:no-underline"
          >
            عرض ملف العميل
          </Link>
        </section>

        <section className="bg-white border border-black/10 rounded-sm p-6 md:p-8">
          <div className="flex items-center justify-between gap-2 mb-5">
            <h3 className="text-lg font-light text-black flex items-center gap-2">
              <MapPin className="w-5 h-5 text-neutral-500 shrink-0" strokeWidth={1.25} aria-hidden />
              عنوان الشحن
            </h3>
            <button
              type="button"
              onClick={() => setEditShippingOpen((v) => !v)}
              className="flex items-center gap-1 text-sm text-neutral-600 hover:text-black"
            >
              <Pencil className="w-4 h-4 shrink-0" aria-hidden />
              {editShippingOpen ? "إلغاء" : "تعديل"}
            </button>
          </div>
          {!editShippingOpen ? (
            <p className="text-sm text-neutral-700 whitespace-pre-wrap">{shippingDisplay}</p>
          ) : (
            <div className="space-y-3 text-sm">
              <input
                placeholder="الاسم الكامل"
                value={editShipping.fullName ?? ""}
                onChange={(e) => setEditShipping((s) => ({ ...s, fullName: e.target.value }))}
                className="w-full border border-neutral-200 px-3 py-2"
              />
              <input
                placeholder="السطر 1"
                value={editShipping.line1 ?? ""}
                onChange={(e) => setEditShipping((s) => ({ ...s, line1: e.target.value }))}
                className="w-full border border-neutral-200 px-3 py-2"
              />
              <input
                placeholder="السطر 2"
                value={editShipping.line2 ?? ""}
                onChange={(e) => setEditShipping((s) => ({ ...s, line2: e.target.value }))}
                className="w-full border border-neutral-200 px-3 py-2"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  placeholder="المدينة"
                  value={editShipping.city ?? ""}
                  onChange={(e) => setEditShipping((s) => ({ ...s, city: e.target.value }))}
                  className="w-full border border-neutral-200 px-3 py-2"
                />
                <input
                  placeholder="المنطقة / المحافظة"
                  value={editShipping.state ?? ""}
                  onChange={(e) => setEditShipping((s) => ({ ...s, state: e.target.value }))}
                  className="w-full border border-neutral-200 px-3 py-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  placeholder="الرمز البريدي"
                  value={editShipping.postCode ?? ""}
                  onChange={(e) => setEditShipping((s) => ({ ...s, postCode: e.target.value }))}
                  className="w-full border border-neutral-200 px-3 py-2"
                />
                <input
                  placeholder="الدولة"
                  value={editShipping.country ?? ""}
                  onChange={(e) => setEditShipping((s) => ({ ...s, country: e.target.value }))}
                  className="w-full border border-neutral-200 px-3 py-2"
                />
              </div>
              <div className="pt-2 border-t border-black/10">
                <p className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1">التتبع</p>
                <input
                  placeholder="شركة الشحن (مثال: DHL، Aramex)"
                  value={editCarrier}
                  onChange={(e) => setEditCarrier(e.target.value)}
                  className="w-full border border-neutral-200 px-3 py-2 mb-2"
                  dir="ltr"
                />
                <input
                  placeholder="رقم التتبع"
                  value={editTracking}
                  onChange={(e) => setEditTracking(e.target.value)}
                  className="w-full border border-neutral-200 px-3 py-2"
                  dir="ltr"
                />
              </div>
              <button
                type="button"
                onClick={saveShippingAndTracking}
                disabled={savingShipping}
                className="mt-2 px-4 py-2 bg-black text-white text-sm disabled:opacity-50"
              >
                {savingShipping ? "جاري الحفظ…" : "حفظ العنوان والتتبع"}
              </button>
            </div>
          )}
        </section>
      </div>

      <section className="bg-white border border-black/10 rounded-sm p-6 md:p-8 mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h3 className="text-lg font-light text-black flex items-center gap-2">
            <Truck className="w-5 h-5 text-neutral-500 shrink-0" strokeWidth={1.25} aria-hidden />
            الشحن والتتبع
          </h3>
          <Link
            href="/admin/shipping"
            className="inline-flex items-center gap-2 text-sm text-black border border-black/20 px-3 py-2 hover:bg-black hover:text-white transition-colors"
          >
            <ExternalLink className="w-4 h-4 shrink-0" strokeWidth={1.5} aria-hidden />
            صفحة الشحن
          </Link>
        </div>

        {order.status === "cancelled" ? (
          <p className="text-sm text-neutral-500 mb-6">تم إلغاء الطلب.</p>
        ) : (
          <div className="mb-6">
            <p className="text-[10px] uppercase tracking-widest text-neutral-500 mb-3">حالة الطلب</p>
            <div className="flex items-center gap-0">
              {[
                { key: "pending", label: "تم الطلب" },
                { key: "paid", label: "مدفوع" },
                { key: "shipped", label: "تم الشحن" },
              ].map((step, i) => {
                const statusOrder = ["pending", "paid", "shipped"] as const;
                const currentIndex = statusOrder.indexOf(order.status as (typeof statusOrder)[number]);
                const stepIndex = statusOrder.indexOf(step.key as (typeof statusOrder)[number]);
                const isActive = currentIndex === stepIndex;
                const isPast = currentIndex > stepIndex;
                return (
                  <div key={step.key} className="flex items-center flex-1 min-w-0">
                    <div className="flex flex-col items-center flex-1">
                      <span
                        className={`inline-flex h-8 w-8 items-center justify-center rounded-full border text-xs font-medium shrink-0 ${
                          isActive
                            ? "border-black bg-black text-white"
                            : isPast
                              ? "border-black bg-black text-white"
                              : "border-black/20 text-neutral-400"
                        }`}
                      >
                        {isPast ? "✓" : i + 1}
                      </span>
                      <span
                        className={`mt-1.5 text-xs truncate max-w-full px-0.5 ${
                          isActive || isPast ? "text-black" : "text-neutral-400"
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                    {i < 2 && (
                      <div
                        className={`flex-1 h-0.5 min-w-[12px] mx-0.5 ${
                          isPast ? "bg-black" : "bg-black/20"
                        }`}
                        aria-hidden
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {order.trackingNumber || order.carrier || order.shippedAt ? (
          <>
            <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              {order.carrier && (
                <div>
                  <dt className="text-[10px] uppercase tracking-widest text-neutral-500">شركة الشحن</dt>
                  <dd className="text-neutral-900" dir="ltr">
                    {order.carrier}
                  </dd>
                </div>
              )}
              {order.trackingNumber && (
                <div>
                  <dt className="text-[10px] uppercase tracking-widest text-neutral-500">رقم التتبع</dt>
                  <dd className="text-neutral-900 font-mono" dir="ltr">
                    {order.trackingNumber}
                  </dd>
                </div>
              )}
              {order.shippedAt && (
                <div>
                  <dt className="text-[10px] uppercase tracking-widest text-neutral-500">تاريخ الشحن</dt>
                  <dd className="text-neutral-700">
                    {new Date(order.shippedAt).toLocaleDateString("ar-SA", dateOpts)}
                  </dd>
                </div>
              )}
            </dl>
            <p className="text-xs text-neutral-500 mt-3">
              أضف شركة الشحن ورقم التتبع عبر <strong>تعديل</strong> في قسم عنوان الشحن أعلاه، أو من{" "}
              <Link href="/admin/shipping" className="underline">
                صفحة الشحن
              </Link>
              .
            </p>
          </>
        ) : (
          <p className="text-sm text-neutral-500">
            لا يوجد رقم تتبع بعد. أضف شركة الشحن والتتبع عبر <strong>تعديل</strong> في قسم عنوان الشحن أعلاه، أو من{" "}
            <Link href="/admin/shipping" className="underline">
              صفحة الشحن
            </Link>
            .
          </p>
        )}
      </section>

      <section className="bg-white border border-black/10 rounded-sm overflow-hidden">
        <div className="p-6 md:p-8 border-b border-black/10 flex items-center gap-2">
          <Package className="w-5 h-5 text-neutral-500 shrink-0" strokeWidth={1.25} aria-hidden />
          <h3 className="text-lg font-light text-black">المنتجات</h3>
        </div>
        {order.items?.length ? (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/10 text-start">
                  <th className="p-4 font-medium">المنتج</th>
                  <th className="p-4 font-medium">السعر</th>
                  <th className="p-4 font-medium">الكمية</th>
                  <th className="p-4 font-medium text-end">المجموع الفرعي</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, i) => {
                  const price = item.price ?? "";
                  const qty = item.quantity ?? 0;
                  const num = parseItemPrice(price);
                  const subtotal = num * qty;
                  return (
                    <tr key={i} className="border-b border-black/5 bg-white">
                      <td className="p-4">{item.name ?? "—"}</td>
                      <td className="p-4 text-neutral-600" dir="ltr">
                        {price || "—"}
                      </td>
                      <td className="p-4">{qty}</td>
                      <td className="p-4 text-end">{formatSar(subtotal)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="p-6 md:p-8 border-t border-black/10 flex justify-end">
              <p className="text-lg font-light">
                الإجمالي: <span className="font-medium">{formatSar(Number(order.total))}</span>
              </p>
            </div>
          </>
        ) : (
          <p className="p-8 text-neutral-500 text-sm">لا توجد أصناف.</p>
        )}
      </section>
    </div>
  );
}
