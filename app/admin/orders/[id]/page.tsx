"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  Package,
  User,
  ChevronDown,
  Truck,
  Pencil,
  ExternalLink,
} from "lucide-react";

const serif = { fontFamily: "var(--font-cormorant), serif" };

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
      .catch((e) => setError(e instanceof Error ? e.message : "Error"))
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
      if (!res.ok) throw new Error("Failed to update");
      const updated = await res.json();
      setOrder(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
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
      if (!res.ok) throw new Error("Failed to update");
      const updated = await res.json();
      setOrder(updated);
      setEditShippingOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setSavingShipping(false);
    }
  };

  if (loading) return <p className="text-neutral-500" style={serif}>Loading…</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!order) return null;

  const customer = order.customer ?? {};
  const orderShipping = formatShippingAddress(order.shippingAddress);
  const shippingDisplay =
    orderShipping.trim() || customer.address?.trim() || "No address on file.";

  return (
    <div className="px-2 md:px-4">
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-black mb-6"
      >
        <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
        Back to orders
      </Link>

      <p className="text-[10px] uppercase tracking-[0.35em] text-gray-500">Order</p>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-3xl font-light text-neutral-900 md:text-4xl" style={serif}>
          Order {order._id.slice(-8)}
        </h2>
        <div className="flex items-center gap-3">
          <span className="text-sm text-neutral-600">
            {order.createdAt
              ? new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: "medium" })
              : "—"}
          </span>
          <div className="relative">
            <button
              type="button"
              onClick={() => setStatusSelectOpen((v) => !v)}
              disabled={updatingStatus}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-black/20 rounded-sm text-sm capitalize disabled:opacity-50"
            >
              {order.status}
              <ChevronDown className="w-4 h-4" />
            </button>
            {statusSelectOpen && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-black/10 rounded-sm shadow-lg py-1 z-10 min-w-[120px]">
                {STATUS_OPTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => updateStatus(s)}
                    className={`block w-full text-left px-4 py-2 text-sm capitalize hover:bg-neutral-50 ${
                      order.status === s ? "bg-neutral-100 font-medium" : ""
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mt-8 mb-8">
        <section className="bg-white border border-black/10 rounded-sm p-6 md:p-8">
          <h3 className="text-lg font-light text-black mb-5 flex items-center gap-2" style={serif}>
            <User className="w-5 h-5 text-neutral-500" strokeWidth={1.25} />
            Customer
          </h3>
          <p className="text-sm text-neutral-900 font-medium">
            {customer.fullName || customer.username || "—"}
          </p>
          <p className="text-sm text-neutral-600 mt-0.5">{customer.email || "—"}</p>
          {customer.phone && (
            <p className="text-sm text-neutral-600 mt-0.5">{customer.phone}</p>
          )}
          <Link
            href={`/admin/customers/${customer._id}`}
            className="inline-block mt-3 text-sm text-black underline hover:no-underline"
          >
            View customer →
          </Link>
        </section>

        <section className="bg-white border border-black/10 rounded-sm p-6 md:p-8">
          <div className="flex items-center justify-between gap-2 mb-5">
            <h3 className="text-lg font-light text-black flex items-center gap-2" style={serif}>
              <MapPin className="w-5 h-5 text-neutral-500" strokeWidth={1.25} />
              Shipping address
            </h3>
            <button
              type="button"
              onClick={() => setEditShippingOpen((v) => !v)}
              className="flex items-center gap-1 text-sm text-neutral-600 hover:text-black"
            >
              <Pencil className="w-4 h-4" />
              {editShippingOpen ? "Cancel" : "Edit"}
            </button>
          </div>
          {!editShippingOpen ? (
            <p className="text-sm text-neutral-700 whitespace-pre-wrap">{shippingDisplay}</p>
          ) : (
            <div className="space-y-3 text-sm">
              <input
                placeholder="Full name"
                value={editShipping.fullName ?? ""}
                onChange={(e) => setEditShipping((s) => ({ ...s, fullName: e.target.value }))}
                className="w-full border border-neutral-200 px-3 py-2"
              />
              <input
                placeholder="Address line 1"
                value={editShipping.line1 ?? ""}
                onChange={(e) => setEditShipping((s) => ({ ...s, line1: e.target.value }))}
                className="w-full border border-neutral-200 px-3 py-2"
              />
              <input
                placeholder="Address line 2"
                value={editShipping.line2 ?? ""}
                onChange={(e) => setEditShipping((s) => ({ ...s, line2: e.target.value }))}
                className="w-full border border-neutral-200 px-3 py-2"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  placeholder="City"
                  value={editShipping.city ?? ""}
                  onChange={(e) => setEditShipping((s) => ({ ...s, city: e.target.value }))}
                  className="w-full border border-neutral-200 px-3 py-2"
                />
                <input
                  placeholder="State"
                  value={editShipping.state ?? ""}
                  onChange={(e) => setEditShipping((s) => ({ ...s, state: e.target.value }))}
                  className="w-full border border-neutral-200 px-3 py-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  placeholder="Post code"
                  value={editShipping.postCode ?? ""}
                  onChange={(e) => setEditShipping((s) => ({ ...s, postCode: e.target.value }))}
                  className="w-full border border-neutral-200 px-3 py-2"
                />
                <input
                  placeholder="Country"
                  value={editShipping.country ?? ""}
                  onChange={(e) => setEditShipping((s) => ({ ...s, country: e.target.value }))}
                  className="w-full border border-neutral-200 px-3 py-2"
                />
              </div>
              <div className="pt-2 border-t border-black/10">
                <p className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1">
                  Tracking
                </p>
                <input
                  placeholder="Carrier (e.g. DHL, FedEx)"
                  value={editCarrier}
                  onChange={(e) => setEditCarrier(e.target.value)}
                  className="w-full border border-neutral-200 px-3 py-2 mb-2"
                />
                <input
                  placeholder="Tracking number"
                  value={editTracking}
                  onChange={(e) => setEditTracking(e.target.value)}
                  className="w-full border border-neutral-200 px-3 py-2"
                />
              </div>
              <button
                type="button"
                onClick={saveShippingAndTracking}
                disabled={savingShipping}
                className="mt-2 px-4 py-2 bg-black text-white text-sm disabled:opacity-50"
              >
                {savingShipping ? "Saving…" : "Save shipping & tracking"}
              </button>
            </div>
          )}
        </section>
      </div>

      <section className="bg-white border border-black/10 rounded-sm p-6 md:p-8 mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h3 className="text-lg font-light text-black flex items-center gap-2" style={serif}>
            <Truck className="w-5 h-5 text-neutral-500" strokeWidth={1.25} />
            Shipping & tracking
          </h3>
          <Link
            href="/admin/shipping"
            className="inline-flex items-center gap-2 text-sm text-black border border-black/20 px-3 py-2 hover:bg-black hover:text-white transition-colors"
          >
            <ExternalLink className="w-4 h-4" strokeWidth={1.5} />
            Go to Shipping page
          </Link>
        </div>

        {/* Status stepper */}
        {order.status === "cancelled" ? (
          <p className="text-sm text-neutral-500 mb-6">Order cancelled.</p>
        ) : (
          <div className="mb-6">
            <p className="text-[10px] uppercase tracking-widest text-neutral-500 mb-3">
              Order status
            </p>
            <div className="flex items-center gap-0">
              {[
                { key: "pending", label: "Order placed" },
                { key: "paid", label: "Paid" },
                { key: "shipped", label: "Shipped" },
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
                  <dt className="text-[10px] uppercase tracking-widest text-neutral-500">Carrier</dt>
                  <dd className="text-neutral-900">{order.carrier}</dd>
                </div>
              )}
              {order.trackingNumber && (
                <div>
                  <dt className="text-[10px] uppercase tracking-widest text-neutral-500">
                    Tracking number
                  </dt>
                  <dd className="text-neutral-900 font-mono">{order.trackingNumber}</dd>
                </div>
              )}
              {order.shippedAt && (
                <div>
                  <dt className="text-[10px] uppercase tracking-widest text-neutral-500">
                    Shipped
                  </dt>
                  <dd className="text-neutral-700">
                    {new Date(order.shippedAt).toLocaleDateString(undefined, {
                      dateStyle: "medium",
                    })}
                  </dd>
                </div>
              )}
            </dl>
            <p className="text-xs text-neutral-500 mt-3">
              Add or edit carrier and tracking via <strong>Edit</strong> in Shipping address above, or
              on the <Link href="/admin/shipping" className="underline">Shipping page</Link>.
            </p>
          </>
        ) : (
          <p className="text-sm text-neutral-500">
            No tracking number yet. Add carrier and tracking via <strong>Edit</strong> in the
            Shipping address section above, or on the <Link href="/admin/shipping" className="underline">Shipping page</Link>.
          </p>
        )}
      </section>

      <section className="bg-white border border-black/10 rounded-sm overflow-hidden">
        <div className="p-6 md:p-8 border-b border-black/10 flex items-center gap-2">
          <Package className="w-5 h-5 text-neutral-500" strokeWidth={1.25} />
          <h3 className="text-lg font-light text-black" style={serif}>
            Items
          </h3>
        </div>
        {order.items?.length ? (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/10 text-left">
                  <th className="p-4 font-medium">Product</th>
                  <th className="p-4 font-medium">Price</th>
                  <th className="p-4 font-medium">Qty</th>
                  <th className="p-4 font-medium text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, i) => {
                  const price = item.price ?? "";
                  const qty = item.quantity ?? 0;
                  const num = parseFloat(price.replace(/[$,]/g, "")) || 0;
                  const subtotal = num * qty;
                  return (
                    <tr key={i} className="border-b border-black/5">
                      <td className="p-4">{item.name ?? "—"}</td>
                      <td className="p-4 text-neutral-600">{price || "—"}</td>
                      <td className="p-4">{qty}</td>
                      <td className="p-4 text-right">${subtotal.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="p-6 md:p-8 border-t border-black/10 flex justify-end">
              <p className="text-lg font-light" style={serif}>
                Total: <span className="font-medium">${Number(order.total).toFixed(2)}</span>
              </p>
            </div>
          </>
        ) : (
          <p className="p-8 text-neutral-500 text-sm">No items.</p>
        )}
      </section>
    </div>
  );
}
