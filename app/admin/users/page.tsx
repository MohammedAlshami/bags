"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Shield, Trash2, X } from "lucide-react";
import { sans } from "@/lib/page-theme";
import { adminApiErrorAr } from "@/lib/admin-ar";
import { AdminSkeletonCustomersPage } from "@/lib/admin-skeleton";
import { ConfirmModal } from "@/app/components/ConfirmModal";

type AdminUser = {
  id: string;
  username: string;
  email: string | null;
  role: string;
  disabled: number | boolean;
  created_at: string;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [panel, setPanel] = useState<"create" | "edit" | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [formUsername, setFormUsername] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formRole, setFormRole] = useState("admin");
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [success, setSuccess] = useState("");

  const fetchUsers = async () => {
    const res = await fetch("/api/admin/users");
    if (!res.ok) throw new Error("Failed to load users");
    return res.json() as Promise<AdminUser[]>;
  };

  useEffect(() => {
    setLoading(true);
    fetchUsers()
      .then(setUsers)
      .catch((e) => setError(adminApiErrorAr(e instanceof Error ? e.message : "Error")))
      .finally(() => setLoading(false));
  }, []);

  const openCreate = () => {
    setFormUsername("");
    setFormPassword("");
    setFormRole("admin");
    setPanel("create");
    setEditId(null);
  };

  const openEdit = (u: AdminUser) => {
    setFormUsername(u.username);
    setFormPassword("");
    setFormRole(u.role);
    setEditId(u.id);
    setPanel("edit");
  };

  const closePanel = () => {
    setPanel(null);
    setEditId(null);
    setError(null);
  };

  const handleSave = async () => {
    if (!formUsername.trim() || (panel === "create" && !formPassword)) return;
    setSaving(true);
    setError(null);
    try {
      if (panel === "create") {
        const res = await fetch("/api/admin/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: formUsername.trim(), password: formPassword, role: formRole }),
        });
        if (!res.ok) {
          const d = await res.json().catch(() => ({})) as { error?: string };
          throw new Error(d.error || "Failed to create");
        }
      } else if (editId) {
        const body: Record<string, unknown> = { username: formUsername.trim(), role: formRole };
        if (formPassword) body.password = formPassword;
        const res = await fetch(`/api/admin/users/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          const d = await res.json().catch(() => ({})) as { error?: string };
          throw new Error(d.error || "Failed to update");
        }
      }
      closePanel();
      setUsers(await fetchUsers());
      setSuccess(panel === "create" ? "تم إنشاء المستخدم" : "تم تحديث المستخدم");
      setTimeout(() => setSuccess(""), 3000);
    } catch (e) {
      setError(adminApiErrorAr(e instanceof Error ? e.message : "Error"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/admin/users/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) {
        const d = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(d.error || "Failed to delete");
      }
      setDeleteTarget(null);
      setUsers(await fetchUsers());
      setSuccess("تم حذف المستخدم");
      setTimeout(() => setSuccess(""), 3000);
    } catch (e) {
      setError(adminApiErrorAr(e instanceof Error ? e.message : "Error"));
      setDeleteTarget(null);
    }
  };

  if (loading) return <AdminSkeletonCustomersPage />;

  return (
    <div dir="rtl" style={sans} className="relative">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h2 className="text-xl font-medium text-neutral-900">إدارة المستخدمين</h2>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#B63A6B] text-white text-sm rounded-sm hover:brightness-110 transition-[filter]"
        >
          <Plus className="w-4 h-4 shrink-0" strokeWidth={1.75} aria-hidden />
          إضافة مستخدم
        </button>
      </div>

      {success ? <p className="mb-4 text-sm text-green-600">{success}</p> : null}
      {error ? <p className="mb-4 text-sm text-red-600" role="alert">{error}</p> : null}

      <div className="rounded-sm border border-black/10 bg-white">
        <div className="overflow-x-auto overscroll-x-contain">
          <table className="w-full min-w-[32rem] text-sm">
            <thead>
              <tr className="border-b border-black/10 text-right">
                <th className="p-4 font-medium">اسم المستخدم</th>
                <th className="p-4 font-medium">البريد</th>
                <th className="p-4 font-medium">الصلاحية</th>
                <th className="p-4 font-medium">الحالة</th>
                <th className="p-4 font-medium">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-black/5 bg-white">
                  <td className="p-4 font-medium">{u.username}</td>
                  <td className="p-4 text-neutral-600">{u.email ?? "—"}</td>
                  <td className="p-4">
                    <span className={`inline-block px-2 py-0.5 text-xs rounded-full ${
                      u.role === "superadmin"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-blue-100 text-blue-700"
                    }`}>
                      {u.role === "superadmin" ? "مشرف عام" : "مشرف"}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`inline-block px-2 py-0.5 text-xs rounded-full ${
                      u.disabled ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                    }`}>
                      {u.disabled ? "موقوف" : "نشط"}
                    </span>
                  </td>
                  <td className="p-4">
                    <button type="button" onClick={() => openEdit(u)} className="text-black underline ms-3">تعديل</button>
                    <button type="button" onClick={() => setDeleteTarget(u)} className="inline-flex items-center gap-1 text-red-600 underline ms-3">
                      <Trash2 className="w-3.5 h-3.5" strokeWidth={1.75} /> حذف
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {users.length === 0 && <p className="p-8 text-neutral-500 text-center">لا يوجد مستخدمين.</p>}
      </div>

      {panel && (
        <>
          <button type="button" className="fixed inset-0 z-[60] cursor-pointer bg-black/40" aria-label="إغلاق" onClick={closePanel} />
          <aside className="fixed z-[70] flex flex-col bg-white shadow-2xl inset-x-0 bottom-0 max-h-[92vh] rounded-t-2xl border-t border-black/10 md:inset-x-auto md:left-auto md:right-0 md:top-0 md:bottom-0 md:h-full md:max-h-none md:w-full md:max-w-md md:rounded-none md:border-t-0 md:border-r md:border-black/10">
            <div className="flex shrink-0 items-center justify-between gap-3 px-4 py-3">
              <h3 className="text-lg font-medium">
                {panel === "create" ? "إضافة مستخدم" : "تعديل المستخدم"}
              </h3>
              <button type="button" onClick={closePanel} className="p-2 rounded-sm hover:opacity-70 text-neutral-600" aria-label="إغلاق">
                <X className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4">
              <div className="grid gap-4">
                <div>
                  <label className="block text-xs text-neutral-500 mb-1">اسم المستخدم</label>
                  <input
                    value={formUsername}
                    onChange={(e) => setFormUsername(e.target.value)}
                    className="w-full border border-neutral-200 px-3 py-2 text-sm"
                    dir="ltr"
                    placeholder="البريد الإلكتروني"
                  />
                </div>
                <div>
                  <label className="block text-xs text-neutral-500 mb-1">
                    {panel === "edit" ? "كلمة المرور (اترك فارغاً بدون تغيير)" : "كلمة المرور"}
                  </label>
                  <input
                    type="password"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    className="w-full border border-neutral-200 px-3 py-2 text-sm"
                    dir="ltr"
                    placeholder={panel === "edit" ? "اترك فارغاً بدون تغيير" : "كلمة المرور"}
                  />
                </div>
                <div>
                  <label className="block text-xs text-neutral-500 mb-1">الصلاحية</label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    className="w-full border border-neutral-200 px-3 py-2 text-sm"
                  >
                    <option value="admin">مشرف</option>
                    <option value="superadmin">مشرف عام</option>
                  </select>
                </div>
                <div className="flex gap-2 flex-wrap pt-2">
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving || !formUsername.trim() || (panel === "create" && !formPassword)}
                    className="px-4 py-2 bg-[#B63A6B] text-white text-sm rounded-sm hover:brightness-110 transition-[filter] disabled:opacity-50"
                  >
                    {saving ? "جاري الحفظ…" : "حفظ"}
                  </button>
                  <button type="button" onClick={closePanel} className="px-4 py-2 border border-black text-sm">إلغاء</button>
                </div>
              </div>
            </div>
            <div className="h-[env(safe-area-inset-bottom)] shrink-0 md:hidden" aria-hidden />
          </aside>
        </>
      )}

      <ConfirmModal
        open={deleteTarget !== null}
        title="حذف المستخدم"
        message="هل أنت متأكد من حذف هذا المستخدم؟"
        confirmLabel="حذف"
        cancelLabel="إلغاء"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
