"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Pencil, Check, X } from "lucide-react";

const serif = { fontFamily: "var(--font-cormorant), serif" };

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
      .then((orders: OrderRow[]) =>
        setList(orders.filter((o) => o.status !== "cancelled"))
      );

  useEffect(() => {
    fetchOrders()
      .catch((e) => setError(e instanceof Error ? e.message : "Error"))
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
      if (!res.ok) throw new Error("Failed to update");
      setEditingId(null);
      await fetchOrders();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-neutral-500" style={serif}>Loading…</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="px-2 md:px-4">
      <p className="text-[10px] uppercase tracking-[0.35em] text-gray-500">Shipping</p>
      <h2 className="mt-2 text-3xl font-light text-neutral-900 md:text-4xl mb-8" style={serif}>
        Tracking
      </h2>
      <p className="text-sm text-neutral-600 mb-6">
        Update carrier and tracking number for any order. You can also mark an order as shipped.
      </p>
      <div className="bg-white border border-black/10 rounded-sm overflow-hidden">
        {list.length === 0 ? (
          <p className="p-8 text-neutral-500 text-center">No orders yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-black/10 text-left">
                <th className="p-4 font-medium">Order</th>
                <th className="p-4 font-medium">Customer</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Carrier</th>
                <th className="p-4 font-medium">Tracking number</th>
                <th className="p-4 font-medium">Shipped</th>
                <th className="p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.flatMap((o) => [
                <tr key={o._id} className="border-b border-black/5 align-top">
                  <td className="p-4 font-mono text-neutral-700">{o._id.slice(-8)}</td>
                  <td className="p-4 text-neutral-600">
                    {o.customer?.fullName || o.customer?.username || "—"}
                  </td>
                  <td className="p-4 capitalize">{o.status}</td>
                  <td className="p-4">{o.carrier || "—"}</td>
                  <td className="p-4 font-mono">{o.trackingNumber || "—"}</td>
                  <td className="p-4 text-neutral-600">
                    {o.shippedAt
                      ? new Date(o.shippedAt).toLocaleDateString(undefined, {
                          dateStyle: "short",
                        })
                      : "—"}
                  </td>
                  <td className="p-4">
                    {editingId === o._id ? (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={saveTracking}
                          disabled={saving}
                          className="inline-flex items-center gap-1 text-black border border-black px-2 py-1 text-xs disabled:opacity-50"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          disabled={saving}
                          className="inline-flex items-center gap-1 text-neutral-600 border border-black/20 px-2 py-1 text-xs"
                        >
                          <X className="w-3.5 h-3.5" />
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => startEdit(o)}
                        className="inline-flex items-center gap-1 text-black underline hover:no-underline"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        Update
                      </button>
                    )}
                    <Link
                      href={`/admin/orders/${o._id}`}
                      className="block mt-1 text-neutral-500 hover:text-black text-xs"
                    >
                      View order
                    </Link>
                  </td>
                </tr>,
                ...(editingId === o._id
                  ? [
                      <tr
                        key={`${o._id}-edit`}
                        className="border-b border-black/5 bg-neutral-50/50"
                      >
                        <td colSpan={7} className="p-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl">
                            <div>
                              <label className="block text-[10px] uppercase tracking-widest text-neutral-500 mb-1">
                                Carrier
                              </label>
                              <input
                                value={editCarrier}
                                onChange={(e) => setEditCarrier(e.target.value)}
                                placeholder="e.g. DHL, FedEx"
                                className="w-full border border-black/20 px-3 py-2 text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] uppercase tracking-widest text-neutral-500 mb-1">
                                Tracking number
                              </label>
                              <input
                                value={editTracking}
                                onChange={(e) => setEditTracking(e.target.value)}
                                placeholder="Tracking number"
                                className="w-full border border-black/20 px-3 py-2 text-sm"
                              />
                            </div>
                            <div className="flex items-end gap-2">
                              <label className="flex items-center gap-2 text-sm">
                                <input
                                  type="checkbox"
                                  checked={editMarkShipped}
                                  onChange={(e) => setEditMarkShipped(e.target.checked)}
                                />
                                Mark as shipped
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
        )}
      </div>
    </div>
  );
}
