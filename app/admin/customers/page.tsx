"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { sans } from "@/lib/page-theme";
import { adminApiErrorAr } from "@/lib/admin-ar";

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

export default function AdminCustomersPage() {
  const [list, setList] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [editing, setEditing] = useState<Customer | null>(null);
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
        setError(null);
      })
      .catch((e) => setError(adminApiErrorAr(e instanceof Error ? e.message : "Error")))
      .finally(() => setLoading(false));
  }, [search]);

  const openEdit = (c: Customer) => {
    setEditing(c);
    setEditEmail(c.email ?? "");
    setEditFullName(c.fullName ?? "");
    setEditAddress(c.address ?? "");
    setEditPhone(c.phone ?? "");
    setEditDisabled(c.disabled ?? false);
  };

  const saveEdit = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/customers/${editing._id}`, {
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
      setEditing(null);
      setList(await fetchList());
    } catch (e) {
      setError(adminApiErrorAr(e instanceof Error ? e.message : "Error"));
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
      if (editing?._id === c._id) {
        setEditDisabled(!c.disabled);
      }
    } catch (e) {
      setError(adminApiErrorAr(e instanceof Error ? e.message : "Error"));
    }
  };

  const doExport = () => {
    setExporting(true);
    window.location.href = "/api/admin/customers/export";
    setTimeout(() => setExporting(false), 2000);
  };

  if (loading) {
    return (
      <p className="text-neutral-500" style={sans} dir="rtl">
        جاري التحميل…
      </p>
    );
  }
  if (error) {
    return (
      <p className="text-red-600" style={sans} dir="rtl">
        {error}
      </p>
    );
  }

  return (
    <div dir="rtl" style={sans}>
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h2 className="text-xl font-medium text-neutral-900">العملاء</h2>
        <div className="flex gap-2 items-center flex-wrap">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && setSearch(searchInput)}
            placeholder="بحث: اسم المستخدم، البريد، الاسم…"
            className="border border-neutral-200 px-3 py-2 text-sm w-56 max-w-full"
          />
          <button type="button" onClick={() => setSearch(searchInput)} className="px-4 py-2 border border-black text-sm">
            بحث
          </button>
          <button
            type="button"
            onClick={doExport}
            disabled={exporting}
            className="px-4 py-2 bg-black text-white text-sm disabled:opacity-50"
          >
            {exporting ? "جاري التصدير…" : "تصدير CSV"}
          </button>
        </div>
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-10 p-4" dir="rtl">
          <div className="bg-white border border-black/10 rounded-sm p-6 max-w-md w-full shadow-lg" style={sans}>
            <h3 className="text-lg font-medium mb-4">تعديل عميل</h3>
            <div className="grid gap-4">
              <p className="text-sm text-neutral-600">اسم المستخدم: {editing.username}</p>
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
              <div className="flex gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={saveEdit}
                  disabled={saving}
                  className="px-4 py-2 bg-black text-white text-sm disabled:opacity-50"
                >
                  {saving ? "جاري الحفظ…" : "حفظ"}
                </button>
                <button type="button" onClick={() => setEditing(null)} className="px-4 py-2 border border-black text-sm">
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white border border-black/10 rounded-sm overflow-hidden">
        <table className="w-full text-sm">
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
        {list.length === 0 && <p className="p-8 text-neutral-500 text-center">لا يوجد عملاء.</p>}
      </div>
    </div>
  );
}
