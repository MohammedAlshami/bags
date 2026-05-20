"use client";

import { useEffect, useState } from "react";
import { Loader2, MapPin, Plus, X, Trash2 } from "lucide-react";
import { adminIconClassName, sans } from "@/lib/page-theme";
import { buildMapEmbedUrl } from "@/lib/store-locations";
import { adminApiErrorAr } from "@/lib/admin-ar";
import { AdminSkeletonCustomersPage } from "@/lib/admin-skeleton";
import { ConfirmModal } from "@/app/components/ConfirmModal";

type StoreLocation = {
  _id: string;
  name: string;
  city: string;
  country: string;
  address: string;
  phone: string | null;
  lat: number;
  lon: number;
  sortOrder: number;
};

type PanelState = null | { mode: "create" } | { mode: "edit"; location: StoreLocation };

export default function AdminStoreLocationsPage() {
  const [list, setList] = useState<StoreLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [panel, setPanel] = useState<PanelState>(null);
  const [panelError, setPanelError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<StoreLocation | null>(null);

  const [formId, setFormId] = useState("");
  const [formName, setFormName] = useState("");
  const [formCity, setFormCity] = useState("");
  const [formCountry, setFormCountry] = useState("اليمن");
  const [formAddress, setFormAddress] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formLat, setFormLat] = useState("");
  const [formLon, setFormLon] = useState("");
  const [formSortOrder, setFormSortOrder] = useState(0);

  const fetchList = async (): Promise<StoreLocation[]> => {
    const res = await fetch("/api/admin/store-locations");
    if (!res.ok) throw new Error("Failed to load store locations");
    return res.json() as Promise<StoreLocation[]>;
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
    setFormId("");
    setFormName("");
    setFormCity("");
    setFormCountry("اليمن");
    setFormAddress("");
    setFormPhone("");
    setFormLat("");
    setFormLon("");
    setFormSortOrder(0);
    setPanelError(null);
  };

  const openCreate = () => {
    resetFormFields();
    setFormSortOrder(list.length);
    setPanel({ mode: "create" });
  };

  const openEdit = (loc: StoreLocation) => {
    setFormId(loc._id);
    setFormName(loc.name);
    setFormCity(loc.city);
    setFormCountry(loc.country);
    setFormAddress(loc.address);
    setFormPhone(loc.phone ?? "");
    setFormLat(String(loc.lat));
    setFormLon(String(loc.lon));
    setFormSortOrder(loc.sortOrder);
    setPanelError(null);
    setPanel({ mode: "edit", location: loc });
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
      const latNum = parseFloat(formLat);
      const lonNum = parseFloat(formLon);
      if (!Number.isFinite(latNum) || !Number.isFinite(lonNum)) {
        throw new Error("Valid lat/lon required");
      }

      const body = {
        id: formId,
        name: formName,
        city: formCity,
        country: formCountry,
        address: formAddress,
        phone: formPhone || null,
        lat: latNum,
        lon: lonNum,
        sortOrder: formSortOrder,
      };

      if (panel.mode === "create") {
        const res = await fetch("/api/admin/store-locations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          const d = await res.json().catch(() => ({})) as { error?: string };
          const raw = typeof d.error === "string" ? d.error : "";
          throw new Error(raw || "Failed to create");
        }
      } else {
        const res = await fetch(`/api/admin/store-locations/${panel.location._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          const d = await res.json().catch(() => ({})) as { error?: string };
          const raw = typeof d.error === "string" ? d.error : "";
          throw new Error(raw || "Failed to update");
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

  const deleteLocation = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/admin/store-locations/${deleteTarget._id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({})) as { error?: string };
        const raw = typeof d.error === "string" ? d.error : "";
        throw new Error(raw || "Failed to delete");
      }
      setDeleteTarget(null);
      setList(await fetchList());
    } catch (e) {
      setPanelError(adminApiErrorAr(e instanceof Error ? e.message : "Error"));
      setDeleteTarget(null);
    }
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
      {panel?.mode === "create" ? (
        <div>
          <label className="block text-xs text-neutral-500 mb-1">المعرف (ID)</label>
          <input
            value={formId}
            onChange={(e) => setFormId(e.target.value)}
            className="w-full border border-neutral-200 px-3 py-2 text-sm"
            dir="ltr"
            placeholder="sanaa-al-kumaym"
          />
        </div>
      ) : (
        <p className="text-sm text-neutral-600">
          المعرف: <span className="font-mono text-neutral-900" dir="ltr">{formId}</span>
        </p>
      )}
      <div>
        <label className="block text-xs text-neutral-500 mb-1">الاسم</label>
        <input
          value={formName}
          onChange={(e) => setFormName(e.target.value)}
          className="w-full border border-neutral-200 px-3 py-2 text-sm"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-neutral-500 mb-1">المدينة</label>
          <input
            value={formCity}
            onChange={(e) => setFormCity(e.target.value)}
            className="w-full border border-neutral-200 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-neutral-500 mb-1">الدولة</label>
          <input
            value={formCountry}
            onChange={(e) => setFormCountry(e.target.value)}
            className="w-full border border-neutral-200 px-3 py-2 text-sm"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs text-neutral-500 mb-1">العنوان</label>
        <textarea
          value={formAddress}
          onChange={(e) => setFormAddress(e.target.value)}
          className="w-full border border-neutral-200 px-3 py-2 text-sm"
          rows={2}
        />
      </div>
      <div>
        <label className="block text-xs text-neutral-500 mb-1">رقم الهاتف</label>
        <input
          value={formPhone}
          onChange={(e) => setFormPhone(e.target.value)}
          className="w-full border border-neutral-200 px-3 py-2 text-sm"
          dir="ltr"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-neutral-500 mb-1">خط العرض (Lat)</label>
          <input
            value={formLat}
            onChange={(e) => setFormLat(e.target.value)}
            className="w-full border border-neutral-200 px-3 py-2 text-sm"
            dir="ltr"
            type="number"
            step="any"
          />
        </div>
        <div>
          <label className="block text-xs text-neutral-500 mb-1">خط الطول (Lon)</label>
          <input
            value={formLon}
            onChange={(e) => setFormLon(e.target.value)}
            className="w-full border border-neutral-200 px-3 py-2 text-sm"
            dir="ltr"
            type="number"
            step="any"
          />
        </div>
      </div>

      {(() => {
        const latNum = parseFloat(formLat);
        const lonNum = parseFloat(formLon);
        const showMap = Number.isFinite(latNum) && Number.isFinite(lonNum);
        return showMap ? (
          <div>
            <label className="block text-xs text-neutral-500 mb-1">معاينة الخريطة</label>
            <div className="relative h-40 w-full overflow-hidden rounded-sm border border-neutral-200 bg-neutral-100">
              <iframe
                title="معاينة الموقع"
                src={buildMapEmbedUrl(latNum, lonNum)}
                className="absolute inset-0 h-full w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        ) : null;
      })()}

      <div>
        <label className="block text-xs text-neutral-500 mb-1">ترتيب العرض</label>
        <input
          value={formSortOrder}
          onChange={(e) => setFormSortOrder(parseInt(e.target.value) || 0)}
          className="w-full border border-neutral-200 px-3 py-2 text-sm"
          type="number"
        />
      </div>
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
        <h2 className="text-xl font-medium text-neutral-900">نقاط البيع</h2>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#B63A6B] text-white text-sm rounded-sm hover:brightness-110 transition-[filter]"
        >
          <Plus className="w-4 h-4 shrink-0" strokeWidth={1.75} aria-hidden />
          إضافة نقطة بيع
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
              <h3 className="text-lg font-medium">{panel?.mode === "create" ? "نقطة بيع جديدة" : "تعديل نقطة البيع"}</h3>
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
          <table className="w-full min-w-[48rem] text-sm">
            <thead>
              <tr className="border-b border-black/10 text-right">
                <th className="p-4 font-medium">المعرف</th>
                <th className="p-4 font-medium">الاسم</th>
                <th className="p-4 font-medium">المدينة</th>
                <th className="p-4 font-medium">الهاتف</th>
                <th className="p-4 font-medium">الترتيب</th>
                <th className="p-4 font-medium">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {list.map((loc) => (
                <tr key={loc._id} className="border-b border-black/5 bg-white">
                  <td className="p-4 font-mono text-xs text-neutral-500" dir="ltr">{loc._id}</td>
                  <td className="p-4 font-medium">{loc.name}</td>
                  <td className="p-4 text-neutral-600">{loc.city || "—"}</td>
                  <td className="p-4 text-neutral-600 text-left" dir="ltr">{loc.phone || "—"}</td>
                  <td className="p-4 text-neutral-600">{loc.sortOrder}</td>
                  <td className="p-4">
                    <button type="button" onClick={() => openEdit(loc)} className="text-black underline ms-3">
                      تعديل
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(loc)}
                      className="inline-flex items-center gap-1 text-red-600 underline ms-3"
                    >
                      <Trash2 className="w-3.5 h-3.5" strokeWidth={1.75} />
                      حذف
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {list.length === 0 && <p className="p-8 text-neutral-500 text-center">لا توجد نقاط بيع.</p>}
      </div>

      <ConfirmModal
        open={deleteTarget !== null}
        title="حذف نقطة البيع"
        message={deleteTarget ? `هل أنت متأكد من حذف "${deleteTarget.name}"؟` : ""}
        confirmLabel="حذف"
        cancelLabel="إلغاء"
        onConfirm={deleteLocation}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
