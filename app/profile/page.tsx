"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Package,
  Truck,
  MapPin,
  LogOut,
  ChevronRight,
} from "lucide-react";

const serif = { fontFamily: "var(--font-cormorant), serif" };
const bgWhite = { backgroundColor: "#ffffff" };

type User = { username: string; role: string } | null;
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
type Profile = {
  username: string;
  email?: string;
  fullName?: string;
  address?: string;
  phone?: string;
};

type Tab = "orders" | "billing";

export default function ProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const tabFromUrl = searchParams.get("tab") === "billing" ? "billing" : "orders";
  const [tab, setTab] = useState<Tab>(tabFromUrl);

  useEffect(() => {
    setTab(tabFromUrl);
  }, [tabFromUrl]);
  const [savingProfile, setSavingProfile] = useState(false);
  const [editEmail, setEditEmail] = useState("");
  const [editFullName, setEditFullName] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editPhone, setEditPhone] = useState("");

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
        return Promise.all([
          fetch("/api/me/profile").then((r) => r.json()),
          fetch("/api/me/orders").then((r) => r.json()),
        ]);
      })
      .then((result) => {
        if (result) {
          setProfile(result[0]);
          setEditEmail(result[0].email ?? "");
          setEditFullName(result[0].fullName ?? "");
          setEditAddress(result[0].address ?? "");
          setEditPhone(result[0].phone ?? "");
          setOrders(Array.isArray(result[1]) ? result[1] : []);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  };

  const saveProfile = async () => {
    setSavingProfile(true);
    try {
      const res = await fetch("/api/me/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: editEmail,
          fullName: editFullName,
          address: editAddress,
          phone: editPhone,
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      const data = await res.json();
      setProfile(data);
    } catch (e) {
      console.error(e);
    } finally {
      setSavingProfile(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen flex flex-col pt-24 pb-24 items-center justify-center" style={bgWhite}>
        <p className="text-neutral-500" style={serif}>Loading…</p>
      </main>
    );
  }

  if (!user || user.role === "admin") return null;

  const navItems: ({ type: "tab"; id: Tab; label: string; icon: React.ReactNode } | { type: "link"; href: string; label: string; icon: React.ReactNode })[] = [
    { type: "tab", id: "orders", label: "My orders", icon: <Package className="w-5 h-5" strokeWidth={1.25} /> },
    { type: "link", href: "/profile/track", label: "Track order", icon: <Truck className="w-5 h-5" strokeWidth={1.25} /> },
    { type: "tab", id: "billing", label: "Billing & shipping", icon: <MapPin className="w-5 h-5" strokeWidth={1.25} /> },
  ];

  return (
    <main className="min-h-screen pt-24 pb-24 md:pt-32 md:pb-32" style={bgWhite}>
      <div className="w-full px-4 sm:px-8 md:px-14 lg:px-24">
        <p className="text-[10px] uppercase tracking-[0.35em] text-gray-500">Account</p>
        <h1 className="mt-2 text-3xl font-light text-neutral-900 md:text-4xl" style={serif}>
          Profile
        </h1>

        <div className="mt-10 flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full md:w-56 shrink-0 border border-black/10 rounded-sm p-4 md:p-0 md:border-0 md:bg-transparent">
            <nav className="flex flex-row md:flex-col gap-0 md:gap-0 overflow-x-auto md:overflow-visible hide-scrollbar">
              {navItems.map((item) =>
                item.type === "link" ? (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 px-4 py-3 md:py-3 text-left text-sm whitespace-nowrap border-b md:border-b border-black/10 text-neutral-600 hover:text-black"
                  >
                    {item.icon}
                    {item.label}
                    <ChevronRight className="w-4 h-4 ml-auto md:hidden" />
                  </Link>
                ) : (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTab(item.id)}
                    className={`flex items-center gap-3 px-4 py-3 md:py-3 text-left text-sm whitespace-nowrap border-b md:border-b border-black/10 ${
                      tab === item.id ? "text-black font-medium border-black/20" : "text-neutral-600 hover:text-black"
                    }`}
                  >
                    {item.icon}
                    {item.label}
                    <ChevronRight className="w-4 h-4 ml-auto md:hidden" />
                  </button>
                )
              )}
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

          {/* Content */}
          <div className="flex-1 min-w-0 bg-white border border-black/10 rounded-sm p-6 md:p-8">
            {tab === "orders" && (
              <>
                <h2 className="text-lg font-light text-black mb-6" style={serif}>
                  My orders
                </h2>
                {orders.length === 0 ? (
                  <p className="text-sm text-neutral-500">You haven’t placed any orders yet.</p>
                ) : (
                  <ul className="space-y-4">
                    {orders.map((o) => (
                      <li key={o._id} className="border border-black/10 rounded-sm p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <p className="text-sm font-medium">
                              Order {String(o._id).slice(-8)} · {new Date(o.createdAt ?? "").toLocaleDateString()}
                            </p>
                            <p className="text-xs text-neutral-500 capitalize mt-0.5">{o.status}</p>
                          </div>
                          <p className="text-sm">
                            {o.total != null ? `$${Number(o.total).toFixed(2)}` : "—"}
                          </p>
                        </div>
                        {o.trackingNumber && (
                          <p className="text-xs text-neutral-600 mt-2">
                            Track: {o.carrier} {o.trackingNumber}
                          </p>
                        )}
                        <Link
                          href="/profile/track"
                          className="inline-block mt-2 text-xs text-black underline hover:no-underline"
                        >
                          View tracking →
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}

            {tab === "billing" && (
              <>
                <h2 className="text-lg font-light text-black mb-6" style={serif}>
                  Billing & shipping
                </h2>
                <div className="grid gap-4 max-w-md">
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-1">Email</label>
                    <input
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="w-full border border-neutral-200 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-1">Full name</label>
                    <input
                      value={editFullName}
                      onChange={(e) => setEditFullName(e.target.value)}
                      className="w-full border border-neutral-200 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-1">Phone</label>
                    <input
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full border border-neutral-200 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-1">
                      Shipping address
                    </label>
                    <textarea
                      value={editAddress}
                      onChange={(e) => setEditAddress(e.target.value)}
                      className="w-full border border-neutral-200 px-3 py-2 text-sm"
                      rows={3}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={saveProfile}
                    disabled={savingProfile}
                    className="px-4 py-2 bg-black text-white text-sm disabled:opacity-50"
                  >
                    {savingProfile ? "Saving…" : "Save changes"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <p className="mt-8 text-center">
          <Link href="/" className="text-sm text-gray-600 hover:text-black hover:underline">
            ← Back to home
          </Link>
        </p>
      </div>
    </main>
  );
}
