"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronLeft, Pencil } from "lucide-react";
import { sans } from "@/lib/page-theme";
import { SafeImage } from "@/app/components/SafeImage";
import { ProfileBreadcrumb, ProfileAccountNav } from "@/app/components/profile/ProfileAccountChrome";
import { parseOrderLineItemsLenient } from "@/lib/order-line-items";
import { ProvinceSelectDropdown } from "@/app/components/ProvinceSelectDropdown";
import { formatSar } from "@/lib/format-sar";
import { getCheckoutProvinceById } from "@/lib/checkout-provinces";

type User = { username: string; role: string } | null;
type Order = {
  _id: string;
  status: string;
  total?: number;
  createdAt?: string;
  trackingNumber?: string;
  carrier?: string;
  shippedAt?: string | null;
  items?: unknown;
  /** Populated by GET /api/me/orders — same lines as `items`, normalized for list UIs. */
  products?: unknown;
};
type Profile = {
  username: string;
  email?: string;
  fullName?: string;
  address?: string;
  phone?: string;
  provinceId?: string;
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

const ORDER_CARD_PREVIEW_MAX = 5;

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
  const [editProvinceId, setEditProvinceId] = useState("");

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
            provinceId: typeof pJson.provinceId === "string" ? pJson.provinceId : undefined,
          };
          setProfile(merged);
          setEditEmail(merged.email ?? "");
          setEditFullName(merged.fullName ?? "");
          setEditAddress(merged.address ?? "");
          setEditPhone(merged.phone ?? "");
          setEditProvinceId(merged.provinceId ?? "");
        } else {
          const fallback: Profile = { username: u.username };
          setProfile(fallback);
          setEditEmail("");
          setEditFullName("");
          setEditAddress("");
          setEditPhone("");
          setEditProvinceId("");
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
          provinceId: editProvinceId.trim() === "" ? null : editProvinceId,
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
        provinceId: typeof data.provinceId === "string" ? data.provinceId : undefined,
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
      setEditProvinceId(profile.provinceId ?? "");
    }
    setBillingEditing(false);
  };

  const displayOrDash = (v: string | undefined) =>
    v != null && String(v).trim() !== "" ? v : "—";

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-white pb-[calc(6rem+env(safe-area-inset-bottom,0px))] pt-4 sm:pt-6 md:pt-14 lg:pt-20 md:pb-32" dir="rtl">
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
    <main
      className="min-h-screen bg-white pb-[calc(6rem+env(safe-area-inset-bottom,0px))] pt-4 sm:pt-6 md:pt-14 lg:pt-20 md:pb-32"
      dir="rtl"
    >
      <div className="mx-auto w-full max-w-[1920px] px-3 sm:px-8 md:px-14 lg:px-24">
        <ProfileBreadcrumb
          className="mb-4 sm:mb-6 md:mb-8"
          items={[
            { label: "الرئيسية", href: "/" },
            { label: "حسابي", href: "/profile" },
            { label: breadcrumbTitle },
          ]}
        />

        <div className="flex flex-col gap-5 sm:gap-8 lg:flex-row lg:gap-12">
          <aside className="hidden w-full shrink-0 lg:block lg:w-56">
            <ProfileAccountNav current={navCurrent} onLogout={handleLogout} />
          </aside>

          <div className="min-w-0 flex-1">
            {tabFromUrl === "orders" && (
              <>
                <h1 className="text-xl font-medium text-neutral-900 sm:text-2xl md:text-3xl" style={sans}>
                  طلباتي
                </h1>
                <p className="mt-1 text-sm text-neutral-600" style={sans}>
                  اختاري طلباً لعرض المنتجات والدفع والتتبع.
                </p>
                {orders.length === 0 ? (
                  <p className="mt-5 text-sm text-neutral-500 sm:mt-8" style={sans}>
                    لم تقدّمي أي طلبات بعد.
                  </p>
                ) : (
                  <ul className="mt-5 space-y-3 sm:mt-8 sm:space-y-4">
                    {orders.map((o) => {
                      const previewLines = parseOrderLineItemsLenient(o.products ?? o.items);
                      const extraCount = Math.max(0, previewLines.length - ORDER_CARD_PREVIEW_MAX);
                      const shownLines = previewLines.slice(0, ORDER_CARD_PREVIEW_MAX);
                      return (
                        <li key={o._id}>
                          <Link
                            href={`/profile/orders/${o._id}`}
                            className="group flex flex-col justify-between gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-black/[0.04] transition-[box-shadow] hover:shadow-md sm:gap-4 sm:rounded-2xl sm:p-6 sm:flex-row sm:items-stretch"
                          >
                            <div className="min-w-0 flex-1">
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
                              {shownLines.length > 0 ? (
                                <ul className="mt-3 space-y-2 border-t border-neutral-100 pt-3" style={sans}>
                                  {shownLines.map((it, idx) => (
                                    <li key={`${o._id}-${idx}`} className="flex items-center gap-3">
                                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-[#FCF0F2]">
                                        {it.image ? (
                                          <SafeImage
                                            src={it.image}
                                            alt=""
                                            fill
                                            className="object-contain p-0.5"
                                            sizes="48px"
                                          />
                                        ) : null}
                                      </div>
                                      <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium text-neutral-900">{it.name}</p>
                                        <p className="text-xs text-neutral-500">× {it.quantity.toLocaleString("ar-SA")}</p>
                                      </div>
                                    </li>
                                  ))}
                                  {extraCount > 0 ? (
                                    <li className="text-xs text-neutral-500">
                                      {extraCount === 1
                                        ? "ومنتجاً آخر"
                                        : `و${extraCount.toLocaleString("ar-SA")} منتجات أخرى`}
                                    </li>
                                  ) : null}
                                </ul>
                              ) : null}
                            </div>
                            <div className="flex shrink-0 flex-row flex-wrap items-center justify-between gap-4 border-t border-neutral-100 pt-3 sm:flex-col sm:items-end sm:border-t-0 sm:pt-0 sm:ps-6 sm:border-s sm:border-neutral-100">
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
                      );
                    })}
                  </ul>
                )}
              </>
            )}

            {tabFromUrl === "billing" && profile && (
              <>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h1 className="text-xl font-medium text-neutral-900 sm:text-2xl md:text-3xl" style={sans}>
                      بياناتي
                    </h1>
                    <p className="mt-1 text-sm text-neutral-600" style={sans}>
                      بيانات التواصل والعنوان المرتبطة بحسابك.
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

                <div className="mt-5 max-w-lg rounded-xl bg-white p-4 shadow-sm ring-1 ring-black/[0.04] sm:mt-8 sm:rounded-2xl sm:p-6 md:p-8">
                  {!billingEditing ? (
                    <dl className="space-y-5 text-sm" style={sans}>
                      <div>
                        <dt className="text-xs text-neutral-500">البريد الإلكتروني</dt>
                        <dd className="mt-1 text-end text-neutral-900" dir="ltr">
                          {displayOrDash(profile.email)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-neutral-500">الاسم الكامل</dt>
                        <dd className="mt-1 text-neutral-900">{displayOrDash(profile.fullName)}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-neutral-500">الجوال</dt>
                        <dd className="mt-1 text-end text-neutral-900" dir="ltr">
                          {displayOrDash(profile.phone)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs text-neutral-500">المحافظة</dt>
                        <dd className="mt-1 text-neutral-900">
                          {profile.provinceId
                            ? getCheckoutProvinceById(profile.provinceId)?.label ?? profile.provinceId
                            : "—"}
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
                        <label className="mb-1 block text-xs text-neutral-500" style={sans}>
                          البريد الإلكتروني
                        </label>
                        <input
                          value={editEmail}
                          onChange={(e) => setEditEmail(e.target.value)}
                          className="w-full rounded-xl border-0 bg-[#FCF0F2]/40 px-4 py-3 text-end text-sm ring-1 ring-black/[0.06] focus:outline-none focus:ring-2 focus:ring-[#B63A6B]/30"
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
                          className="w-full rounded-xl border-0 bg-[#FCF0F2]/40 px-4 py-3 text-end text-sm ring-1 ring-black/[0.06] focus:outline-none focus:ring-2 focus:ring-[#B63A6B]/30"
                          style={sans}
                          dir="ltr"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-neutral-500" style={sans}>
                          المحافظة
                        </label>
                        <ProvinceSelectDropdown id="profile-province" value={editProvinceId} onChange={setEditProvinceId} />
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
