"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, X, Trash2 } from "lucide-react";
import { adminIconClassName, sans } from "@/lib/page-theme";
import { adminApiErrorAr } from "@/lib/admin-ar";
import { AdminSkeletonCustomersPage } from "@/lib/admin-skeleton";
import { ConfirmModal } from "@/app/components/ConfirmModal";

type SocialLink = {
  _id: string;
  platform: string;
  label: string;
  url: string;
  icon: string | null;
};

type PanelState = null | { mode: "create" } | { mode: "edit"; link: SocialLink };

export default function AdminSocialLinksPage() {
  const [list, setList] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [panel, setPanel] = useState<PanelState>(null);
  const [panelError, setPanelError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<SocialLink | null>(null);

  const [formPlatform, setFormPlatform] = useState("");
  const [formLabel, setFormLabel] = useState("");
  const [formUrl, setFormUrl] = useState("");
  const [formIcon, setFormIcon] = useState("");

  const fetchList = async (): Promise<SocialLink[]> => {
    const res = await fetch("/api/admin/social-links");
    if (!res.ok) throw new Error("Failed to load social links");
    return res.json() as Promise<SocialLink[]>;
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
  }, []);

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
    setFormPlatform("");
    setFormLabel("");
    setFormUrl("");
    setFormIcon("");
    setPanelError(null);
  };

  const openCreate = () => {
    resetFormFields();
    setPanel({ mode: "create" });
  };

  const openEdit = (link: SocialLink) => {
    setFormPlatform(link.platform);
    setFormLabel(link.label);
    setFormUrl(link.url);
    setFormIcon(link.icon ?? "");
    setPanelError(null);
    setPanel({ mode: "edit", link });
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
      const body = {
        platform: formPlatform,
        label: formLabel,
        url: formUrl,
        icon: formIcon || null,
      };

      if (panel.mode === "create") {
        const res = await fetch("/api/admin/social-links", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          const d = await res.json().catch(() => ({})) as { error?: string };
          throw new Error(d.error || "Failed to create");
        }
      } else {
        const res = await fetch(`/api/admin/social-links/${panel.link._id}`, {
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
      setList(await fetchList());
    } catch (e) {
      setPanelError(adminApiErrorAr(e instanceof Error ? e.message : "Error"));
    } finally {
      setSaving(false);
    }
  };

  const deleteLink = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/admin/social-links/${deleteTarget._id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(d.error || "Failed to delete");
      }
      setDeleteTarget(null);
      setList(await fetchList());
    } catch (e) {
      setPanelError(adminApiErrorAr(e instanceof Error ? e.message : "Error"));
      setDeleteTarget(null);
    }
  };

  if (loading) return <AdminSkeletonCustomersPage />;
  if (loadError) return <p className="text-red-600" style={sans} dir="rtl">{loadError}</p>;

  const formFields = (
    <div className="grid gap-4">
      <div>
        <label className="block text-xs text-neutral-500 mb-1">المنصة (platform)</label>
        <input
          value={formPlatform}
          onChange={(e) => setFormPlatform(e.target.value)}
          className="w-full border border-neutral-200 px-3 py-2 text-sm"
          dir="ltr"
          placeholder="whatsapp, instagram, whatsapp_channel, tiktok, facebook..."
        />
      </div>
      <div>
        <label className="block text-xs text-neutral-500 mb-1">التسمية</label>
        <input
          value={formLabel}
          onChange={(e) => setFormLabel(e.target.value)}
          className="w-full border border-neutral-200 px-3 py-2 text-sm"
          placeholder="واتساب، إنستغرام..."
        />
      </div>
      <div>
        <label className="block text-xs text-neutral-500 mb-1">الرابط (URL)</label>
        <input
          value={formUrl}
          onChange={(e) => setFormUrl(e.target.value)}
          className="w-full border border-neutral-200 px-3 py-2 text-sm"
          dir="ltr"
          placeholder="https://..."
        />
      </div>
      <div>
        <label className="block text-xs text-neutral-500 mb-1">الأيقونة (اختياري)</label>
        <input
          value={formIcon}
          onChange={(e) => setFormIcon(e.target.value)}
          className="w-full border border-neutral-200 px-3 py-2 text-sm"
          dir="ltr"
          placeholder="whatsapp, instagram..."
        />
      </div>
      {panelError ? <p className="text-sm text-red-600" role="alert">{panelError}</p> : null}
      <div className="flex gap-2 flex-wrap pt-2">
        <button
          type="button"
          onClick={savePanel}
          disabled={saving}
          className="px-4 py-2 bg-[#B63A6B] text-white text-sm rounded-sm hover:brightness-110 transition-[filter] disabled:opacity-50"
        >
          {saving ? "جاري الحفظ…" : "حفظ"}
        </button>
        <button type="button" onClick={closePanel} className="px-4 py-2 border border-black text-sm">إلغاء</button>
      </div>
    </div>
  );

  return (
    <div dir="rtl" style={sans} className="relative">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h2 className="text-xl font-medium text-neutral-900">روابط التواصل الاجتماعي</h2>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#B63A6B] text-white text-sm rounded-sm hover:brightness-110 transition-[filter]"
        >
          <Plus className="w-4 h-4 shrink-0" strokeWidth={1.75} aria-hidden />
          إضافة رابط
        </button>
      </div>

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
              <h3 className="text-lg font-medium">{panel?.mode === "create" ? "رابط جديد" : "تعديل الرابط"}</h3>
              <button type="button" onClick={closePanel} className="p-2 rounded-sm hover:opacity-70 text-neutral-600" aria-label="إغلاق">
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
          <table className="w-full min-w-[32rem] text-sm">
            <thead>
              <tr className="border-b border-black/10 text-right">
                <th className="p-4 font-medium">المنصة</th>
                <th className="p-4 font-medium">التسمية</th>
                <th className="p-4 font-medium">الرابط</th>
                <th className="p-4 font-medium">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {list.map((link) => (
                <tr key={link._id} className="border-b border-black/5 bg-white">
                  <td className="p-4 font-mono text-xs text-neutral-500" dir="ltr">{link.platform}</td>
                  <td className="p-4 font-medium">{link.label}</td>
                  <td className="p-4 text-neutral-600 truncate max-w-[14rem]" dir="ltr">
                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-[#B63A6B]">
                      {link.url}
                    </a>
                  </td>
                  <td className="p-4">
                    <button type="button" onClick={() => openEdit(link)} className="text-black underline ms-3">تعديل</button>
                    <button type="button" onClick={() => setDeleteTarget(link)} className="inline-flex items-center gap-1 text-red-600 underline ms-3">
                      <Trash2 className="w-3.5 h-3.5" strokeWidth={1.75} />
                      حذف
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {list.length === 0 && <p className="p-8 text-neutral-500 text-center">لا توجد روابط.</p>}
      </div>

      <ConfirmModal
        open={deleteTarget !== null}
        title="حذف الرابط"
        message={deleteTarget ? `هل أنت متأكد من حذف "${deleteTarget.label}"؟` : ""}
        confirmLabel="حذف"
        cancelLabel="إلغاء"
        onConfirm={deleteLink}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
