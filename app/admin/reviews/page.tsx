"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Plus, X, Trash2 } from "lucide-react";
import { adminIconClassName, sans } from "@/lib/page-theme";
import { adminApiErrorAr } from "@/lib/admin-ar";
import { AdminSkeletonCustomersPage } from "@/lib/admin-skeleton";
import { ConfirmModal } from "@/app/components/ConfirmModal";
import { SafeImage } from "@/app/components/SafeImage";

type ProductRow = {
  _id: string;
  name: string;
  image: string;
};

type Review = {
  _id: string;
  author: string;
  body: string;
  productId: string | null;
  sortOrder: number;
  isActive: boolean;
};

type PanelState = null | { mode: "create" } | { mode: "edit"; item: Review };

export default function AdminReviewsPage() {
  const [list, setList] = useState<Review[]>([]);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [panel, setPanel] = useState<PanelState>(null);
  const [panelError, setPanelError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Review | null>(null);

  const [formAuthor, setFormAuthor] = useState("");
  const [formBody, setFormBody] = useState("");
  const [formProductId, setFormProductId] = useState("");
  const [formSortOrder, setFormSortOrder] = useState(0);
  const [formIsActive, setFormIsActive] = useState(true);
  const [productPickerOpen, setProductPickerOpen] = useState(false);

  const productsById = useMemo(() => new Map(products.map((p) => [p._id, p])), [products]);

  const selectedProduct = formProductId ? productsById.get(formProductId) ?? null : null;

  const fetchList = async (): Promise<Review[]> => {
    const res = await fetch("/api/admin/reviews");
    if (!res.ok) throw new Error("Failed to load reviews");
    return res.json() as Promise<Review[]>;
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchList(),
      fetch("/api/admin/products?all=1").then((r) => r.json() as Promise<ProductRow[]>),
    ])
      .then(([reviewsData, productsData]) => {
        setList(reviewsData);
        setProducts(productsData);
        setLoadError(null);
      })
      .catch((e) => setLoadError(adminApiErrorAr(e instanceof Error ? e.message : "Error")))
      .finally(() => setLoading(false));
  }, []);

  const panelOpen = panel !== null;

  useEffect(() => {
    if (!panelOpen && !productPickerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (productPickerOpen) setProductPickerOpen(false);
        else setPanel(null);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; document.removeEventListener("keydown", onKey); };
  }, [panelOpen, productPickerOpen]);

  const resetForm = () => { setFormAuthor(""); setFormBody(""); setFormProductId(""); setFormSortOrder(0); setFormIsActive(true); setPanelError(null); };

  const openCreate = () => { resetForm(); setFormSortOrder(list.length); setPanel({ mode: "create" }); };

  const openEdit = (item: Review) => {
    setFormAuthor(item.author);
    setFormBody(item.body);
    setFormProductId(item.productId ?? "");
    setFormSortOrder(item.sortOrder);
    setFormIsActive(item.isActive);
    setPanelError(null);
    setPanel({ mode: "edit", item });
  };

  const closePanel = () => { setPanel(null); setPanelError(null); };

  const savePanel = async () => {
    if (!panel) return;
    setSaving(true); setPanelError(null);
    try {
      const body = { author: formAuthor, body: formBody, productId: formProductId || null, sortOrder: formSortOrder, isActive: formIsActive };
      if (panel.mode === "create") {
        const res = await fetch("/api/admin/reviews", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
        if (!res.ok) { const d = await res.json().catch(() => ({})) as { error?: string }; throw new Error(d.error || "Failed to create"); }
      } else {
        const res = await fetch(`/api/admin/reviews/${panel.item._id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
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
      const res = await fetch(`/api/admin/reviews/${deleteTarget._id}`, { method: "DELETE" });
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
        <label className="block text-xs text-neutral-500 mb-1">اسم العميل</label>
        <input value={formAuthor} onChange={(e) => setFormAuthor(e.target.value)} className="w-full border border-neutral-200 px-3 py-2 text-sm" placeholder="نورة ع." />
      </div>
      <div>
        <label className="block text-xs text-neutral-500 mb-1">نص التقييم</label>
        <textarea value={formBody} onChange={(e) => setFormBody(e.target.value)} className="w-full border border-neutral-200 px-3 py-2 text-sm min-h-[100px]" placeholder="اكتب التقييم هنا..." />
      </div>
      <div>
        <label className="block text-xs text-neutral-500 mb-1">المنتج (اختياري)</label>
        <div className="flex items-center gap-2">
          {selectedProduct ? (
            <div className="flex flex-1 items-center gap-2 rounded-lg border border-neutral-200 bg-white p-2">
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-neutral-100">
                {selectedProduct.image ? (
                  <SafeImage src={selectedProduct.image} alt={selectedProduct.name} fill className="object-cover" sizes="40px" />
                ) : null}
              </div>
              <span className="flex-1 truncate text-sm font-medium text-neutral-900">{selectedProduct.name}</span>
              <button type="button" onClick={() => setFormProductId("")} className="text-xs text-red-600 hover:text-red-700">إزالة</button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setProductPickerOpen(true)}
              className="flex-1 rounded-lg border border-dashed border-neutral-300 px-4 py-2 text-sm text-neutral-500 hover:border-neutral-500 hover:text-neutral-700"
            >
              + اختر منتج
            </button>
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-neutral-500 mb-1">ترتيب العرض</label>
          <input value={formSortOrder} onChange={(e) => setFormSortOrder(parseInt(e.target.value) || 0)} className="w-full border border-neutral-200 px-3 py-2 text-sm" type="number" />
        </div>
        <div className="flex items-end pb-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={formIsActive} onChange={(e) => setFormIsActive(e.target.checked)} className="w-4 h-4" />
            <span className="text-sm">نشط</span>
          </label>
        </div>
      </div>
      {panelError ? <p className="text-sm text-red-600" role="alert">{panelError}</p> : null}
      <div className="flex gap-2 flex-wrap pt-2">
        <button type="button" onClick={savePanel} disabled={saving} className="px-4 py-2 bg-[#B63A6B] text-white text-sm rounded-sm hover:brightness-110 transition-[filter] disabled:opacity-50">
          {saving ? "جاري الحفظ…" : "حفظ"}
        </button>
        <button type="button" onClick={closePanel} className="px-4 py-2 border border-black text-sm">إلغاء</button>
      </div>
    </div>
  );

  return (
    <div dir="rtl" style={sans} className="relative">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h2 className="text-xl font-medium text-neutral-900">تقييمات العملاء</h2>
        <button type="button" onClick={openCreate} className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#B63A6B] text-white text-sm rounded-sm hover:brightness-110 transition-[filter]">
          <Plus className="w-4 h-4 shrink-0" strokeWidth={1.75} aria-hidden />
          إضافة تقييم
        </button>
      </div>

      {panelOpen && (
        <>
          <button type="button" className="fixed inset-0 z-[60] cursor-pointer bg-black/40 transition-colors hover:bg-black/50" aria-label="إغلاق" onClick={closePanel} />
          <aside className="fixed z-[70] flex flex-col bg-white shadow-2xl inset-x-0 bottom-0 max-h-[92vh] rounded-t-2xl border-t border-black/10 md:inset-x-auto md:left-0 md:top-0 md:bottom-0 md:right-auto md:h-full md:max-h-none md:w-full md:max-w-md md:rounded-none md:border-t-0 md:border-l md:border-black/10">
            <div className="flex shrink-0 items-center justify-between gap-3 px-4 py-3">
              <h3 className="text-lg font-medium">{panel?.mode === "create" ? "تقييم جديد" : "تعديل التقييم"}</h3>
              <button type="button" onClick={closePanel} className="p-2 rounded-sm hover:opacity-70 text-neutral-600" aria-label="إغلاق">
                <X className={`w-5 h-5 ${adminIconClassName}`} strokeWidth={1.5} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4">{formFields}</div>
            <div className="h-[env(safe-area-inset-bottom)] shrink-0 md:hidden" aria-hidden />
          </aside>
        </>
      )}

      {productPickerOpen ? (
        <>
          <button type="button" className="fixed inset-0 z-[80] cursor-pointer bg-black/40" aria-label="إغلاق اختيار المنتج" onClick={() => setProductPickerOpen(false)} />
          <aside className="fixed inset-x-0 bottom-0 z-[90] flex max-h-[92vh] flex-col rounded-t-2xl border-t border-black/10 bg-white shadow-2xl md:inset-x-auto md:bottom-0 md:left-0 md:top-0 md:h-full md:max-h-none md:w-full md:max-w-3xl md:rounded-none md:border-l md:border-t-0">
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-black/5 px-4 py-3">
              <div>
                <h3 className="text-lg font-medium">اختيار المنتج</h3>
                <p className="mt-1 text-xs text-neutral-500">اختر المنتج المرتبط بهذا التقييم.</p>
              </div>
              <button type="button" onClick={() => setProductPickerOpen(false)} className="rounded-sm p-2 text-neutral-600 hover:opacity-70" aria-label="إغلاق">
                <X className={`h-5 w-5 ${adminIconClassName}`} strokeWidth={1.5} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4">
              {products.length === 0 ? (
                <p className="py-8 text-center text-sm text-neutral-500">لا توجد منتجات.</p>
              ) : (
                <ul className="m-0 grid list-none grid-cols-2 gap-4 p-0 md:grid-cols-3">
                  {products.map((product) => {
                    const selected = formProductId === product._id;
                    return (
                      <li key={product._id}>
                        <button
                          type="button"
                          onClick={() => { setFormProductId(product._id); setProductPickerOpen(false); }}
                          className={[
                            "group flex h-full w-full flex-col text-center",
                            selected ? "text-brand-primary" : "text-neutral-900",
                          ].join(" ")}
                          aria-pressed={selected}
                        >
                          <span
                            className={[
                              "relative block aspect-[3/5] w-full overflow-hidden rounded-2xl border bg-neutral-100 transition",
                              selected ? "border-[#B63A6B] ring-2 ring-[#B63A6B]/20" : "border-transparent",
                            ].join(" ")}
                          >
                            {product.image ? (
                              <SafeImage src={product.image} alt={product.name} fill className="object-cover object-center transition-transform duration-300 group-hover:scale-[1.03]" sizes="(max-width: 768px) 50vw, 33vw" />
                            ) : null}
                          </span>
                          <span className="mt-3 line-clamp-2 text-sm font-semibold leading-snug">{product.name}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
            <div className="flex shrink-0 items-center justify-between gap-3 border-t border-black/5 px-4 py-3">
              <p className="text-xs text-neutral-500">{formProductId ? "تم اختيار منتج" : "لم يتم اختيار منتج"}</p>
              <button type="button" onClick={() => setProductPickerOpen(false)} className="rounded-sm bg-[#B63A6B] px-4 py-2 text-sm text-white hover:brightness-110">تم</button>
            </div>
            <div className="h-[env(safe-area-inset-bottom)] shrink-0 md:hidden" aria-hidden />
          </aside>
        </>
      ) : null}

      <div className="rounded-sm border border-black/10 bg-white">
        <div className="overflow-x-auto overscroll-x-contain">
          <table className="w-full min-w-[32rem] text-sm">
            <thead>
              <tr className="border-b border-black/10 text-right">
                <th className="p-4 font-medium">العميل</th>
                <th className="p-4 font-medium">التقييم</th>
                <th className="p-4 font-medium">المنتج</th>
                <th className="p-4 font-medium">الترتيب</th>
                <th className="p-4 font-medium">الحالة</th>
                <th className="p-4 font-medium">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {list.map((item) => {
                const product = item.productId ? productsById.get(item.productId) : null;
                return (
                  <tr key={item._id} className="border-b border-black/5 bg-white">
                    <td className="p-4 font-medium">{item.author}</td>
                    <td className="p-4 text-neutral-600 truncate max-w-[20rem]">{item.body}</td>
                    <td className="p-4 text-xs text-neutral-500 truncate max-w-[12rem]">{product ? product.name : "—"}</td>
                    <td className="p-4 text-neutral-600">{item.sortOrder}</td>
                    <td className="p-4">
                      <span className={`inline-block px-2 py-0.5 text-xs rounded-full ${item.isActive ? "bg-green-100 text-green-700" : "bg-neutral-100 text-neutral-500"}`}>
                        {item.isActive ? "نشط" : "غير نشط"}
                      </span>
                    </td>
                    <td className="p-4">
                      <button type="button" onClick={() => openEdit(item)} className="text-black underline ms-3">تعديل</button>
                      <button type="button" onClick={() => setDeleteTarget(item)} className="inline-flex items-center gap-1 text-red-600 underline ms-3">
                        <Trash2 className="w-3.5 h-3.5" strokeWidth={1.75} /> حذف
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {list.length === 0 && <p className="p-8 text-neutral-500 text-center">لا توجد تقييمات.</p>}
      </div>

      <ConfirmModal
        open={deleteTarget !== null}
        title="حذف التقييم"
        message={deleteTarget ? `هل أنت متأكد من حذف تقييم "${deleteTarget.author}"؟` : ""}
        confirmLabel="حذف"
        cancelLabel="إلغاء"
        onConfirm={deleteItem}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
