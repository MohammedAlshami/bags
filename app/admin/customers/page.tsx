"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Download, Loader2, Search, UserPlus, X } from "lucide-react";
import { adminIconClassName, sans } from "@/lib/page-theme";
import { adminApiErrorAr } from "@/lib/admin-ar";
import { AdminSkeletonCustomersPage } from "@/lib/admin-skeleton";

type Customer = {
  _id: string;
  username: string;
  email?: string;
  fullName?: string;
  address?: string;
  phone?: string;
  disabled?: boolean;
  orderCount?: number;
  createdAt?: string;
};

type PanelState = null | { mode: "create" } | { mode: "edit"; customer: Customer };

export default function AdminCustomersPage() {
  const [list, setList] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [bannerError, setBannerError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [panel, setPanel] = useState<PanelState>(null);
  const [panelError, setPanelError] = useState<string | null>(null);
  const [formUsername, setFormUsername] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editFullName, setEditFullName] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editDisabled, setEditDisabled] = useState(false);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);

  const fetchList = async () => {
    const url = search ? `/api/admin/customers?search=${encodeURIComponent(search)}` : "/api/admin/customers";
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to load customers");
    return res.json();
  };

  useEffect(() => {
    setLoading(true);
    fetchList()
      .then((data) => {
        setList(data);
        setLoadError(null);
      })
      .catch((e) => setLoadError(adminApiErrorAr(e instanceof Error ? e.message : "Error")))
      .finally(() => setLoading(false));
  }, [search]);

  const panelOpen = panel !== null;

  useEffect(() => {
    if (!panelOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPanel(null);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [panelOpen]);

  const resetFormFields = () => {
    setFormUsername("");
    setFormPassword("");
    setEditEmail("");
    setEditFullName("");
    setEditAddress("");
    setEditPhone("");
    setEditDisabled(false);
    setPanelError(null);
  };

  const openCreate = () => {
    resetFormFields();
    setPanel({ mode: "create" });
  };

  const openEdit = (c: Customer) => {
    setFormUsername("");
    setFormPassword("");
    setEditEmail(c.email ?? "");
    setEditFullName(c.fullName ?? "");
    setEditAddress(c.address ?? "");
    setEditPhone(c.phone ?? "");
    setEditDisabled(c.disabled ?? false);
    setPanelError(null);
    setPanel({ mode: "edit", customer: c });
  };

  const closePanel = () => {
    setPanel(null);
    setPanelError(null);
  };

  const savePanel = async () => {
    if (!panel) return;
    setSaving(true);
    setPanelError(null);
    try {
      if (panel.mode === "create") {
        const res = await fetch("/api/admin/customers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: formUsername,
            password: formPassword,
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
          throw new Error(raw || "Failed to create customer");
        }
        closePanel();
        setList(await fetchList());
        return;
      }

      const res = await fetch(`/api/admin/customers/${panel.customer._id}`, {
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
      closePanel();
      setList(await fetchList());
    } catch (e) {
      setPanelError(adminApiErrorAr(e instanceof Error ? e.message : "Error"));
    } finally {
      setSaving(false);
    }
  };

  const toggleDisabled = async (c: Customer) => {
    try {
      const res = await fetch(`/api/admin/customers/${c._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ disabled: !c.disabled }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        const raw = typeof d.error === "string" ? d.error : "";
        throw new Error(raw || "Failed to update");
      }
      setList(await fetchList());
      setBannerError(null);
      if (panel?.mode === "edit" && panel.customer._id === c._id) {
        setEditDisabled(!c.disabled);
        setPanel({ mode: "edit", customer: { ...panel.customer, disabled: !c.disabled } });
      }
    } catch (e) {
      setBannerError(adminApiErrorAr(e instanceof Error ? e.message : "Error"));
    }
  };

  const doExport = () => {
    setExporting(true);
    setBannerError(null);
    window.location.href = "/api/admin/customers/export";
    setTimeout(() => setExporting(false), 2000);
  };

  if (loading) {
    return <AdminSkeletonCustomersPage />;
  }
  if (loadError) {
    return (
      <p className="text-red-600" style={sans} dir="rtl">
        {loadError}
      </p>
    );
  }

  const formFields = (
    <div className="grid gap-4">
      {panel?.mode === "edit" ? (
        <p className="text-sm text-neutral-600">
          اسم المستخدم: <span dir="ltr" className="font-mono text-neutral-900">{panel.customer.username}</span>
        </p>
      ) : (
        <>
          <div>
            <label className="block text-xs text-neutral-500 mb-1">اسم المستخدم</label>
            <input
              value={formUsername}
              onChange={(e) => setFormUsername(e.target.value)}
              className="w-full border border-neutral-200 px-3 py-2 text-sm"
              dir="ltr"
              autoComplete="username"
            />
          </div>
          <div>
            <label className="block text-xs text-neutral-500 mb-1">كلمة المرور</label>
            <input
              type="password"
              value={formPassword}
              onChange={(e) => setFormPassword(e.target.value)}
              className="w-full border border-neutral-200 px-3 py-2 text-sm"
              dir="ltr"
              autoComplete="new-password"
            />
          </div>
        </>
      )}
      <div>
        <label className="block text-xs text-neutral-500 mb-1">البريد الإلكتروني</label>
        <input
          value={editEmail}
          onChange={(e) => setEditEmail(e.target.value)}
          className="w-full border border-neutral-200 px-3 py-2 text-sm"
          dir="ltr"
        />
      </div>
      <div>
        <label className="block text-xs text-neutral-500 mb-1">الاسم الكامل</label>
        <input
          value={editFullName}
          onChange={(e) => setEditFullName(e.target.value)}
          className="w-full border border-neutral-200 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="block text-xs text-neutral-500 mb-1">الهاتف</label>
        <input
          value={editPhone}
          onChange={(e) => setEditPhone(e.target.value)}
          className="w-full border border-neutral-200 px-3 py-2 text-sm"
          dir="ltr"
        />
      </div>
      <div>
        <label className="block text-xs text-neutral-500 mb-1">العنوان</label>
        <textarea
          value={editAddress}
          onChange={(e) => setEditAddress(e.target.value)}
          className="w-full border border-neutral-200 px-3 py-2 text-sm"
          rows={2}
        />
      </div>
      <label className="flex items-center gap-2">
        <input type="checkbox" checked={editDisabled} onChange={(e) => setEditDisabled(e.target.checked)} />
        <span className="text-sm">معطّل (لا يمكنه تسجيل الدخول)</span>
      </label>
      {panelError ? (
        <p className="text-sm text-red-600" role="alert">
          {panelError}
        </p>
      ) : null}
      <div className="flex gap-2 flex-wrap pt-2">
        <button
          type="button"
          onClick={savePanel}
          disabled={saving}
          className="px-4 py-2 bg-[#B63A6B] text-white text-sm rounded-sm hover:brightness-110 transition-[filter] disabled:opacity-50 disabled:hover:brightness-100"
        >
          {saving ? "جاري الحفظ…" : "حفظ"}
        </button>
        <button type="button" onClick={closePanel} className="px-4 py-2 border border-black text-sm">
          إلغاء
        </button>
      </div>
    </div>
  );

  return (
    <div dir="rtl" style={sans} className="relative">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h2 className="text-xl font-medium text-neutral-900">العملاء</h2>
        <div className="flex gap-2 items-center flex-wrap">
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#B63A6B] text-white text-sm rounded-sm hover:brightness-110 transition-[filter]"
          >
            <UserPlus className="w-4 h-4 shrink-0" strokeWidth={1.75} aria-hidden />
            إضافة عميل
          </button>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && setSearch(searchInput)}
            placeholder="بحث: اسم المستخدم، البريد، الاسم…"
            className="border border-neutral-200 px-3 py-2 text-sm w-56 max-w-full"
          />
          <button
            type="button"
            onClick={() => setSearch(searchInput)}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 border border-black text-sm rounded-sm"
          >
            <Search className={`w-4 h-4 shrink-0 ${adminIconClassName}`} strokeWidth={1.75} aria-hidden />
            بحث
          </button>
          <button
            type="button"
            onClick={doExport}
            disabled={exporting}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#B63A6B] text-white text-sm rounded-sm hover:brightness-110 transition-[filter] disabled:opacity-50 disabled:hover:brightness-100"
          >
            {exporting ? (
              <Loader2 className="w-4 h-4 shrink-0 animate-spin" strokeWidth={1.75} aria-hidden />
            ) : (
              <Download className="w-4 h-4 shrink-0" strokeWidth={1.75} aria-hidden />
            )}
            {exporting ? "جاري التصدير…" : "تصدير CSV"}
          </button>
        </div>
      </div>

      {bannerError ? (
        <p className="mb-4 text-sm text-red-600" role="alert">
          {bannerError}
        </p>
      ) : null}

      {panelOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[60] cursor-pointer bg-black/40 transition-colors hover:bg-black/50"
            aria-label="إغلاق"
            onClick={closePanel}
          />
          <aside
            className="
              fixed z-[70] flex flex-col bg-white shadow-2xl
              inset-x-0 bottom-0 max-h-[92vh] rounded-t-2xl border-t border-black/10
              md:inset-x-auto md:left-0 md:top-0 md:bottom-0 md:right-auto md:h-full md:max-h-none md:w-full md:max-w-md md:rounded-none md:border-t-0 md:border-l md:border-black/10
            "
          >
            <div className="flex shrink-0 items-center justify-between gap-3 px-4 py-3">
              <h3 className="text-lg font-medium">{panel?.mode === "create" ? "عميل جديد" : "تعديل عميل"}</h3>
              <button
                type="button"
                onClick={closePanel}
                className="p-2 rounded-sm hover:opacity-70 text-neutral-600"
                aria-label="إغلاق"
              >
                <X className={`w-5 h-5 ${adminIconClassName}`} strokeWidth={1.5} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4">{formFields}</div>
            <div className="h-[env(safe-area-inset-bottom)] shrink-0 md:hidden" aria-hidden />
          </aside>
        </>
      )}

      <div className="rounded-sm border border-black/10 bg-white">
        <div className="overflow-x-auto overscroll-x-contain">
          <table className="w-full min-w-[56rem] text-sm">
          <thead>
            <tr className="border-b border-black/10 text-right">
              <th className="p-4 font-medium">اسم المستخدم</th>
              <th className="p-4 font-medium">البريد</th>
              <th className="p-4 font-medium">الاسم</th>
              <th className="p-4 font-medium">الهاتف</th>
              <th className="p-4 font-medium">العنوان</th>
              <th className="p-4 font-medium">الطلبات</th>
              <th className="p-4 font-medium">الحالة</th>
              <th className="p-4 font-medium">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {list.map((c) => (
              <tr key={c._id} className="border-b border-black/5 bg-white">
                <td className="p-4">
                  <Link href={`/admin/customers/${c._id}`} className="text-black underline hover:no-underline">
                    {c.username}
                  </Link>
                </td>
                <td className="p-4 text-neutral-600 text-left" dir="ltr">
                  {c.email || "—"}
                </td>
                <td className="p-4 text-neutral-600">{c.fullName || "—"}</td>
                <td className="p-4 text-neutral-600 text-left" dir="ltr">
                  {c.phone || "—"}
                </td>
                <td className="p-4 text-neutral-600 max-w-xs truncate">{c.address || "—"}</td>
                <td className="p-4">{c.orderCount ?? 0}</td>
                <td className="p-4">{c.disabled ? <span className="text-amber-600">معطّل</span> : "نشط"}</td>
                <td className="p-4">
                  <button type="button" onClick={() => openEdit(c)} className="text-black underline ms-3">
                    تعديل
                  </button>
                  <button type="button" onClick={() => toggleDisabled(c)} className="text-black underline ms-3">
                    {c.disabled ? "تفعيل" : "تعطيل"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        {list.length === 0 && <p className="p-8 text-neutral-500 text-center">لا يوجد عملاء.</p>}
      </div>
    </div>
  );
}
