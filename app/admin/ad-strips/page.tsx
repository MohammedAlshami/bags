"use client";

import { useEffect, useState } from "react";
import { Edit3, Loader2, X } from "lucide-react";
import { sans } from "@/lib/page-theme";
import { adminApiErrorAr } from "@/lib/admin-ar";
import { AdminSkeletonCustomersPage } from "@/lib/admin-skeleton";

type AdStrip = {
  _id: string;
  text: string;
  isActive: boolean;
  bgColor: string | null;
  textColor: string | null;
  linkUrl: string | null;
};

export default function AdminAdStripsPage() {
  const [strip, setStrip] = useState<AdStrip | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [editing, setEditing] = useState(false);

  const [text, setText] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [bgColor, setBgColor] = useState("");
  const [textColor, setTextColor] = useState("");
  const [linkUrl, setLinkUrl] = useState("");

  useEffect(() => {
    setLoading(true);
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
      .finally(() => setLoading(false));
  }, []);

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

  if (loading) return <AdminSkeletonCustomersPage />;

  return (
    <div dir="rtl" style={sans}>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-medium text-neutral-900">الشريط الإعلاني</h2>
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
            <h3 className="text-sm font-medium text-neutral-500 mb-3">معاينة:</h3>
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
            <h3 className="text-sm font-semibold text-neutral-900">تعديل الشريط الإعلاني</h3>
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
  );
}
