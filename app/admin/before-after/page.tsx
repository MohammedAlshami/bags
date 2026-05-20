"use client";

import { useRef, useEffect, useState, type ChangeEvent } from "react";
import { ImagePlus, Loader2, Plus, X, Trash2 } from "lucide-react";
import { adminIconClassName, sans } from "@/lib/page-theme";
import { adminApiErrorAr } from "@/lib/admin-ar";
import { AdminSkeletonCustomersPage } from "@/lib/admin-skeleton";
import { ConfirmModal } from "@/app/components/ConfirmModal";
import { SafeImage } from "@/app/components/SafeImage";

type BeforeAfterImage = {
  _id: string;
  imageUrl: string;
};

type PanelState = null | { mode: "create" } | { mode: "edit"; item: BeforeAfterImage };

export default function AdminBeforeAfterPage() {
  const [list, setList] = useState<BeforeAfterImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [panel, setPanel] = useState<PanelState>(null);
  const [panelError, setPanelError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<BeforeAfterImage | null>(null);

  const [formImageUrl, setFormImageUrl] = useState("");
  const imageFileInputRef = useRef<HTMLInputElement>(null);

  const fetchList = async (): Promise<BeforeAfterImage[]> => {
    const res = await fetch("/api/admin/before-after");
    if (!res.ok) throw new Error("Failed to load images");
    return res.json() as Promise<BeforeAfterImage[]>;
  };

  useEffect(() => {
    setLoading(true);
    fetchList()
      .then((data) => { setList(data); setLoadError(null); })
      .catch((e) => setLoadError(adminApiErrorAr(e instanceof Error ? e.message : "Error")))
      .finally(() => setLoading(false));
  }, []);

  const panelOpen = panel !== null;

  useEffect(() => {
    if (!panelOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setPanel(null); };
    document.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; document.removeEventListener("keydown", onKey); };
  }, [panelOpen]);

  const resetForm = () => { setFormImageUrl(""); setPanelError(null); };

  const openCreate = () => { resetForm(); setPanel({ mode: "create" }); };

  const openEdit = (item: BeforeAfterImage) => {
    setFormImageUrl(item.imageUrl);
    setPanelError(null);
    setPanel({ mode: "edit", item });
  };

  const closePanel = () => { setPanel(null); setPanelError(null); };

  const uploadImage = async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: form, credentials: "include" });
      if (!res.ok) {
        const d = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(d.error || "فشل الرفع");
      }
      const { url } = await res.json() as { url: string };
      setFormImageUrl(url);
    } catch (e) {
      setPanelError(adminApiErrorAr(e instanceof Error ? e.message : "فشل الرفع"));
    } finally {
      setUploading(false);
    }
  };

  const onImageDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const f = e.dataTransfer.files?.[0];
    if (f) uploadImage(f);
  };

  const onImageFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) uploadImage(f);
    e.target.value = "";
  };

  const savePanel = async () => {
    if (!panel) return;
    setSaving(true); setPanelError(null);
    try {
      const body = { imageUrl: formImageUrl };
      if (panel.mode === "create") {
        const res = await fetch("/api/admin/before-after", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
        if (!res.ok) { const d = await res.json().catch(() => ({})) as { error?: string }; throw new Error(d.error || "Failed to create"); }
      } else {
        const res = await fetch(`/api/admin/before-after/${panel.item._id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
        if (!res.ok) { const d = await res.json().catch(() => ({})) as { error?: string }; throw new Error(d.error || "Failed to update"); }
      }
      closePanel();
      setList(await fetchList());
    } catch (e) { setPanelError(adminApiErrorAr(e instanceof Error ? e.message : "Error")); }
    finally { setSaving(false); }
  };

  const deleteItem = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/admin/before-after/${deleteTarget._id}`, { method: "DELETE" });
      if (!res.ok) { const d = await res.json().catch(() => ({})) as { error?: string }; throw new Error(d.error || "Failed to delete"); }
      setDeleteTarget(null);
      setList(await fetchList());
    } catch (e) { setPanelError(adminApiErrorAr(e instanceof Error ? e.message : "Error")); setDeleteTarget(null); }
  };

  if (loading) return <AdminSkeletonCustomersPage />;
  if (loadError) return <p className="text-red-600" style={sans} dir="rtl">{loadError}</p>;

  const formFields = (
    <div className="grid gap-4">
      <div>
        <label className="block text-xs text-neutral-500 mb-1">الصورة</label>
        <input
          ref={imageFileInputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          aria-hidden
          tabIndex={-1}
          disabled={uploading}
          onChange={onImageFileChange}
        />
        <div
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              imageFileInputRef.current?.click();
            }
          }}
          onClick={() => !uploading && imageFileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
          onDragLeave={(e) => { e.preventDefault(); }}
          onDrop={onImageDrop}
          className={[
            "relative rounded-xl border-2 border-dashed transition-colors min-h-[168px] flex flex-col items-center justify-center text-center px-4 py-6 cursor-pointer select-none",
            uploading ? "border-neutral-200 bg-white opacity-70 pointer-events-none" : "",
            !uploading ? "border-neutral-200 bg-white hover:border-neutral-400" : "",
          ].join(" ")}
        >
          {uploading ? (
            <p className="text-sm text-neutral-600" style={sans}>جاري الرفع…</p>
          ) : formImageUrl ? (
            <div className="relative w-full max-w-[240px] mx-auto">
              <div className="relative aspect-square w-full rounded-lg overflow-hidden border border-black/10 bg-neutral-100">
                <SafeImage src={formImageUrl} alt="" fill className="object-contain" sizes="240px" />
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  className="text-xs text-neutral-600 underline hover:text-black"
                  onClick={(e) => {
                    e.stopPropagation();
                    imageFileInputRef.current?.click();
                  }}
                >
                  تغيير الصورة
                </button>
                <span className="text-neutral-300" aria-hidden>|</span>
                <button
                  type="button"
                  className="text-xs text-red-600 underline hover:text-red-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFormImageUrl("");
                  }}
                >
                  إزالة
                </button>
              </div>
            </div>
          ) : (
            <>
              <ImagePlus className={`w-11 h-11 mb-3 ${adminIconClassName}`} strokeWidth={1.25} aria-hidden />
              <p className="text-sm font-medium text-neutral-800" style={sans}>اسحب الصورة هنا</p>
              <p className="text-xs text-neutral-500 mt-1">أو اضغط لاختيار ملف من جهازك</p>
              <p className="text-[11px] text-neutral-400 mt-2">PNG، JPG، WebP</p>
            </>
          )}
        </div>
      </div>
      {panelError ? <p className="text-sm text-red-600" role="alert">{panelError}</p> : null}
      <div className="flex gap-2 flex-wrap pt-2">
        <button type="button" onClick={savePanel} disabled={saving || !formImageUrl} className="px-4 py-2 bg-[#B63A6B] text-white text-sm rounded-sm hover:brightness-110 transition-[filter] disabled:opacity-50">
          {saving ? "جاري الحفظ…" : "حفظ"}
        </button>
        <button type="button" onClick={closePanel} className="px-4 py-2 border border-black text-sm">إلغاء</button>
      </div>
    </div>
  );

  return (
    <div dir="rtl" style={sans} className="relative">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h2 className="text-xl font-medium text-neutral-900">صور قبل وبعد</h2>
        <button type="button" onClick={openCreate} className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#B63A6B] text-white text-sm rounded-sm hover:brightness-110 transition-[filter]">
          <Plus className="w-4 h-4 shrink-0" strokeWidth={1.75} aria-hidden />
          إضافة صورة
        </button>
      </div>

      {panelOpen && (
        <>
          <button type="button" className="fixed inset-0 z-[60] cursor-pointer bg-black/40 transition-colors hover:bg-black/50" aria-label="إغلاق" onClick={closePanel} />
          <aside className="fixed z-[70] flex flex-col bg-white shadow-2xl inset-x-0 bottom-0 max-h-[92vh] rounded-t-2xl border-t border-black/10 md:inset-x-auto md:left-0 md:top-0 md:bottom-0 md:right-auto md:h-full md:max-h-none md:w-full md:max-w-md md:rounded-none md:border-t-0 md:border-l md:border-black/10">
            <div className="flex shrink-0 items-center justify-between gap-3 px-4 py-3">
              <h3 className="text-lg font-medium">{panel?.mode === "create" ? "صورة جديدة" : "تعديل الصورة"}</h3>
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
                <th className="p-4 font-medium">الصورة</th>
                <th className="p-4 font-medium">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {list.map((item) => (
                <tr key={item._id} className="border-b border-black/5 bg-white">
                  <td className="p-4">
                    <span className="relative inline-block size-16 overflow-hidden rounded-lg bg-neutral-100 ring-1 ring-black/5">
                      <SafeImage src={item.imageUrl} alt="" fill className="object-cover" sizes="64px" />
                    </span>
                  </td>
                  <td className="p-4">
                    <button type="button" onClick={() => openEdit(item)} className="text-black underline ms-3">تعديل</button>
                    <button type="button" onClick={() => setDeleteTarget(item)} className="inline-flex items-center gap-1 text-red-600 underline ms-3">
                      <Trash2 className="w-3.5 h-3.5" strokeWidth={1.75} /> حذف
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {list.length === 0 && <p className="p-8 text-neutral-500 text-center">لا توجد صور.</p>}
      </div>

      <ConfirmModal
        open={deleteTarget !== null}
        title="حذف الصورة"
        message="هل أنت متأكد من حذف هذه الصورة؟"
        confirmLabel="حذف"
        cancelLabel="إلغاء"
        onConfirm={deleteItem}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
