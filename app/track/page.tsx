"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Truck } from "lucide-react";

const serif = { fontFamily: "var(--font-cormorant), serif" };

type TrackResult = {
  orderId: string;
  status: string;
  trackingNumber: string | null;
  carrier: string | null;
  shippedAt: string | null;
};

export default function TrackPage() {
  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<TrackResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const id = searchParams.get("orderId")?.trim();
    if (id) setOrderId(id);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    const id = orderId.trim();
    const em = email.trim();
    if (!id || !em) {
      setError("Please enter your Order ID and email.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `/api/track?orderId=${encodeURIComponent(id)}&email=${encodeURIComponent(em)}`
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Order not found. Check your Order ID and email.");
        return;
      }
      setResult(data);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="min-h-screen py-16 md:py-24 px-6 md:px-10"
      style={{ backgroundColor: "#ffffff" }}
    >
      <div className="mx-auto max-w-xl">
        <p className="text-[10px] uppercase tracking-[0.35em] text-gray-500">Track</p>
        <h1 className="mt-2 text-3xl font-light text-neutral-900 md:text-4xl mb-2" style={serif}>
          Track your order
        </h1>
        <p className="text-sm text-neutral-600 mb-8">
          Enter the Order ID from your confirmation and the email you used to place the order.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 mb-10">
          <div>
            <label htmlFor="orderId" className="block text-xs uppercase tracking-widest text-neutral-500 mb-1">
              Order ID
            </label>
            <input
              id="orderId"
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="e.g. 507f1f77bcf86cd799439011"
              className="w-full border border-black/20 px-4 py-3 text-sm focus:outline-none focus:border-black"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-xs uppercase tracking-widest text-neutral-500 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full border border-black/20 px-4 py-3 text-sm focus:outline-none focus:border-black"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-black text-white text-sm uppercase tracking-widest disabled:opacity-50"
          >
            {loading ? "Looking up…" : "Track order"}
          </button>
        </form>

        {result && (
          <div className="bg-white border border-black/10 rounded-sm p-6 md:p-8">
            <div className="flex items-center gap-2 mb-5">
              <Truck className="w-5 h-5 text-neutral-500" strokeWidth={1.25} />
              <h2 className="text-lg font-light text-black" style={serif}>
                Order status
              </h2>
            </div>
            <dl className="space-y-4 text-sm">
              <div>
                <dt className="text-[10px] uppercase tracking-widest text-neutral-500">Status</dt>
                <dd className="mt-0.5 capitalize text-neutral-900">{result.status}</dd>
              </div>
              {result.carrier && (
                <div>
                  <dt className="text-[10px] uppercase tracking-widest text-neutral-500">Carrier</dt>
                  <dd className="mt-0.5 text-neutral-900">{result.carrier}</dd>
                </div>
              )}
              {result.trackingNumber && (
                <div>
                  <dt className="text-[10px] uppercase tracking-widest text-neutral-500">
                    Tracking number
                  </dt>
                  <dd className="mt-0.5 font-mono text-neutral-900">{result.trackingNumber}</dd>
                </div>
              )}
              {result.shippedAt && (
                <div>
                  <dt className="text-[10px] uppercase tracking-widest text-neutral-500">
                    Shipped on
                  </dt>
                  <dd className="mt-0.5 text-neutral-700">
                    {new Date(result.shippedAt).toLocaleDateString(undefined, {
                      dateStyle: "medium",
                    })}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        )}
      </div>
    </main>
  );
}
