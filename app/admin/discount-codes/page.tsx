"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { adminIconClassName, sans } from "@/lib/page-theme";
import { adminApiErrorAr } from "@/lib/admin-ar";
import { AdminSkeletonCustomersPage } from "@/lib/admin-skeleton";
import { ConfirmModal } from "@/app/components/ConfirmModal";

type DiscountCode = {
  _id: string;
  code: string;
  type: "percent" | "fixed";
  value: number;
  minSubtotal: number;
  maxUses: number | null;
  usedCount: number;
  startsAt: string | null;
  expiresAt: string | null;
  isActive: boolean;
};

type PanelState = null | { mode: "create" } | { mode: "edit"; item: DiscountCode };

const toDateInput = (iso: string | null) => (iso ? iso.slice(0, 10) : "");
const inputClass = "w-full border border-neutral-200 px-3 py-2 text-sm";

function describe(c: DiscountCode) {
  return c.type === "percent" ? `${c.value}%` : `${c.value} ر.س`;
}

function statusOf(c: DiscountCode): { label: string; className: string } {
  if (!c.isActive) return { label: "غير نشط", className: "bg-neutral-100 text-neutral-500" };
  if (c.expiresAt && Date.parse(c.expiresAt) < Date.now()) return { label: "منتهي", className: "bg-red-100 text-red-700" };
  if (c.maxUses != null && c.usedCount >= c.maxUses) return { label: "مستنفد", className: "bg-amber-100 text-amber-700" };
  return { label: "نشط", className: "bg-green-100 text-green-700" };
}

export default function AdminDiscountCodesPage() {
  const [list, setList] = useState<DiscountCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [panel, setPanel] = useState<PanelState>(null);
  const [panelError, setPanelError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DiscountCode | null>(null);

  const [code, setCode] = useState("");
  const [type, setType] = useState<"percent" | "fixed">("percent");
  const [value, setValue] = useState("");
  const [minSubtotal, setMinSubtotal] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [isActive, setIsActive] = useState(true);

  const fetchList = async (): Promise<DiscountCode[]> => {
    const res = await fetch("/api/admin/discount-codes");
    if (!res.ok) throw new Error("Failed to load discount codes");
    return res.json() as Promise<DiscountCode[]>;
  };

  useEffect(() => {
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

  const fill = (c: DiscountCode | null) => {
    setCode(c?.code ?? "");
    setType(c?.type ?? "percent");
    setValue(c ? String(c.value) : "");
    setMinSubtotal(c && c.minSubtotal > 0 ? String(c.minSubtotal) : "");
    setMaxUses(c?.maxUses != null ? String(c.maxUses) : "");
    setStartsAt(toDateInput(c?.startsAt ?? null));
    setExpiresAt(toDateInput(c?.expiresAt ?? null));
    setIsActive(c?.isActive ?? true);
    setPanelError(null);
  };

  const openCreate = () => {
    fill(null);
    setPanel({ mode: "create" });
  };
  const openEdit = (item: DiscountCode) => {
    fill(item);
    setPanel({ mode: "edit", item });
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
      const body = { code, type, value, minSubtotal, maxUses, startsAt, expiresAt, isActive };
      const res = await fetch(
        panel.mode === "create" ? "/api/admin/discount-codes" : `/api/admin/discount-codes/${panel.item._id}`,
        {
          method: panel.mode === "create" ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
      );
      if (!res.ok) {
        const d = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(d.error || "Failed to save");
      }
      closePanel();
      setList(await fetchList());
    } catch (e) {
      setPanelError(adminApiErrorAr(e instanceof Error ? e.message : "Error"));
    } finally {
      setSaving(false);
    }
  };

  const deleteItem = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/admin/discount-codes/${deleteTarget._id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setList(await fetchList());
    } catch (e) {
      setLoadError(adminApiErrorAr(e instanceof Error ? e.message : "Error"));
    } finally {
      setDeleteTarget(null);
    }
  };

  if (loading) return <AdminSkeletonCustomersPage />;
  if (loadError) return <p className="text-red-600" style={sans} dir="rtl">{loadError}</p>;

  return (
    <div dir="rtl" style={sans} className="relative">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-medium text-neutral-900">أكواد الخصم</h2>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-1.5 rounded-sm bg-[#B63A6B] px-4 py-2 text-sm text-white transition-[filter] hover:brightness-110"
        >
          <Plus className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
          إضافة كود
        </button>
      </div>

      {panelOpen && (
        <>
          <button type="button" className="fixed inset-0 z-[60] cursor-pointer bg-black/40" aria-label="إغلاق" onClick={closePanel} />
          <aside className="fixed inset-x-0 bottom-0 z-[70] flex max-h-[92vh] flex-col rounded-t-2xl border-t border-black/10 bg-white shadow-2xl md:inset-x-auto md:bottom-0 md:left-0 md:right-auto md:top-0 md:h-full md:max-h-none md:w-full md:max-w-md md:rounded-none md:border-l md:border-t-0">
            <div className="flex shrink-0 items-center justify-between gap-3 px-4 py-3">
              <h3 className="text-lg font-medium">{panel?.mode === "create" ? "كود جديد" : "تعديل الكود"}</h3>
              <button type="button" onClick={closePanel} className="rounded-sm p-2 text-neutral-600 hover:opacity-70" aria-label="إغلاق">
                <X className={`h-5 w-5 ${adminIconClassName}`} strokeWidth={1.5} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4">
              <div className="grid gap-4">
                <div>
                  <label className="mb-1 block text-xs text-neutral-500">الكود (أحرف إنجليزية وأرقام)</label>
                  <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} className={inputClass} dir="ltr" placeholder="SUMMER10" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs text-neutral-500">نوع الخصم</label>
                    <select value={type} onChange={(e) => setType(e.target.value as "percent" | "fixed")} className={inputClass}>
                      <option value="percent">نسبة مئوية %</option>
                      <option value="fixed">مبلغ ثابت (ر.س)</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-neutral-500">{type === "percent" ? "النسبة" : "المبلغ (ر.س)"}</label>
                    <input value={value} onChange={(e) => setValue(e.target.value)} className={inputClass} type="number" min="0" step="any" dir="ltr" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs text-neutral-500">الحد الأدنى للطلب (ر.س)</label>
                    <input value={minSubtotal} onChange={(e) => setMinSubtotal(e.target.value)} className={inputClass} type="number" min="0" step="any" dir="ltr" placeholder="بدون" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-neutral-500">عدد مرات الاستخدام</label>
                    <input value={maxUses} onChange={(e) => setMaxUses(e.target.value)} className={inputClass} type="number" min="1" dir="ltr" placeholder="غير محدود" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs text-neutral-500">يبدأ في</label>
                    <input value={startsAt} onChange={(e) => setStartsAt(e.target.value)} className={inputClass} type="date" dir="ltr" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-neutral-500">ينتهي في</label>
                    <input value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} className={inputClass} type="date" dir="ltr" />
                  </div>
                </div>
                <label className="flex cursor-pointer items-center gap-2">
                  <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="h-4 w-4" />
                  <span className="text-sm">نشط</span>
                </label>
                {panelError ? <p className="text-sm text-red-600" role="alert">{panelError}</p> : null}
                <div className="flex flex-wrap gap-2 pt-2">
                  <button type="button" onClick={savePanel} disabled={saving} className="rounded-sm bg-[#B63A6B] px-4 py-2 text-sm text-white transition-[filter] hover:brightness-110 disabled:opacity-50">
                    {saving ? "جاري الحفظ…" : "حفظ"}
                  </button>
                  <button type="button" onClick={closePanel} className="border border-black px-4 py-2 text-sm">إلغاء</button>
                </div>
              </div>
            </div>
            <div className="h-[env(safe-area-inset-bottom)] shrink-0 md:hidden" aria-hidden />
          </aside>
        </>
      )}

      <div className="rounded-sm border border-black/10 bg-white">
        <div className="overflow-x-auto overscroll-x-contain">
          <table className="w-full min-w-[40rem] text-sm">
            <thead>
              <tr className="border-b border-black/10 text-right">
                <th className="p-4 font-medium">الكود</th>
                <th className="p-4 font-medium">الخصم</th>
                <th className="p-4 font-medium">الحد الأدنى</th>
                <th className="p-4 font-medium">الاستخدام</th>
                <th className="p-4 font-medium">الصلاحية</th>
                <th className="p-4 font-medium">الحالة</th>
                <th className="p-4 font-medium">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {list.map((c) => {
                const st = statusOf(c);
                return (
                  <tr key={c._id} className="border-b border-black/5 bg-white">
                    <td className="p-4 font-medium" dir="ltr">{c.code}</td>
                    <td className="p-4">{describe(c)}</td>
                    <td className="p-4 text-neutral-600">{c.minSubtotal > 0 ? `${c.minSubtotal} ر.س` : "—"}</td>
                    <td className="p-4 text-neutral-600">{c.usedCount}{c.maxUses != null ? ` / ${c.maxUses}` : ""}</td>
                    <td className="p-4 text-neutral-600">{c.expiresAt ? `حتى ${toDateInput(c.expiresAt)}` : "مفتوحة"}</td>
                    <td className="p-4">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs ${st.className}`}>{st.label}</span>
                    </td>
                    <td className="p-4">
                      <button type="button" onClick={() => openEdit(c)} className="ms-3 text-black underline">تعديل</button>
                      <button type="button" onClick={() => setDeleteTarget(c)} className="ms-3 inline-flex items-center gap-1 text-red-600 underline">
                        <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} /> حذف
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {list.length === 0 && <p className="p-8 text-center text-neutral-500">لا توجد أكواد خصم.</p>}
      </div>

      <ConfirmModal
        open={deleteTarget !== null}
        title="حذف الكود"
        message={deleteTarget ? `هل أنت متأكد من حذف الكود "${deleteTarget.code}"؟` : ""}
        confirmLabel="حذف"
        cancelLabel="إلغاء"
        onConfirm={deleteItem}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
