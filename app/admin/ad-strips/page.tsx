"use client";

import { useRef, useEffect, useState, type ChangeEvent } from "react";
import { Edit3, ImagePlus, Loader2, Plus, Trash2, X } from "lucide-react";
import { adminIconClassName, sans } from "@/lib/page-theme";
import { adminApiErrorAr } from "@/lib/admin-ar";
import { AdminSkeletonCustomersPage } from "@/lib/admin-skeleton";
import { ConfirmModal } from "@/app/components/ConfirmModal";
import { SafeImage } from "@/app/components/SafeImage";

/* ─── ad-strip types ─── */

type AdStrip = {
  _id: string;
  text: string;
  isActive: boolean;
  bgColor: string | null;
  textColor: string | null;
  linkUrl: string | null;
};

/* ─── hero-image types ─── */

type HeroImage = {
  _id: string;
  imageUrl: string;
};

type PanelState = null | { mode: "create" };

/* ─── component ─── */

export default function AdminAdStripsPage() {
  /* ── ad-strip state ── */
  const [strip, setStrip] = useState<AdStrip | null>(null);
  const [stripLoading, setStripLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [editing, setEditing] = useState(false);

  const [text, setText] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [bgColor, setBgColor] = useState("");
  const [textColor, setTextColor] = useState("");
  const [linkUrl, setLinkUrl] = useState("");

  /* ── hero-image state ── */
  const [heroList, setHeroList] = useState<HeroImage[]>([]);
  const [heroLoading, setHeroLoading] = useState(true);
  const [heroError, setHeroError] = useState<string | null>(null);
  const [panel, setPanel] = useState<PanelState>(null);
  const [panelError, setPanelError] = useState<string | null>(null);
  const [panelSaving, setPanelSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<HeroImage | null>(null);

  const [formImageUrl, setFormImageUrl] = useState("");
  const imageFileInputRef = useRef<HTMLInputElement>(null);

  /* ── fetch ad-strip ── */
  useEffect(() => {
    setStripLoading(true);
    fetch("/api/admin/ad-strips")
      .then((r) => r.json() as Promise<AdStrip | null>)
      .then((data) => {
        if (data) {
          setStrip(data);
          setText(data.text);
          setIsActive(data.isActive);
          setBgColor(data.bgColor ?? "");
          setTextColor(data.textColor ?? "");
          setLinkUrl(data.linkUrl ?? "");
        }
        setError(null);
      })
      .catch((e) => setError(adminApiErrorAr(e instanceof Error ? e.message : "Error")))
      .finally(() => setStripLoading(false));
  }, []);

  /* ── fetch hero images ── */
  const fetchHeroList = async (): Promise<HeroImage[]> => {
    const res = await fetch("/api/admin/hero-images");
    if (!res.ok) throw new Error("Failed to load hero images");
    return res.json() as Promise<HeroImage[]>;
  };

  useEffect(() => {
    setHeroLoading(true);
    fetchHeroList()
      .then((data) => { setHeroList(data); setHeroError(null); })
      .catch((e) => setHeroError(adminApiErrorAr(e instanceof Error ? e.message : "Error")))
      .finally(() => setHeroLoading(false));
  }, []);

  /* ── sidesheet effects ── */
  const panelOpen = panel !== null;

  useEffect(() => {
    if (!panelOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setPanel(null); };
    document.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; document.removeEventListener("keydown", onKey); };
  }, [panelOpen]);

  /* ── ad-strip handlers ── */

  const startEditing = () => {
    if (strip) {
      setText(strip.text);
      setIsActive(strip.isActive);
      setBgColor(strip.bgColor ?? "");
      setTextColor(strip.textColor ?? "");
      setLinkUrl(strip.linkUrl ?? "");
    }
    setError(null);
    setSuccess(false);
    setEditing(true);
  };

  const cancelEditing = () => {
    setEditing(false);
    setError(null);
    setSuccess(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await fetch("/api/admin/ad-strips", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          isActive,
          bgColor: bgColor || null,
          textColor: textColor || null,
          linkUrl: linkUrl || null,
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(d.error || "Failed to save");
      }
      const updated = (await res.json()) as AdStrip;
      setStrip(updated);
      setEditing(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      setError(adminApiErrorAr(e instanceof Error ? e.message : "Error"));
    } finally {
      setSaving(false);
    }
  };

  /* ── hero-image handlers ── */

  const resetForm = () => { setFormImageUrl(""); setPanelError(null); };

  const openCreate = () => { resetForm(); setPanel({ mode: "create" }); };

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
    setPanelSaving(true); setPanelError(null);
    try {
      const body = { imageUrl: formImageUrl };
      const res = await fetch("/api/admin/hero-images", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (!res.ok) {
        const d = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(d.error || "Failed to create");
      }
      closePanel();
      setHeroList(await fetchHeroList());
    } catch (e) { setPanelError(adminApiErrorAr(e instanceof Error ? e.message : "Error")); }
    finally { setPanelSaving(false); }
  };

  const deleteItem = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/admin/hero-images/${deleteTarget._id}`, { method: "DELETE" });
      if (!res.ok) {
        const d = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(d.error || "Failed to delete");
      }
      setDeleteTarget(null);
      setHeroList(await fetchHeroList());
    } catch (e) { setHeroError(adminApiErrorAr(e instanceof Error ? e.message : "Error")); setDeleteTarget(null); }
  };

  if (stripLoading) return <AdminSkeletonCustomersPage />;

  /* ── hero sidesheet form ── */

  const heroFormFields = (
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
              <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-black/10 bg-neutral-100">
                <SafeImage src={formImageUrl} alt="" fill className="object-cover" sizes="240px" />
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
        <button type="button" onClick={savePanel} disabled={panelSaving || !formImageUrl} className="px-4 py-2 bg-[#B63A6B] text-white text-sm rounded-sm hover:brightness-110 transition-[filter] disabled:opacity-50">
          {panelSaving ? "جاري الحفظ…" : "حفظ"}
        </button>
        <button type="button" onClick={closePanel} className="px-4 py-2 border border-black text-sm">إلغاء</button>
      </div>
    </div>
  );

  /* ── render ── */

  return (
    <div dir="rtl" style={sans} className="relative">
      <h2 className="text-xl font-medium text-neutral-900 mb-6">تسويق الصفحة الرئيسية</h2>

      {/* ──────── ad-strip section ──────── */}

      <div className="mb-10">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <h3 className="text-lg font-medium text-neutral-800">الشريط الإعلاني</h3>
          {!editing && strip && (
            <button
              type="button"
              onClick={startEditing}
              className="inline-flex items-center justify-center gap-1.5 rounded-sm border border-[#B63A6B] px-4 py-2 text-sm text-[#B63A6B] hover:bg-[#B63A6B] hover:text-white transition-colors"
            >
              <Edit3 className="h-4 w-4" strokeWidth={1.75} aria-hidden />
              تعديل
            </button>
          )}
        </div>

        {!editing && strip ? (
          <div className="grid gap-6">
            <div className="rounded-sm border border-black/10 bg-white p-6">
              <dl className="grid gap-4 text-sm">
                <div>
                  <dt className="text-xs text-neutral-500 mb-1">النص</dt>
                  <dd className="font-medium text-neutral-900">{strip.text}</dd>
                </div>
                {strip.linkUrl ? (
                  <div>
                    <dt className="text-xs text-neutral-500 mb-1">الرابط</dt>
                    <dd className="truncate font-mono text-xs text-neutral-600" dir="ltr">{strip.linkUrl}</dd>
                  </div>
                ) : null}
                <div>
                  <dt className="text-xs text-neutral-500 mb-1">الألوان</dt>
                  <dd className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5 text-xs">
                      <span className="inline-block h-4 w-4 rounded border border-black/10" style={{ backgroundColor: strip.bgColor ?? "#B63A6B" }} />
                      الخلفية
                    </span>
                    <span className="flex items-center gap-1.5 text-xs">
                      <span className="inline-block h-4 w-4 rounded border border-black/10" style={{ backgroundColor: strip.textColor ?? "#ffffff" }} />
                      النص
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-neutral-500 mb-1">الحالة</dt>
                  <dd>
                    <span className={`inline-block px-2 py-0.5 text-xs rounded-full ${strip.isActive ? "bg-green-100 text-green-700" : "bg-neutral-100 text-neutral-500"}`}>
                      {strip.isActive ? "نشط" : "غير نشط"}
                    </span>
                  </dd>
                </div>
              </dl>
            </div>

            <div>
              <h4 className="text-sm font-medium text-neutral-500 mb-3">معاينة:</h4>
              <div
                className="flex min-h-[40px] w-full items-center justify-center overflow-hidden border-b border-black/5 px-4 py-2 text-center text-[12px] font-medium leading-none"
                style={{
                  backgroundColor: strip.bgColor ?? "#B63A6B",
                  color: strip.textColor ?? "#ffffff",
                }}
              >
                {strip.text}
              </div>
            </div>
          </div>
        ) : null}

        {editing ? (
          <div className="max-w-lg rounded-sm border border-black/10 bg-white p-6">
            <div className="flex items-center justify-between mb-5">
              <h4 className="text-sm font-semibold text-neutral-900">تعديل الشريط الإعلاني</h4>
              <button type="button" onClick={cancelEditing} className="rounded-sm p-1 text-neutral-500 hover:text-neutral-700">
                <X className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>
            <div className="grid gap-5">
              <div>
                <label className="block text-xs text-neutral-500 mb-1">النص</label>
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full border border-neutral-200 px-3 py-2 text-sm"
                  placeholder="نص الإعلان..."
                  dir="rtl"
                />
              </div>

              <div>
                <label className="block text-xs text-neutral-500 mb-1">الرابط (اختياري)</label>
                <input
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="w-full border border-neutral-200 px-3 py-2 text-sm"
                  dir="ltr"
                  placeholder="https://..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-neutral-500 mb-1">لون الخلفية (اختياري)</label>
                  <div className="flex gap-2 items-center">
                    <input
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-full border border-neutral-200 px-3 py-2 text-sm"
                      dir="ltr"
                      placeholder="#B63A6B"
                    />
                    {bgColor && (
                      <span
                        className="shrink-0 w-8 h-8 rounded border border-black/10"
                        style={{ backgroundColor: bgColor }}
                      />
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-neutral-500 mb-1">لون النص (اختياري)</label>
                  <div className="flex gap-2 items-center">
                    <input
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="w-full border border-neutral-200 px-3 py-2 text-sm"
                      dir="ltr"
                      placeholder="#ffffff"
                    />
                    {textColor && (
                      <span
                        className="shrink-0 w-8 h-8 rounded border border-black/10"
                        style={{ backgroundColor: textColor }}
                      />
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium">الشريط نشط</span>
                </label>
              </div>

              {error ? <p className="text-sm text-red-600" role="alert">{error}</p> : null}

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-[#B63A6B] text-white text-sm rounded-sm hover:brightness-110 transition-[filter] disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      جاري الحفظ…
                    </>
                  ) : (
                    "حفظ"
                  )}
                </button>
                <button type="button" onClick={cancelEditing} className="px-4 py-2 border border-black text-sm rounded-sm">إلغاء</button>
                {success && <span className="text-sm text-green-600">تم الحفظ بنجاح ✓</span>}
              </div>
            </div>
          </div>
        ) : null}

        {!strip && !editing ? (
          <div className="rounded-sm border border-black/10 bg-white p-8 text-center text-sm text-neutral-500">
            لا يوجد شريط إعلاني بعد.
          </div>
        ) : null}
      </div>

      {/* ──────── hero images section ──────── */}

      <div>
        <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
          <h3 className="text-lg font-medium text-neutral-800">صور السلايدر الرئيسي</h3>
          <button type="button" onClick={openCreate} className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#B63A6B] text-white text-sm rounded-sm hover:brightness-110 transition-[filter]">
            <Plus className="w-4 h-4 shrink-0" strokeWidth={1.75} aria-hidden />
            إضافة صورة
          </button>
        </div>

        {heroLoading ? (
          <div className="rounded-sm border border-black/10 bg-white p-8 text-center text-sm text-neutral-500">جاري التحميل…</div>
        ) : heroError ? (
          <p className="text-sm text-red-600" role="alert">{heroError}</p>
        ) : heroList.length === 0 ? (
          <div className="rounded-sm border border-black/10 bg-white p-8 text-center text-sm text-neutral-500">
            لا توجد صور للسلايدر بعد.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {heroList.map((item) => (
              <div key={item._id} className="group relative aspect-video overflow-hidden rounded-lg border border-black/10 bg-neutral-100">
                <SafeImage src={item.imageUrl} alt="" fill className="object-cover" sizes="(max-width: 640px) 50vw, 200px" />
                <div className="absolute inset-0 flex items-end justify-center bg-black/0 p-2 opacity-0 transition-all group-hover:bg-black/30 group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(item)}
                    className="inline-flex items-center gap-1 rounded-sm bg-white px-2.5 py-1.5 text-xs font-medium text-red-600 shadow-sm transition-colors hover:bg-red-50"
                  >
                    <Trash2 className="w-3 h-3" strokeWidth={1.75} />
                    حذف
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── hero sidesheet ── */}

      {panelOpen && (
        <>
          <button type="button" className="fixed inset-0 z-[60] cursor-pointer bg-black/40 transition-colors hover:bg-black/50" aria-label="إغلاق" onClick={closePanel} />
          <aside className="fixed z-[70] flex flex-col bg-white shadow-2xl inset-x-0 bottom-0 max-h-[92vh] rounded-t-2xl border-t border-black/10 md:inset-x-auto md:left-auto md:right-0 md:top-0 md:bottom-0 md:h-full md:max-h-none md:w-full md:max-w-md md:rounded-none md:border-t-0 md:border-r md:border-black/10">
            <div className="flex shrink-0 items-center justify-between gap-3 px-4 py-3">
              <h3 className="text-lg font-medium">إضافة صورة للسلايدر</h3>
              <button type="button" onClick={closePanel} className="p-2 rounded-sm hover:opacity-70 text-neutral-600" aria-label="إغلاق">
                <X className={`w-5 h-5 ${adminIconClassName}`} strokeWidth={1.5} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4">{heroFormFields}</div>
            <div className="h-[env(safe-area-inset-bottom)] shrink-0 md:hidden" aria-hidden />
          </aside>
        </>
      )}

      {/* ── delete confirmation ── */}

      <ConfirmModal
        open={deleteTarget !== null}
        title="حذف الصورة"
        message="هل أنت متأكد من حذف هذه الصورة من السلايدر؟"
        confirmLabel="حذف"
        cancelLabel="إلغاء"
        onConfirm={deleteItem}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
