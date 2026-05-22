"use client";

import { useEffect, useState } from "react";
import { Loader2, User } from "lucide-react";
import { sans } from "@/lib/page-theme";
import { adminApiErrorAr } from "@/lib/admin-ar";
import { AdminSkeletonCustomersPage } from "@/lib/admin-skeleton";

type SessionData = {
  username: string;
  role: string;
  sub: string;
};

export default function AdminProfilePage() {
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json() as Promise<{ user: SessionData | null }>)
      .then((data) => setSession(data.user))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      setError("يرجى إدخال كلمة المرور الحالية والجديدة");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("كلمة المرور الجديدة غير متطابقة");
      return;
    }
    if (newPassword.length < 6) {
      setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await fetch("/api/admin/users/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(d.error || "فشل تغيير كلمة المرور");
      }
      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      setError(adminApiErrorAr(e instanceof Error ? e.message : "فشل تغيير كلمة المرور"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <AdminSkeletonCustomersPage />;

  return (
    <div dir="rtl" style={sans}>
      <h2 className="text-xl font-medium text-neutral-900 mb-6">الملف الشخصي</h2>

      <div className="max-w-lg rounded-sm border border-black/10 bg-white p-6 mb-6">
        <div className="flex items-center gap-4 mb-5">
          <div className="flex size-14 items-center justify-center rounded-full bg-brand-light/40">
            <User className="w-6 h-6 text-brand-primary" strokeWidth={1.5} aria-hidden />
          </div>
          <div>
            <p className="font-medium text-neutral-900">{session?.username ?? "—"}</p>
            <p className="text-xs text-neutral-500 mt-0.5">
              {session?.role === "superadmin" ? "مشرف عام" : "مشرف"}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-lg rounded-sm border border-black/10 bg-white p-6">
        <h3 className="text-sm font-semibold text-neutral-900 mb-5">تغيير كلمة المرور</h3>
        <div className="grid gap-4">
          <div>
            <label className="block text-xs text-neutral-500 mb-1">كلمة المرور الحالية</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full border border-neutral-200 px-3 py-2 text-sm"
              dir="ltr"
            />
          </div>
          <div>
            <label className="block text-xs text-neutral-500 mb-1">كلمة المرور الجديدة</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border border-neutral-200 px-3 py-2 text-sm"
              dir="ltr"
            />
          </div>
          <div>
            <label className="block text-xs text-neutral-500 mb-1">تأكيد كلمة المرور الجديدة</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border border-neutral-200 px-3 py-2 text-sm"
              dir="ltr"
            />
          </div>

          {error ? <p className="text-sm text-red-600" role="alert">{error}</p> : null}
          {success ? <p className="text-sm text-green-600">تم تغيير كلمة المرور بنجاح ✓</p> : null}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleChangePassword}
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2 bg-[#B63A6B] text-white text-sm rounded-sm hover:brightness-110 transition-[filter] disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  جاري الحفظ…
                </>
              ) : (
                "تغيير كلمة المرور"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
