"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronLeft, Pencil } from "lucide-react";
import { sans, pagePaddingX } from "@/lib/page-theme";
import { ProfileBreadcrumb, ProfileAccountNav } from "@/app/components/profile/ProfileAccountChrome";
import { formatSar } from "@/lib/format-sar";

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

function statusAr(s: string) {
  const m: Record<string, string> = {
    pending: "في انتظار الدفع",
    paid: "مدفوع",
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
  const tabParam = searchParams.get("tab");
  const tabFromUrl: Tab =
    tabParam === "billing" || tabParam === "details" ? "billing" : "orders";

  const [savingProfile, setSavingProfile] = useState(false);
  const [billingEditing, setBillingEditing] = useState(false);
  const [editEmail, setEditEmail] = useState("");
  const [editFullName, setEditFullName] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editPhone, setEditPhone] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const meRes = await fetch("/api/auth/me", { credentials: "include" });
        const meData = await meRes.json();
        const u = meData.user ?? null;
        if (cancelled) return;
        if (!u) {
          router.replace("/login");
          return;
        }
        if (u.role === "admin") {
          router.replace("/admin");
          return;
        }
        setUser(u);

        const [pRes, oRes] = await Promise.all([
          fetch("/api/me/profile", { credentials: "include" }),
          fetch("/api/me/orders", { credentials: "include" }),
        ]);
        const pJson = (await pRes.json()) as Record<string, unknown>;
        const oJson = await oRes.json();
        if (cancelled) return;

        if (
          pRes.ok &&
          pJson &&
          typeof pJson === "object" &&
          typeof pJson.error !== "string"
        ) {
          const merged: Profile = {
            username: typeof pJson.username === "string" ? pJson.username : u.username,
            email: typeof pJson.email === "string" ? pJson.email : undefined,
            fullName: typeof pJson.fullName === "string" ? pJson.fullName : undefined,
            address: typeof pJson.address === "string" ? pJson.address : undefined,
            phone: typeof pJson.phone === "string" ? pJson.phone : undefined,
          };
          setProfile(merged);
          setEditEmail(merged.email ?? "");
          setEditFullName(merged.fullName ?? "");
          setEditAddress(merged.address ?? "");
          setEditPhone(merged.phone ?? "");
        } else {
          const fallback: Profile = { username: u.username };
          setProfile(fallback);
          setEditEmail("");
          setEditFullName("");
          setEditAddress("");
          setEditPhone("");
        }

        setOrders(Array.isArray(oJson) ? oJson : []);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  useEffect(() => {
    if (tabFromUrl === "billing") setBillingEditing(false);
  }, [tabFromUrl]);

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
      const data = (await res.json()) as Profile & { _id?: string };
      setProfile({
        username: data.username ?? profile?.username ?? user?.username ?? "",
        email: data.email,
        fullName: data.fullName,
        address: data.address,
        phone: data.phone,
      });
      setBillingEditing(false);
    } catch (e) {
      console.error(e);
    } finally {
      setSavingProfile(false);
    }
  };

  const cancelBillingEdit = () => {
    if (profile) {
      setEditEmail(profile.email ?? "");
      setEditFullName(profile.fullName ?? "");
      setEditAddress(profile.address ?? "");
      setEditPhone(profile.phone ?? "");
    }
    setBillingEditing(false);
  };

  const displayOrDash = (v: string | undefined) =>
    v != null && String(v).trim() !== "" ? v : "—";

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

  const navCurrent = tabFromUrl === "billing" ? "billing" : "orders";

  const breadcrumbTitle = tabFromUrl === "billing" ? "بياناتي" : "طلباتي";

  return (
    <main className="min-h-screen bg-white pb-24 pt-24 md:pb-32 md:pt-32" dir="rtl">
      <div className={`mx-auto w-full max-w-[1920px] ${pagePaddingX}`}>
        <ProfileBreadcrumb
          items={[
            { label: "الرئيسية", href: "/" },
            { label: "حسابي", href: "/profile" },
            { label: breadcrumbTitle },
          ]}
        />

        <div className="flex flex-col gap-10 lg:flex-row lg:gap-12">
          <aside className="w-full shrink-0 lg:w-56">
            <ProfileAccountNav current={navCurrent} onLogout={handleLogout} />
          </aside>

          <div className="min-w-0 flex-1">
            {tabFromUrl === "orders" && (
              <>
                <h1 className="text-2xl font-medium text-neutral-900 md:text-3xl" style={sans}>
                  طلباتي
                </h1>
                <p className="mt-1 text-sm text-neutral-600" style={sans}>
                  اختاري طلباً لعرض المنتجات والدفع والتتبع.
                </p>
                {orders.length === 0 ? (
                  <p className="mt-8 text-sm text-neutral-500" style={sans}>
                    لم تقدّمي أي طلبات بعد.
                  </p>
                ) : (
                  <ul className="mt-8 space-y-4">
                    {orders.map((o) => (
                      <li key={o._id}>
                        <Link
                          href={`/profile/orders/${o._id}`}
                          className="group flex flex-col justify-between gap-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/[0.04] transition-[box-shadow] hover:shadow-md sm:flex-row sm:items-center"
                        >
                          <div>
                            <p className="text-sm font-medium text-neutral-900" style={sans}>
                              طلب {String(o._id).slice(-8)}
                            </p>
                            <p className="mt-0.5 text-xs text-neutral-500" style={sans}>
                              {new Date(o.createdAt ?? "").toLocaleDateString("ar-SA", { dateStyle: "medium" })}
                            </p>
                            <p className="mt-1 text-xs text-neutral-600" style={sans}>
                              {statusAr(o.status)}
                            </p>
                            {o.trackingNumber ? (
                              <p className="mt-2 text-xs text-neutral-500" style={sans}>
                                {o.carrier ? `${o.carrier} · ` : ""}
                                {o.trackingNumber}
                              </p>
                            ) : null}
                          </div>
                          <div className="flex flex-wrap items-center gap-4 sm:flex-col sm:items-end">
                            <p className="text-sm font-medium text-neutral-900" style={sans}>
                              {o.total != null ? formatSar(Number(o.total)) : "—"}
                            </p>
                            <span
                              className="inline-flex items-center gap-1 text-sm font-medium text-[#B63A6B] group-hover:underline"
                              style={sans}
                            >
                              عرض التفاصيل
                              <ChevronLeft className="h-4 w-4" strokeWidth={2} />
                            </span>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}

            {tabFromUrl === "billing" && profile && (
              <>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h1 className="text-2xl font-medium text-neutral-900 md:text-3xl" style={sans}>
                      بياناتي
                    </h1>
                    <p className="mt-1 text-sm text-neutral-600" style={sans}>
                      اسم المستخدم وبيانات التواصل والعنوان المرتبطة بحسابك.
                    </p>
                  </div>
                  {!billingEditing ? (
                    <button
                      type="button"
                      onClick={() => setBillingEditing(true)}
                      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-neutral-200 bg-white px-5 py-2.5 text-sm font-medium text-neutral-800 shadow-sm transition-colors hover:bg-neutral-50"
                      style={sans}
                    >
                      <Pencil className="h-4 w-4 text-[#B63A6B]" strokeWidth={1.75} />
                      تعديل
                    </button>
                  ) : null}
                </div>

                <div className="mt-8 max-w-lg rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/[0.04] md:p-8">
                  {!billingEditing ? (
                    <dl className="space-y-5 text-sm" style={sans}>
                      <div>
                        <dt className="text-xs text-neutral-500">اسم المستخدم</dt>
                        <dd className="mt-1 font-medium text-neutral-900">{displayOrDash(profile.username)}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-neutral-500">البريد الإلكتروني</dt>
                        <dd className="mt-1 text-neutral-900" dir="ltr">
                          {displayOrDash(profile.email)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-neutral-500">الاسم الكامل</dt>
                        <dd className="mt-1 text-neutral-900">{displayOrDash(profile.fullName)}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-neutral-500">الجوال</dt>
                        <dd className="mt-1 text-neutral-900" dir="ltr">
                          {displayOrDash(profile.phone)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-neutral-500">عنوان الشحن</dt>
                        <dd className="mt-1 whitespace-pre-wrap text-neutral-900">{displayOrDash(profile.address)}</dd>
                      </div>
                    </dl>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <p className="mb-1 text-xs text-neutral-500" style={sans}>
                          اسم المستخدم
                        </p>
                        <p className="rounded-xl bg-neutral-50 px-4 py-3 text-sm text-neutral-600" style={sans}>
                          {displayOrDash(profile.username)}
                        </p>
                        <p className="mt-1 text-xs text-neutral-400" style={sans}>
                          لا يمكن تغيير اسم المستخدم من هنا.
                        </p>
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-neutral-500" style={sans}>
                          البريد الإلكتروني
                        </label>
                        <input
                          value={editEmail}
                          onChange={(e) => setEditEmail(e.target.value)}
                          className="w-full rounded-xl border-0 bg-[#FCF0F2]/40 px-4 py-3 text-sm ring-1 ring-black/[0.06] focus:outline-none focus:ring-2 focus:ring-[#B63A6B]/30"
                          style={sans}
                          dir="ltr"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-neutral-500" style={sans}>
                          الاسم الكامل
                        </label>
                        <input
                          value={editFullName}
                          onChange={(e) => setEditFullName(e.target.value)}
                          className="w-full rounded-xl border-0 bg-[#FCF0F2]/40 px-4 py-3 text-sm ring-1 ring-black/[0.06] focus:outline-none focus:ring-2 focus:ring-[#B63A6B]/30"
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
                          className="w-full rounded-xl border-0 bg-[#FCF0F2]/40 px-4 py-3 text-sm ring-1 ring-black/[0.06] focus:outline-none focus:ring-2 focus:ring-[#B63A6B]/30"
                          style={sans}
                          dir="ltr"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-neutral-500" style={sans}>
                          عنوان الشحن
                        </label>
                        <textarea
                          value={editAddress}
                          onChange={(e) => setEditAddress(e.target.value)}
                          className="w-full rounded-xl border-0 bg-[#FCF0F2]/40 px-4 py-3 text-sm ring-1 ring-black/[0.06] focus:outline-none focus:ring-2 focus:ring-[#B63A6B]/30"
                          rows={3}
                          style={sans}
                        />
                      </div>
                      <div className="flex flex-wrap gap-3 pt-2">
                        <button
                          type="button"
                          onClick={saveProfile}
                          disabled={savingProfile}
                          className="rounded-full bg-[#B63A6B] px-8 py-3 text-sm font-semibold text-white transition-[filter] hover:brightness-110 disabled:opacity-50"
                          style={sans}
                        >
                          {savingProfile ? "جاري الحفظ…" : "حفظ التغييرات"}
                        </button>
                        <button
                          type="button"
                          onClick={cancelBillingEdit}
                          disabled={savingProfile}
                          className="rounded-full border border-neutral-200 bg-white px-8 py-3 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 disabled:opacity-50"
                          style={sans}
                        >
                          إلغاء
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
