"use client";

import { useRef, useEffect, useMemo, useState, type ChangeEvent } from "react";
import { ImagePlus, MoreVertical, PackagePlus, X } from "lucide-react";

import { ConfirmModal } from "@/app/components/ConfirmModal";
import { SafeImage } from "@/app/components/SafeImage";
import { adminIconClassName, sans } from "@/lib/page-theme";
import { parseStoredPriceToInputValue } from "@/lib/format-sar";
import { formatDualDiscountPrice } from "@/lib/price-format";

type ProductRow = {
  _id: string;
  name: string;
  price: string;
  image: string;
};

type PackageRow = {
  _id: string;
  name: string;
  description: string;
  image: string;
  productIds: string[];
  price: string;
  oldRiyal?: number | null;
  beforeDiscountPrice?: string | null;
  beforeDiscountOldRiyal?: number | null;
};

const API_ERROR_AR: Record<string, string> = {
  Forbidden: "غير مسموح",
  "Failed to fetch packages": "تعذر تحميل الباقات",
  "Failed to create package": "تعذر إنشاء الباقة",
  "Failed to update package": "تعذر تحديث الباقة",
  "Failed to delete package": "تعذر حذف الباقة",
  "Name, price, and products required": "الاسم والسعر والمنتجات مطلوبة",
  "Some products were not found": "بعض المنتجات غير موجودة",
  "Invalid id": "معرّف غير صالح",
  "Not found": "غير موجود",
};

function arApiError(msg: string) {
  return API_ERROR_AR[msg] ?? msg;
}

export default function AdminPackagesPage() {
  const [packages, setPackages] = useState<PackageRow[]>([]);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<PackageRow | null>(null);
  const [detailPackage, setDetailPackage] = useState<PackageRow | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [price, setPrice] = useState("");
  const [oldRiyal, setOldRiyal] = useState("");
  const [beforeDiscountPrice, setBeforeDiscountPrice] = useState("");
  const [beforeDiscountOldRiyal, setBeforeDiscountOldRiyal] = useState("");
  const [productIds, setProductIds] = useState<string[]>([]);
  const [productPickerOpen, setProductPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const imageFileInputRef = useRef<HTMLInputElement>(null);

  const productsById = useMemo(() => new Map(products.map((product) => [product._id, product])), [products]);

  const loadData = async () => {
    const [packagesRes, productsRes] = await Promise.all([
      fetch("/api/admin/packages"),
      fetch("/api/admin/products?all=1"),
    ]);
    const packagesJson = (await packagesRes.json().catch(() => ({}))) as { error?: string } | PackageRow[];
    const productsJson = await productsRes.json().catch(() => ({}));
    if (!packagesRes.ok) {
      const raw = !Array.isArray(packagesJson) && typeof packagesJson.error === "string" ? packagesJson.error : "";
      throw new Error(raw || "Failed to fetch packages");
    }
    if (!productsRes.ok || !Array.isArray(productsJson)) {
      throw new Error("Failed to fetch products");
    }
    setPackages(Array.isArray(packagesJson) ? (packagesJson as PackageRow[]) : []);
    setProducts(productsJson as ProductRow[]);
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    loadData()
      .then(() => {
        if (!cancelled) setError(null);
      })
      .catch((e) => {
        if (!cancelled) setError(arApiError(e instanceof Error ? e.message : "خطأ"));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!showForm && !productPickerOpen && !detailPackage) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (productPickerOpen) setProductPickerOpen(false);
      else if (detailPackage) setDetailPackage(null);
      else setShowForm(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [showForm, productPickerOpen, detailPackage]);

  const openCreate = () => {
    setDetailPackage(null);
    setEditing(null);
    setName("");
    setDescription("");
    setImage("");
    setPrice("");
    setOldRiyal("");
    setBeforeDiscountPrice("");
    setBeforeDiscountOldRiyal("");
    setProductIds([]);
    setProductPickerOpen(false);
    setShowForm(true);
    setMenuOpenId(null);
  };

  const openEdit = (row: PackageRow) => {
    setDetailPackage(null);
    setEditing(row);
    setName(row.name);
    setDescription(row.description);
    setImage(row.image);
    setPrice(parseStoredPriceToInputValue(row.price));
    setOldRiyal(row.oldRiyal == null ? "" : String(row.oldRiyal));
    setBeforeDiscountPrice(row.beforeDiscountPrice ? parseStoredPriceToInputValue(row.beforeDiscountPrice) : "");
    setBeforeDiscountOldRiyal(row.beforeDiscountOldRiyal == null ? "" : String(row.beforeDiscountOldRiyal));
    setProductIds(row.productIds);
    setProductPickerOpen(false);
    setShowForm(true);
    setMenuOpenId(null);
  };

  const toggleProduct = (id: string) => {
    setProductIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  };

  const selectedProducts = productIds.map((id) => productsById.get(id)).filter(Boolean) as ProductRow[];

  const uploadImage = async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: form, credentials: "include" });
      const data = (await res.json().catch(() => ({}))) as { error?: string; url?: string };
      if (!res.ok || !data.url) throw new Error(data.error || "Upload failed");
      setImage(data.url);
    } catch (e) {
      setError(arApiError(e instanceof Error ? e.message : "فشل الرفع"));
    } finally {
      setUploading(false);
    }
  };

  const onImageFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void uploadImage(file);
    e.target.value = "";
  };

  const save = async () => {
    setSaving(true);
    try {
      if (!name.trim() || !price.trim() || productIds.length === 0) {
        setError("الاسم والسعر والمنتجات مطلوبة.");
        return;
      }
      const priceValue = Number(price);
      if (!Number.isFinite(priceValue) || priceValue < 0) {
        setError("أدخل سعراً صالحاً بالريال السعودي.");
        return;
      }
      const oldRiyalValue = oldRiyal.trim() ? Number(oldRiyal) : null;
      const beforeDiscountPriceValue = beforeDiscountPrice.trim() ? Number(beforeDiscountPrice) : null;
      const beforeDiscountOldRiyalValue = beforeDiscountOldRiyal.trim() ? Number(beforeDiscountOldRiyal) : null;
      if (oldRiyalValue !== null && (!Number.isFinite(oldRiyalValue) || oldRiyalValue < 0)) {
        setError("أدخل سعراً صالحاً بالريال اليمني القديم.");
        return;
      }
      const url = editing ? `/api/admin/packages/${editing._id}` : "/api/admin/packages";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          image,
          price: priceValue,
          oldRiyal: oldRiyalValue,
          beforeDiscountPrice: beforeDiscountPriceValue,
          beforeDiscountOldRiyal: beforeDiscountOldRiyalValue,
          productIds,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        const raw = typeof data.error === "string" ? data.error : "";
        throw new Error(raw || "تعذر الحفظ");
      }
      await loadData();
      setShowForm(false);
      setError(null);
    } catch (e) {
      setError(arApiError(e instanceof Error ? e.message : "خطأ"));
    } finally {
      setSaving(false);
    }
  };

  const performRemove = async () => {
    if (!deleteConfirmId) return;
    setDeleteBusy(true);
    try {
      const res = await fetch(`/api/admin/packages/${deleteConfirmId}`, { method: "DELETE" });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        const raw = typeof data.error === "string" ? data.error : "";
        throw new Error(raw || "تعذر الحذف");
      }
      await loadData();
      setDeleteConfirmId(null);
      setError(null);
    } catch (e) {
      setError(arApiError(e instanceof Error ? e.message : "خطأ"));
    } finally {
      setDeleteBusy(false);
    }
  };

  if (loading) {
    return <p className="py-12 text-center text-neutral-500">جاري تحميل الباقات...</p>;
  }

  return (
    <div dir="rtl" style={sans} className="relative">
      {error ? (
        <p className="mb-4 text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-medium text-neutral-900">الباقات</h2>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-1.5 rounded-sm bg-[#B63A6B] px-4 py-2 text-sm text-white transition-[filter] hover:brightness-110"
        >
          <PackagePlus className={`h-4 w-4 shrink-0 ${adminIconClassName}`} strokeWidth={1.75} aria-hidden />
          إضافة باقة
        </button>
      </div>

      {packages.length === 0 ? (
        <p className="rounded-sm border border-black/10 bg-white py-12 text-center text-neutral-500">لا توجد باقات بعد.</p>
      ) : (
        <ul className="m-0 grid list-none gap-5 p-0 md:grid-cols-3 lg:grid-cols-4">
          {packages.map((item) => {
            const packageProducts = item.productIds.map((id) => productsById.get(id)).filter(Boolean) as ProductRow[];
            return (
              <li
                key={item._id}
                className="group relative cursor-pointer"
                role="button"
                tabIndex={0}
                onClick={() => {
                  setMenuOpenId(null);
                  setDetailPackage(item);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setMenuOpenId(null);
                    setDetailPackage(item);
                  }
                }}
              >
                <div className="relative aspect-[3/5] overflow-hidden rounded-2xl bg-gradient-to-br from-brand-light/60 to-neutral-100">
                  {item.image ? (
                    <SafeImage src={item.image} alt={item.name} fill className="object-cover object-center transition-transform duration-300 group-hover:scale-[1.03]" sizes="(max-width: 1024px) 50vw, 33vw" />
                  ) : packageProducts[0]?.image ? (
                    <SafeImage src={packageProducts[0].image} alt={item.name} fill className="object-cover object-center transition-transform duration-300 group-hover:scale-[1.03]" sizes="(max-width: 1024px) 50vw, 33vw" />
                  ) : null}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent px-3 pb-3 pt-12" aria-hidden />
                  {packageProducts.length > 0 ? (
                    <div className="absolute inset-x-0 bottom-3 overflow-x-auto px-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                      <div className="flex w-max gap-2">
                        {packageProducts.map((product) => (
                          <div key={product._id} className="flex w-44 shrink-0 items-center gap-2 rounded-xl bg-white/95 p-2 text-right shadow-sm ring-1 ring-white/70 backdrop-blur">
                            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                              {product.image ? (
                                <SafeImage src={product.image} alt={product.name} fill className="object-cover object-center" sizes="48px" />
                              ) : null}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-[11px] font-semibold leading-4 text-neutral-900">{product.name}</p>
                              <p className="mt-0.5 truncate text-[10px] font-medium text-brand-primary">{product.price}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
                <div className="absolute left-3 top-3 z-[1]">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpenId((id) => (id === item._id ? null : item._id));
                    }}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-black/10 bg-white text-neutral-700 shadow-sm hover:border-black/20"
                    aria-expanded={menuOpenId === item._id}
                    aria-haspopup="menu"
                    aria-label="إجراءات الباقة"
                  >
                    <MoreVertical className={`h-5 w-5 ${adminIconClassName}`} strokeWidth={1.5} />
                  </button>
                  {menuOpenId === item._id ? (
                    <div role="menu" className="absolute left-0 top-full z-10 mt-1 min-w-32 rounded-sm border border-black/10 bg-white py-1 shadow-lg" onClick={(e) => e.stopPropagation()}>
                      <button type="button" role="menuitem" className="block w-full px-3 py-2 text-right text-sm hover:bg-neutral-50" onClick={() => openEdit(item)}>
                        تعديل
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        className="block w-full px-3 py-2 text-right text-sm text-red-600 hover:bg-red-50"
                        onClick={() => {
                          setMenuOpenId(null);
                          setDeleteConfirmId(item._id);
                        }}
                      >
                        حذف
                      </button>
                    </div>
                  ) : null}
                </div>
                <div className="mt-4 text-center">
                  <p className="text-xs text-neutral-500">
                    {formatDualDiscountPrice({
                      price: item.price,
                      oldRiyal: item.oldRiyal,
                      beforeDiscountPrice: item.beforeDiscountPrice,
                      beforeDiscountOldRiyal: item.beforeDiscountOldRiyal,
                    }).current}
                  </p>
                  <h3 className="mt-1 line-clamp-2 text-sm font-semibold leading-snug text-neutral-900">{item.name}</h3>
                  <p className="mt-2 line-clamp-2 text-xs leading-5 text-neutral-500">{item.description || "بدون وصف"}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {showForm ? (
        <>
          <button type="button" className="fixed inset-0 z-[60] cursor-pointer bg-black/40" aria-label="إغلاق" onClick={() => setShowForm(false)} />
          <aside className="fixed inset-x-0 bottom-0 z-[70] flex max-h-[92vh] flex-col rounded-t-2xl border-t border-black/10 bg-white shadow-2xl md:inset-x-auto md:bottom-0 md:left-0 md:top-0 md:h-full md:max-h-none md:w-full md:max-w-md md:rounded-none md:border-l md:border-t-0">
            <div className="flex shrink-0 items-center justify-between gap-3 px-4 py-3">
              <h3 className="text-lg font-medium">{editing ? "تعديل باقة" : "باقة جديدة"}</h3>
              <button type="button" onClick={() => setShowForm(false)} className="rounded-sm p-2 text-neutral-600 hover:opacity-70" aria-label="إغلاق">
                <X className={`h-5 w-5 ${adminIconClassName}`} strokeWidth={1.5} />
              </button>
            </div>
            <div className="flex-1 space-y-5 overflow-y-auto overscroll-contain px-4 py-4">
              <div>
                <label className="mb-1 block text-xs text-neutral-500">اسم الباقة</label>
                <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-sm border border-neutral-200 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-neutral-500">الوصف</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-24 w-full rounded-sm border border-neutral-200 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-neutral-500">صورة الباقة</label>
                <input
                  ref={imageFileInputRef}
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  disabled={uploading}
                  onChange={onImageFileChange}
                />
                <button
                  type="button"
                  onClick={() => imageFileInputRef.current?.click()}
                  disabled={uploading}
                  className="relative flex min-h-44 w-full items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-neutral-200 bg-neutral-50 text-center transition-colors hover:border-neutral-400 disabled:opacity-60"
                >
                  {image ? (
                    <>
                      <SafeImage src={image} alt="" fill className="object-cover object-center" sizes="420px" />
                      <span className="absolute inset-0 bg-black/30" aria-hidden />
                      <span className="relative rounded-full bg-white/95 px-4 py-2 text-xs font-semibold text-neutral-900">
                        تغيير الصورة
                      </span>
                    </>
                  ) : (
                    <span className="flex flex-col items-center gap-2 text-neutral-600">
                      <ImagePlus className={`h-9 w-9 ${adminIconClassName}`} strokeWidth={1.25} aria-hidden />
                      <span className="text-sm font-medium">{uploading ? "جاري الرفع..." : "اضغط لإضافة صورة للباقة"}</span>
                      <span className="text-xs text-neutral-400">PNG، JPG، WebP</span>
                    </span>
                  )}
                </button>
                {image ? (
                  <button type="button" onClick={() => setImage("")} className="mt-2 text-xs text-red-600 hover:text-red-700">
                    إزالة الصورة
                  </button>
                ) : null}
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs text-neutral-500">سعر الباقة بالريال السعودي</label>
                  <input type="number" inputMode="decimal" min={0} step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full rounded-sm border border-neutral-200 px-3 py-2 text-sm" dir="ltr" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-neutral-500">سعر الباقة بالريال اليمني القديم</label>
                  <input type="number" inputMode="decimal" min={0} step="1" value={oldRiyal} onChange={(e) => setOldRiyal(e.target.value)} className="w-full rounded-sm border border-neutral-200 px-3 py-2 text-sm" dir="ltr" />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs text-neutral-500">قبل الخصم - ريال سعودي</label>
                  <input type="number" inputMode="decimal" min={0} step="0.01" value={beforeDiscountPrice} onChange={(e) => setBeforeDiscountPrice(e.target.value)} className="w-full rounded-sm border border-neutral-200 px-3 py-2 text-sm" dir="ltr" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-neutral-500">قبل الخصم - العملة القديمة</label>
                  <input type="number" inputMode="decimal" min={0} step="1" value={beforeDiscountOldRiyal} onChange={(e) => setBeforeDiscountOldRiyal(e.target.value)} className="w-full rounded-sm border border-neutral-200 px-3 py-2 text-sm" dir="ltr" />
                </div>
              </div>
              <section>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-semibold text-neutral-900">منتجات الباقة</h4>
                    <p className="mt-1 text-xs text-neutral-500">أضف المنتجات من لوحة الاختيار المصورة.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setProductPickerOpen(true)}
                    className="shrink-0 rounded-full border border-[#B63A6B] px-4 py-2 text-xs font-semibold text-[#B63A6B] hover:bg-[#B63A6B] hover:text-white"
                  >
                    + إضافة منتجات
                  </button>
                </div>

                {selectedProducts.length === 0 ? (
                  <p className="mt-3 rounded-xl border border-dashed border-neutral-200 bg-neutral-50 px-4 py-6 text-center text-sm text-neutral-500">
                    لم يتم اختيار منتجات بعد.
                  </p>
                ) : (
                  <div className="mt-3 grid gap-2">
                    {selectedProducts.map((product) => (
                      <div key={product._id} className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-2">
                        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                          {product.image ? (
                            <SafeImage src={product.image} alt={product.name} fill className="object-cover object-center" sizes="56px" />
                          ) : null}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-neutral-900">{product.name}</p>
                          <p className="mt-0.5 text-xs text-neutral-500">{product.price}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleProduct(product._id)}
                          className="rounded-full px-3 py-1 text-xs text-red-600 hover:bg-red-50"
                        >
                          إزالة
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>
              <div className="flex flex-wrap gap-2 pt-2">
                <button type="button" onClick={save} disabled={saving} className="rounded-sm bg-[#B63A6B] px-4 py-2 text-sm text-white transition-[filter] hover:brightness-110 disabled:opacity-50">
                  {saving ? "جاري الحفظ..." : "حفظ"}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="rounded-sm border border-black px-4 py-2 text-sm">
                  إلغاء
                </button>
              </div>
            </div>
            <div className="h-[env(safe-area-inset-bottom)] shrink-0 md:hidden" aria-hidden />
          </aside>
        </>
      ) : null}

      {detailPackage ? (
        <>
          <button type="button" className="fixed inset-0 z-[60] cursor-pointer bg-black/40" aria-label="إغلاق" onClick={() => setDetailPackage(null)} />
          <aside className="fixed inset-x-0 bottom-0 z-[70] flex max-h-[92vh] flex-col rounded-t-2xl border-t border-black/10 bg-white shadow-2xl md:inset-x-auto md:bottom-0 md:left-0 md:top-0 md:h-full md:max-h-none md:w-full md:max-w-md md:rounded-none md:border-l md:border-t-0">
            <div className="flex shrink-0 items-center justify-between gap-3 px-4 py-3">
              <h3 className="text-lg font-medium">تفاصيل الباقة</h3>
              <button type="button" onClick={() => setDetailPackage(null)} className="rounded-sm p-2 text-neutral-600 hover:opacity-70" aria-label="إغلاق">
                <X className={`h-5 w-5 ${adminIconClassName}`} strokeWidth={1.5} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4">
              {(() => {
                const packageProducts = detailPackage.productIds.map((id) => productsById.get(id)).filter(Boolean) as ProductRow[];
                const heroImage = detailPackage.image || packageProducts[0]?.image || "";
                return (
                  <>
                    <div className="relative mx-auto aspect-[4/3] w-full max-w-[360px] overflow-hidden rounded-2xl bg-neutral-100">
                      {heroImage ? (
                        <SafeImage src={heroImage} alt={detailPackage.name} fill className="object-cover object-center" sizes="360px" />
                      ) : null}
                    </div>
                    <dl className="mt-6 space-y-4 text-sm">
                      <div>
                        <dt className="mb-1 text-xs text-neutral-500">الاسم</dt>
                        <dd className="font-semibold text-neutral-900">{detailPackage.name}</dd>
                      </div>
                      <div>
                        <dt className="mb-1 text-xs text-neutral-500">السعر</dt>
                        <dd className="text-neutral-900">
                          {formatDualDiscountPrice({
                            price: detailPackage.price,
                            oldRiyal: detailPackage.oldRiyal,
                            beforeDiscountPrice: detailPackage.beforeDiscountPrice,
                            beforeDiscountOldRiyal: detailPackage.beforeDiscountOldRiyal,
                          }).current}
                        </dd>
                      </div>
                      <div>
                        <dt className="mb-1 text-xs text-neutral-500">الوصف</dt>
                        <dd className="whitespace-pre-wrap leading-6 text-neutral-900">{detailPackage.description || "بدون وصف"}</dd>
                      </div>
                      <div>
                        <dt className="mb-2 text-xs text-neutral-500">منتجات الباقة</dt>
                        <dd className="grid gap-2">
                          {packageProducts.length > 0 ? (
                            packageProducts.map((product) => (
                              <div key={product._id} className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-2">
                                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                                  {product.image ? (
                                    <SafeImage src={product.image} alt={product.name} fill className="object-cover object-center" sizes="56px" />
                                  ) : null}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-sm font-medium text-neutral-900">{product.name}</p>
                                  <p className="mt-0.5 text-xs text-neutral-500">{product.price}</p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <span className="text-xs text-neutral-400">لا توجد منتجات مرتبطة</span>
                          )}
                        </dd>
                      </div>
                    </dl>
                    <div className="mt-6 flex flex-wrap gap-2">
                      <button type="button" onClick={() => openEdit(detailPackage)} className="rounded-sm bg-[#B63A6B] px-4 py-2 text-sm text-white hover:brightness-110">
                        تعديل
                      </button>
                    </div>
                  </>
                );
              })()}
            </div>
            <div className="h-[env(safe-area-inset-bottom)] shrink-0 md:hidden" aria-hidden />
          </aside>
        </>
      ) : null}

      {productPickerOpen ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[80] cursor-pointer bg-black/40"
            aria-label="إغلاق اختيار المنتجات"
            onClick={() => setProductPickerOpen(false)}
          />
          <aside className="fixed inset-x-0 bottom-0 z-[90] flex max-h-[92vh] flex-col rounded-t-2xl border-t border-black/10 bg-white shadow-2xl md:inset-x-auto md:bottom-0 md:left-0 md:top-0 md:h-full md:max-h-none md:w-full md:max-w-3xl md:rounded-none md:border-l md:border-t-0">
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-black/5 px-4 py-3">
              <div>
                <h3 className="text-lg font-medium">اختيار منتجات الباقة</h3>
                <p className="mt-1 text-xs text-neutral-500">اختر من كروت المنتجات كما تظهر في لوحة المنتجات.</p>
              </div>
              <button
                type="button"
                onClick={() => setProductPickerOpen(false)}
                className="rounded-sm p-2 text-neutral-600 hover:opacity-70"
                aria-label="إغلاق"
              >
                <X className={`h-5 w-5 ${adminIconClassName}`} strokeWidth={1.5} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4">
              <ul className="m-0 grid list-none grid-cols-2 gap-4 p-0 md:grid-cols-3">
                {products.map((product) => {
                  const selected = productIds.includes(product._id);
                  return (
                    <li key={product._id}>
                      <button
                        type="button"
                        onClick={() => toggleProduct(product._id)}
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
                            <SafeImage
                              src={product.image}
                              alt={product.name}
                              fill
                              className="object-cover object-center transition-transform duration-300 group-hover:scale-[1.03]"
                              sizes="(max-width: 768px) 50vw, 33vw"
                            />
                          ) : null}
                          <span
                            className={[
                              "absolute end-3 top-3 rounded-full px-3 py-1 text-xs font-semibold shadow-sm",
                              selected ? "bg-[#B63A6B] text-white" : "bg-white/95 text-neutral-700",
                            ].join(" ")}
                          >
                            {selected ? "مختار" : "اختيار"}
                          </span>
                        </span>
                        <span className="mt-3 line-clamp-2 text-sm font-semibold leading-snug">{product.name}</span>
                        <span className="mt-1 text-sm text-neutral-600">{product.price}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div className="flex shrink-0 items-center justify-between gap-3 border-t border-black/5 px-4 py-3">
              <p className="text-xs text-neutral-500">تم اختيار {productIds.length} منتج</p>
              <button
                type="button"
                onClick={() => setProductPickerOpen(false)}
                className="rounded-sm bg-[#B63A6B] px-4 py-2 text-sm text-white hover:brightness-110"
              >
                تم
              </button>
            </div>
            <div className="h-[env(safe-area-inset-bottom)] shrink-0 md:hidden" aria-hidden />
          </aside>
        </>
      ) : null}

      <ConfirmModal
        open={deleteConfirmId !== null}
        title="حذف الباقة"
        message="هل أنت متأكد من حذف هذه الباقة؟ لا يمكن التراجع عن هذا الإجراء."
        confirmLabel="حذف"
        cancelLabel="إلغاء"
        onConfirm={() => {
          void performRemove();
        }}
        onCancel={() => {
          if (!deleteBusy) setDeleteConfirmId(null);
        }}
        busy={deleteBusy}
      />
    </div>
  );
}
