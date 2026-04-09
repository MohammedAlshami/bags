"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ShoppingBag, User as UserIcon, MapPin, X } from "lucide-react";

import { adminIconClassName, sans } from "@/lib/page-theme";
import { adminApiErrorAr, orderStatusAr } from "@/lib/admin-ar";
import { AdminSkeletonCustomerDetailPage } from "@/lib/admin-skeleton";
import { formatSar } from "@/lib/format-sar";

type CustomerOrder = { _id: string; status: string; total?: number; createdAt?: string };
type CustomerDetail = {
  _id: string;
  username: string;
  email?: string;
  fullName?: string;
  address?: string;
  phone?: string;
  disabled?: boolean;
  orderCount?: number;
  orders?: CustomerOrder[];
  createdAt?: string;
};

export default function AdminCustomerDetailPage() {
  const params = useParams();
  const customerId = params?.id as string;
  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [panelError, setPanelError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [editEmail, setEditEmail] = useState("");
  const [editFullName, setEditFullName] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editDisabled, setEditDisabled] = useState(false);

  useEffect(() => {
    if (!customerId) return;
    setLoading(true);
    setError(null);
    fetch(`/api/admin/customers/${customerId}`)
      .then((res) => {
        if (res.status === 404) throw new Error("Customer not found");
        if (!res.ok) throw new Error("Failed to load customer");
        return res.json();
      })
      .then(setCustomer)
      .catch((e) => setError(adminApiErrorAr(e instanceof Error ? e.message : "Error")))
      .finally(() => setLoading(false));
  }, [customerId]);

  useEffect(() => {
    if (!sheetOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSheetOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [sheetOpen]);

  const openEdit = () => {
    if (!customer) return;
    setEditEmail(customer.email ?? "");
    setEditFullName(customer.fullName ?? "");
    setEditAddress(customer.address ?? "");
    setEditPhone(customer.phone ?? "");
    setEditDisabled(customer.disabled ?? false);
    setPanelError(null);
    setSheetOpen(true);
  };

  const closeSheet = () => {
    setSheetOpen(false);
    setPanelError(null);
  };

  const savePanel = async () => {
    if (!customer) return;
    setSaving(true);
    setPanelError(null);
    try {
      const res = await fetch(`/api/admin/customers/${customer._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: editEmail,
          fullName: editFullName,
          address: editAddress,
          phone: editPhone,
          disabled: editDisabled,
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        const raw = typeof d.error === "string" ? d.error : "";
        throw new Error(raw || "Failed to save");
      }
      await res.json();
      closeSheet();
      const refreshed = await fetch(`/api/admin/customers/${customer._id}`).then((r) => {
        if (!r.ok) throw new Error("Failed to load customer");
        return r.json();
      });
      setCustomer(refreshed);
    } catch (e) {
      setPanelError(adminApiErrorAr(e instanceof Error ? e.message : "Error"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <AdminSkeletonCustomerDetailPage />;
  }
  if (error) {
    return (
      <p className="text-red-600" style={sans} dir="rtl">
        {error}
      </p>
    );
  }
  if (!customer) return null;

  const orders = customer.orders ?? [];

  return (
    <div className="relative px-2 md:px-4" dir="rtl" style={sans}>
      <Link
        href="/admin/customers"
        className="mb-6 inline-flex items-center gap-2 text-sm text-neutral-600 transition-colors hover:text-black"
      >
        <ArrowLeft className={`w-4 h-4 ${adminIconClassName}`} strokeWidth={1.5} />
        العودة إلى العملاء
      </Link>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.35em] text-gray-500">عميل</p>
          <h2 className="mt-2 text-3xl font-medium text-neutral-900 md:text-4xl">
            {customer.fullName || customer.username}
          </h2>
        </div>
        <button
          type="button"
          onClick={openEdit}
          className="inline-flex items-center justify-center gap-1.5 rounded-sm bg-[#B63A6B] px-4 py-2 text-sm text-white transition-[filter] hover:brightness-110"
        >
          تعديل العميل
        </button>
      </div>

      <div className="mb-12 grid gap-8 md:grid-cols-2">
        <section className="rounded-sm border border-black/10 bg-white p-6 md:p-8">
          <h3 className="mb-5 flex items-center gap-2 text-lg font-medium text-black">
            <UserIcon className={`w-5 h-5 ${adminIconClassName}`} strokeWidth={1.25} />
            التفاصيل
          </h3>
          <dl className="space-y-4 text-sm">
            <div>
              <dt className="mb-0.5 text-[10px] uppercase tracking-widest text-neutral-500">اسم المستخدم</dt>
              <dd className="font-mono text-neutral-900" dir="ltr">
                {customer.username}
              </dd>
            </div>
            <div>
              <dt className="mb-0.5 text-[10px] uppercase tracking-widest text-neutral-500">البريد الإلكتروني</dt>
              <dd className="text-neutral-700" dir="ltr">
                {customer.email || "—"}
              </dd>
            </div>
            <div>
              <dt className="mb-0.5 text-[10px] uppercase tracking-widest text-neutral-500">الاسم الكامل</dt>
              <dd className="text-neutral-700">{customer.fullName || "—"}</dd>
            </div>
            <div>
              <dt className="mb-0.5 text-[10px] uppercase tracking-widest text-neutral-500">الهاتف</dt>
              <dd className="text-neutral-700" dir="ltr">
                {customer.phone || "—"}
              </dd>
            </div>
            <div>
              <dt className="mb-0.5 text-[10px] uppercase tracking-widest text-neutral-500">الحالة</dt>
              <dd>{customer.disabled ? <span className="text-amber-600">معطّل</span> : "نشط"}</dd>
            </div>
            {customer.createdAt && (
              <div>
                <dt className="mb-0.5 text-[10px] uppercase tracking-widest text-neutral-500">تاريخ التسجيل</dt>
                <dd className="text-neutral-600">
                  {new Date(customer.createdAt).toLocaleDateString("ar-SA", { dateStyle: "medium" })}
                </dd>
              </div>
            )}
          </dl>
        </section>

        <section className="rounded-sm border border-black/10 bg-white p-6 md:p-8">
          <h3 className="mb-5 flex items-center gap-2 text-lg font-medium text-black">
            <MapPin className={`w-5 h-5 ${adminIconClassName}`} strokeWidth={1.25} />
            عنوان الشحن
          </h3>
          <p className="whitespace-pre-wrap text-sm text-neutral-700">
            {customer.address?.trim() || "لا يوجد عنوان محفوظ."}
          </p>
        </section>
      </div>

      <section className="rounded-sm border border-black/10 bg-white">
        <div className="flex items-center gap-2 border-b border-black/10 p-6 md:p-8">
          <ShoppingBag className={`w-5 h-5 ${adminIconClassName}`} strokeWidth={1.25} />
          <h3 className="text-lg font-medium text-black">الطلبات ({customer.orderCount ?? 0})</h3>
        </div>
        {orders.length === 0 ? (
          <p className="p-8 text-center text-sm text-neutral-500">لا توجد طلبات بعد.</p>
        ) : (
          <div className="overflow-x-auto overscroll-x-contain">
            <table className="w-full min-w-[36rem] text-sm">
              <thead>
                <tr className="border-b border-black/10 text-right">
                  <th className="p-4 font-medium">التاريخ</th>
                  <th className="p-4 font-medium">الحالة</th>
                  <th className="p-4 font-medium">الإجمالي</th>
                  <th className="p-4 font-medium">إجراء</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o._id} className="border-b border-black/5 bg-white">
                    <td className="p-4 text-neutral-600">
                      {o.createdAt
                        ? new Date(o.createdAt).toLocaleDateString("ar-SA", { dateStyle: "medium" })
                        : "—"}
                    </td>
                    <td className="p-4">{orderStatusAr(o.status ?? "")}</td>
                    <td className="p-4">{o.total != null ? formatSar(Number(o.total)) : "—"}</td>
                    <td className="p-4">
                      <Link
                        href={`/admin/orders/${o._id}`}
                        className="text-black underline hover:no-underline"
                      >
                        عرض الطلب
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {sheetOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[60] cursor-pointer bg-black/40 transition-colors hover:bg-black/50"
            aria-label="إغلاق"
            onClick={closeSheet}
          />
          <aside
            className="
              fixed z-[70] flex flex-col bg-white shadow-2xl
              inset-x-0 bottom-0 max-h-[92vh] rounded-t-2xl border-t border-black/10
              md:inset-x-auto md:left-0 md:top-0 md:bottom-0 md:right-auto md:h-full md:max-h-none md:w-full md:max-w-md md:rounded-none md:border-t-0 md:border-l md:border-black/10
            "
          >
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-black/5 px-4 py-3">
              <h3 className="text-lg font-medium">تعديل عميل</h3>
              <button
                type="button"
                onClick={closeSheet}
                className="rounded-sm p-2 text-neutral-600 hover:opacity-70"
                aria-label="إغلاق"
              >
                <X className={`w-5 h-5 ${adminIconClassName}`} strokeWidth={1.5} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4">
              <div className="grid gap-4">
                <p className="text-sm text-neutral-600">
                  اسم المستخدم:{" "}
                  <span dir="ltr" className="font-mono text-neutral-900">
                    {customer.username}
                  </span>
                </p>
                <div>
                  <label className="mb-1 block text-xs text-neutral-500">البريد الإلكتروني</label>
                  <input
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full border border-neutral-200 px-3 py-2 text-sm"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-neutral-500">الاسم الكامل</label>
                  <input
                    value={editFullName}
                    onChange={(e) => setEditFullName(e.target.value)}
                    className="w-full border border-neutral-200 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-neutral-500">الهاتف</label>
                  <input
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full border border-neutral-200 px-3 py-2 text-sm"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-neutral-500">العنوان</label>
                  <textarea
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    className="w-full border border-neutral-200 px-3 py-2 text-sm"
                    rows={2}
                  />
                </div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editDisabled}
                    onChange={(e) => setEditDisabled(e.target.checked)}
                  />
                  <span className="text-sm">معطّل (لا يمكنه تسجيل الدخول)</span>
                </label>
                {panelError ? (
                  <p className="text-sm text-red-600" role="alert">
                    {panelError}
                  </p>
                ) : null}
                <div className="flex flex-wrap gap-2 pt-2">
                  <button
                    type="button"
                    onClick={savePanel}
                    disabled={saving}
                    className="rounded-sm bg-[#B63A6B] px-4 py-2 text-sm text-white transition-[filter] hover:brightness-110 disabled:opacity-50 disabled:hover:brightness-100"
                  >
                    {saving ? "جاري الحفظ…" : "حفظ"}
                  </button>
                  <button type="button" onClick={closeSheet} className="border border-black px-4 py-2 text-sm">
                    إلغاء
                  </button>
                </div>
              </div>
            </div>
            <div className="h-[env(safe-area-inset-bottom)] shrink-0 md:hidden" aria-hidden />
          </aside>
        </>
      )}
    </div>
  );
}
