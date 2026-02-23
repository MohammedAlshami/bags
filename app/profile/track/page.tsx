"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Package, Truck, MapPin, LogOut, ChevronRight } from "lucide-react";

const serif = { fontFamily: "var(--font-cormorant), serif" };
const bgWhite = { backgroundColor: "#ffffff" };

type Order = {
  _id: string;
  status: string;
  total?: number;
  createdAt?: string;
  trackingNumber?: string;
  carrier?: string;
  shippedAt?: string | null;
  items?: { name?: string; quantity?: number; price?: string }[];
};

export default function ProfileTrackPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ username: string; role: string } | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        const u = data.user ?? null;
        setUser(u);
        if (!u) {
          router.replace("/login");
          return;
        }
        if (u.role === "admin") {
          router.replace("/admin");
          return;
        }
        return fetch("/api/me/orders").then((r) => r.json());
      })
      .then((list) => {
        if (Array.isArray(list)) setOrders(list);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  };

  if (loading) {
    return (
      <main className="min-h-screen flex flex-col pt-24 pb-24 items-center justify-center" style={bgWhite}>
        <p className="text-neutral-500" style={serif}>Loading…</p>
      </main>
    );
  }

  if (!user || user.role === "admin") return null;

  const navItems = [
    { label: "My orders", href: "/profile", icon: <Package className="w-5 h-5" strokeWidth={1.25} /> },
    { label: "Track order", href: "/profile/track", icon: <Truck className="w-5 h-5" strokeWidth={1.25} />, current: true },
    { label: "Billing & shipping", href: "/profile?tab=billing", icon: <MapPin className="w-5 h-5" strokeWidth={1.25} /> },
  ];

  return (
    <main className="min-h-screen pt-24 pb-24 md:pt-32 md:pb-32" style={bgWhite}>
      <div className="w-full px-4 sm:px-8 md:px-14 lg:px-24">
        <p className="text-[10px] uppercase tracking-[0.35em] text-gray-500">Account</p>
        <h1 className="mt-2 text-3xl font-light text-neutral-900 md:text-4xl" style={serif}>
          Track your orders
        </h1>
        <p className="mt-1 text-sm text-neutral-600">
          Your orders and tracking details. No need to enter your email — you’re logged in.
        </p>

        <div className="mt-10 flex flex-col md:flex-row gap-8">
          {/* Sidebar - same as profile */}
          <aside className="w-full md:w-56 shrink-0 border border-black/10 rounded-sm p-4 md:p-0 md:border-0">
            <nav className="flex flex-row md:flex-col gap-0 overflow-x-auto md:overflow-visible hide-scrollbar">
              {navItems.map((item) => (
                item.current ? (
                  <span
                    key={item.label}
                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-black border-b border-black/10"
                  >
                    {item.icon}
                    {item.label}
                  </span>
                ) : (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-neutral-600 hover:text-black border-b border-black/10"
                  >
                    {item.icon}
                    {item.label}
                    <ChevronRight className="w-4 h-4 ml-auto md:hidden" />
                  </Link>
                )
              ))}
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 md:mt-4 text-left text-sm text-neutral-600 hover:text-black border-t border-black/10 md:border-t"
              >
                <LogOut className="w-5 h-5" strokeWidth={1.25} />
                Sign out
              </button>
            </nav>
          </aside>

          {/* Tracking content */}
          <div className="flex-1 min-w-0 bg-white border border-black/10 rounded-sm p-6 md:p-8">
            {orders.length === 0 ? (
              <p className="text-sm text-neutral-500">You haven’t placed any orders yet.</p>
            ) : (
              <ul className="space-y-6">
                {orders.map((o) => (
                  <li key={o._id} className="border border-black/10 rounded-sm p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-black">
                          Order {String(o._id).slice(-8)}
                        </p>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          Placed {new Date(o.createdAt ?? "").toLocaleDateString(undefined, { dateStyle: "medium" })}
                        </p>
                        <p className="mt-2 text-sm">
                          Total {o.total != null ? `$${Number(o.total).toFixed(2)}` : "—"}
                        </p>
                      </div>
                      <span className={`inline-flex px-3 py-1 text-xs font-medium capitalize rounded-sm ${
                        o.status === "shipped" ? "bg-green-100 text-green-800" :
                        o.status === "cancelled" ? "bg-red-100 text-red-800" :
                        "bg-neutral-100 text-neutral-800"
                      }`}>
                        {o.status}
                      </span>
                    </div>

                    {/* Tracking details - only show section if we have tracking or shipped */}
                    {(o.trackingNumber || o.carrier || o.shippedAt) ? (
                      <div className="mt-4 pt-4 border-t border-black/10">
                        <p className="text-[10px] uppercase tracking-widest text-neutral-500 mb-2">
                          Tracking
                        </p>
                        <dl className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                          {o.carrier && (
                            <div>
                              <dt className="text-neutral-500">Carrier</dt>
                              <dd className="font-medium">{o.carrier}</dd>
                            </div>
                          )}
                          {o.trackingNumber && (
                            <div>
                              <dt className="text-neutral-500">Tracking number</dt>
                              <dd className="font-mono">{o.trackingNumber}</dd>
                            </div>
                          )}
                          {o.shippedAt && (
                            <div>
                              <dt className="text-neutral-500">Shipped</dt>
                              <dd>
                                {new Date(o.shippedAt).toLocaleDateString(undefined, { dateStyle: "medium" })}
                              </dd>
                            </div>
                          )}
                        </dl>
                        {o.carrier && o.trackingNumber && (
                          <p className="text-xs text-neutral-500 mt-2">
                            Track with {o.carrier} using the number above, or check your email for a tracking link.
                          </p>
                        )}
                      </div>
                    ) : (
                      o.status !== "cancelled" && (
                        <p className="mt-4 pt-4 border-t border-black/10 text-sm text-neutral-500">
                          Tracking not yet available. We’ll email you when your order ships.
                        </p>
                      )
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <p className="mt-8 text-center">
          <Link href="/profile" className="text-sm text-gray-600 hover:text-black hover:underline">
            ← Back to profile
          </Link>
        </p>
      </div>
    </main>
  );
}
