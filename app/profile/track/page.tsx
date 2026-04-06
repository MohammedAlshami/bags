"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Package, Truck, MapPin, LogOut, ChevronLeft } from "lucide-react";
import { sans, pagePaddingX } from "@/lib/page-theme";

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
      <main className="flex min-h-screen flex-col items-center justify-center bg-white pb-24 pt-24" dir="rtl">
        <p className="text-neutral-500" style={sans}>
          جاري التحميل…
        </p>
      </main>
    );
  }

  if (!user || user.role === "admin") return null;

  const navItems = [
    { label: "طلباتي", href: "/profile", icon: <Package className="h-5 w-5" strokeWidth={1.25} /> },
    { label: "تتبع الطلب", href: "/profile/track", icon: <Truck className="h-5 w-5" strokeWidth={1.25} />, current: true },
    { label: "الفوترة والشحن", href: "/profile?tab=billing", icon: <MapPin className="h-5 w-5" strokeWidth={1.25} /> },
  ];

  return (
    <main className="min-h-screen bg-white pb-24 pt-24 md:pb-32 md:pt-32" dir="rtl">
      <div className={`w-full ${pagePaddingX}`}>
        <p className="text-xs text-neutral-500" style={sans}>
          الحساب
        </p>
        <h1 className="mt-2 text-3xl font-medium text-neutral-900 md:text-4xl" style={sans}>
          تتبع طلباتك
        </h1>
        <p className="mt-1 text-sm text-neutral-600" style={sans}>
          تفاصيل الطلبات والشحن دون إدخال البريد — أنتِ مسجّلة الدخول.
        </p>

        <div className="mt-10 flex flex-col gap-8 md:flex-row">
          <aside className="w-full shrink-0 rounded-sm border border-black/10 p-4 md:w-56 md:border-0">
            <nav className="hide-scrollbar flex flex-row gap-0 overflow-x-auto md:flex-col md:overflow-visible">
              {navItems.map((item) =>
                item.current ? (
                  <span
                    key={item.label}
                    className="flex items-center gap-3 whitespace-nowrap border-b border-black/10 px-4 py-3 text-sm font-semibold text-black"
                    style={sans}
                  >
                    {item.icon}
                    {item.label}
                  </span>
                ) : (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="flex items-center gap-3 whitespace-nowrap border-b border-black/10 px-4 py-3 text-sm text-neutral-600 hover:text-black"
                    style={sans}
                  >
                    {item.icon}
                    {item.label}
                    <ChevronLeft className="mr-auto h-4 w-4 md:hidden" />
                  </Link>
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
            {orders.length === 0 ? (
              <p className="text-sm text-neutral-500" style={sans}>
                لم تقدّمي أي طلبات بعد.
              </p>
            ) : (
              <ul className="space-y-6">
                {orders.map((o) => (
                  <li key={o._id} className="rounded-sm border border-black/10 p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-black" style={sans}>
                          طلب {String(o._id).slice(-8)}
                        </p>
                        <p className="mt-0.5 text-xs text-neutral-500" style={sans}>
                          بتاريخ{" "}
                          {new Date(o.createdAt ?? "").toLocaleDateString("ar-SA", { dateStyle: "medium" })}
                        </p>
                        <p className="mt-2 text-sm" style={sans}>
                          الإجمالي {o.total != null ? formatSar(Number(o.total)) : "—"}
                        </p>
                      </div>
                      <span
                        className={`inline-flex rounded-sm px-3 py-1 text-xs font-medium ${
                          o.status === "shipped"
                            ? "bg-green-100 text-green-800"
                            : o.status === "cancelled"
                              ? "bg-red-100 text-red-800"
                              : "bg-neutral-100 text-neutral-800"
                        }`}
                        style={sans}
                      >
                        {statusAr(o.status)}
                      </span>
                    </div>

                    {o.trackingNumber || o.carrier || o.shippedAt ? (
                      <div className="mt-4 border-t border-black/10 pt-4">
                        <p className="mb-2 text-xs text-neutral-500" style={sans}>
                          التتبع
                        </p>
                        <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-3">
                          {o.carrier && (
                            <div>
                              <dt className="text-neutral-500" style={sans}>
                                الناقل
                              </dt>
                              <dd className="font-medium" style={sans}>
                                {o.carrier}
                              </dd>
                            </div>
                          )}
                          {o.trackingNumber && (
                            <div>
                              <dt className="text-neutral-500" style={sans}>
                                رقم التتبع
                              </dt>
                              <dd className="font-mono">{o.trackingNumber}</dd>
                            </div>
                          )}
                          {o.shippedAt && (
                            <div>
                              <dt className="text-neutral-500" style={sans}>
                                الشحن
                              </dt>
                              <dd style={sans}>
                                {new Date(o.shippedAt).toLocaleDateString("ar-SA", { dateStyle: "medium" })}
                              </dd>
                            </div>
                          )}
                        </dl>
                        {o.carrier && o.trackingNumber && (
                          <p className="mt-2 text-xs text-neutral-500" style={sans}>
                            يمكنك التتبع عبر الناقل أو من رابط أرسلناه لبريدك.
                          </p>
                        )}
                      </div>
                    ) : (
                      o.status !== "cancelled" && (
                        <p className="mt-4 border-t border-black/10 pt-4 text-sm text-neutral-500" style={sans}>
                          التتبع غير متاح بعد. سنرسل لكِ بريداً عند الشحن.
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
          <Link href="/profile" className="text-sm text-neutral-600 hover:text-black hover:underline" style={sans}>
            العودة لحسابي
          </Link>
        </p>
      </div>
    </main>
  );
}
