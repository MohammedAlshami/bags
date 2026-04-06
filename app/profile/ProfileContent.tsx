"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Package, Truck, MapPin, LogOut, ChevronLeft } from "lucide-react";
import { sans, pagePaddingX } from "@/lib/page-theme";

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

function formatSar(n: number) {
  return (
    new Intl.NumberFormat("ar-SA", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n) + " ر.س"
  );
}

function statusAr(s: string) {
  const m: Record<string, string> = {
    pending: "قيد الانتظار",
    processing: "قيد التجهيز",
    shipped: "تم الشحن",
    delivered: "تم التسليم",
    cancelled: "ملغاة",
  };
  return m[s] ?? s;
}

export default function ProfileContent() {
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
      if (!res.ok) throw new Error("save");
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
      <main className="flex min-h-screen flex-col items-center justify-center bg-white pb-24 pt-24" dir="rtl">
        <p className="text-neutral-500" style={sans}>
          جاري التحميل…
        </p>
      </main>
    );
  }

  if (!user || user.role === "admin") return null;

  const navItems: (
    | { type: "tab"; id: Tab; label: string; icon: React.ReactNode }
    | { type: "link"; href: string; label: string; icon: React.ReactNode }
  )[] = [
    { type: "tab", id: "orders", label: "طلباتي", icon: <Package className="h-5 w-5" strokeWidth={1.25} /> },
    { type: "link", href: "/profile/track", label: "تتبع الطلب", icon: <Truck className="h-5 w-5" strokeWidth={1.25} /> },
    { type: "tab", id: "billing", label: "الفوترة والشحن", icon: <MapPin className="h-5 w-5" strokeWidth={1.25} /> },
  ];

  return (
    <main className="min-h-screen bg-white pb-24 pt-24 md:pb-32 md:pt-32" dir="rtl">
      <div className={`w-full ${pagePaddingX}`}>
        <p className="text-xs text-neutral-500" style={sans}>
          الحساب
        </p>
        <h1 className="mt-2 text-3xl font-medium text-neutral-900 md:text-4xl" style={sans}>
          حسابي
        </h1>

        <div className="mt-10 flex flex-col gap-8 md:flex-row">
          <aside className="w-full shrink-0 rounded-sm border border-black/10 p-4 md:w-56 md:border-0 md:bg-transparent md:p-0">
            <nav className="hide-scrollbar flex flex-row gap-0 overflow-x-auto md:flex-col md:overflow-visible">
              {navItems.map((item) =>
                item.type === "link" ? (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 whitespace-nowrap border-b border-black/10 px-4 py-3 text-end text-sm text-neutral-600 hover:text-black md:py-3"
                    style={sans}
                  >
                    {item.icon}
                    {item.label}
                    <ChevronLeft className="mr-auto h-4 w-4 md:hidden" />
                  </Link>
                ) : (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTab(item.id)}
                    className={`flex items-center gap-3 whitespace-nowrap border-b border-black/10 px-4 py-3 text-end text-sm md:py-3 ${
                      tab === item.id ? "border-black/20 font-semibold text-black" : "text-neutral-600 hover:text-black"
                    }`}
                    style={sans}
                  >
                    {item.icon}
                    {item.label}
                    <ChevronLeft className="mr-auto h-4 w-4 md:hidden" />
                  </button>
                )
              )}
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-3 border-t border-black/10 px-4 py-3 text-end text-sm text-neutral-600 hover:text-black md:mt-4 md:border-t"
                style={sans}
              >
                <LogOut className="h-5 w-5" strokeWidth={1.25} />
                تسجيل الخروج
              </button>
            </nav>
          </aside>

          <div className="min-w-0 flex-1 rounded-sm border border-black/10 bg-white p-6 md:p-8">
            {tab === "orders" && (
              <>
                <h2 className="mb-6 text-lg font-medium text-black" style={sans}>
                  طلباتي
                </h2>
                {orders.length === 0 ? (
                  <p className="text-sm text-neutral-500" style={sans}>
                    لم تقدّمي أي طلبات بعد.
                  </p>
                ) : (
                  <ul className="space-y-4">
                    {orders.map((o) => (
                      <li key={o._id} className="rounded-sm border border-black/10 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <p className="text-sm font-medium" style={sans}>
                              طلب {String(o._id).slice(-8)} ·{" "}
                              {new Date(o.createdAt ?? "").toLocaleDateString("ar-SA")}
                            </p>
                            <p className="mt-0.5 text-xs text-neutral-500" style={sans}>
                              {statusAr(o.status)}
                            </p>
                          </div>
                          <p className="text-sm" style={sans}>
                            {o.total != null ? formatSar(Number(o.total)) : "—"}
                          </p>
                        </div>
                        {o.trackingNumber && (
                          <p className="mt-2 text-xs text-neutral-600" style={sans}>
                            تتبع: {o.carrier} {o.trackingNumber}
                          </p>
                        )}
                        <Link
                          href="/profile/track"
                          className="mt-2 inline-block text-xs text-black underline hover:no-underline"
                          style={sans}
                        >
                          عرض التتبع
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}

            {tab === "billing" && (
              <>
                <h2 className="mb-6 text-lg font-medium text-black" style={sans}>
                  الفوترة والشحن
                </h2>
                <div className="grid max-w-md gap-4">
                  <div>
                    <label className="mb-1 block text-xs text-neutral-500" style={sans}>
                      البريد الإلكتروني
                    </label>
                    <input
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="w-full border border-neutral-200 px-3 py-2 text-sm"
                      style={sans}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-neutral-500" style={sans}>
                      الاسم الكامل
                    </label>
                    <input
                      value={editFullName}
                      onChange={(e) => setEditFullName(e.target.value)}
                      className="w-full border border-neutral-200 px-3 py-2 text-sm"
                      style={sans}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-neutral-500" style={sans}>
                      الجوال
                    </label>
                    <input
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full border border-neutral-200 px-3 py-2 text-sm"
                      style={sans}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-neutral-500" style={sans}>
                      عنوان الشحن
                    </label>
                    <textarea
                      value={editAddress}
                      onChange={(e) => setEditAddress(e.target.value)}
                      className="w-full border border-neutral-200 px-3 py-2 text-sm"
                      rows={3}
                      style={sans}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={saveProfile}
                    disabled={savingProfile}
                    className="rounded-full bg-neutral-900 px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                    style={sans}
                  >
                    {savingProfile ? "جاري الحفظ…" : "حفظ التغييرات"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <p className="mt-8 text-center">
          <Link href="/" className="text-sm text-neutral-600 hover:text-black hover:underline" style={sans}>
            العودة للرئيسية
          </Link>
        </p>
      </div>
    </main>
  );
}
