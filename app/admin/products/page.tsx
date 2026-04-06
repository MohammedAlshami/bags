"use client";

import { useEffect, useRef, useState, type ChangeEvent, type DragEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { ImagePlus, MoreVertical, X } from "lucide-react";
import { sans } from "@/lib/page-theme";
import { CATEGORIES } from "@/lib/products";

const API_ERROR_AR: Record<string, string> = {
  Forbidden: "غير مسموح",
  "Failed to load products": "تعذر تحميل المنتجات",
  "Failed to create product": "تعذر إنشاء المنتج",
  "Failed to update product": "تعذر تحديث المنتج",
  "Failed to delete product": "تعذر حذف المنتج",
  "Name, price, category, and image required": "الاسم والسعر والتصنيف والصورة مطلوبة",
  "Slug already taken": "المسار (slug) مستخدم مسبقاً",
  "Collection is required. Create a collection first (e.g. slug: essentials).":
    "يجب اختيار مجموعة. أنشئ مجموعة أولاً (مثلاً slug: essentials).",
  "Upload failed": "فشل رفع الملف",
  "Invalid id": "معرّف غير صالح",
  "Not found": "غير موجود",
};

function arApiError(msg: string) {
  return API_ERROR_AR[msg] ?? msg;
}

type Collection = { _id: string; name: string; slug: string };
type ProductRow = {
  _id: string;
  name: string;
  price: string;
  category: string;
  image: string;
  slug: string;
  collection?: Collection | null;
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ProductRow | null>(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState("");
  const [collectionId, setCollectionId] = useState<string>("general");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [detailProduct, setDetailProduct] = useState<ProductRow | null>(null);
  const [imageDropActive, setImageDropActive] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const imageFileInputRef = useRef<HTMLInputElement>(null);

  const fetchProducts = async () => {
    const res = await fetch("/api/admin/products");
    if (!res.ok) throw new Error("تعذر تحميل المنتجات");
    return res.json();
  };

  const fetchCollections = async () => {
    const res = await fetch("/api/admin/collections");
    if (!res.ok) return [];
    return res.json();
  };

  useEffect(() => {
    Promise.all([fetchProducts(), fetchCollections()])
      .then(([prods, cols]) => {
        setProducts(prods);
        setCollections(cols);
        setError(null);
      })
      .catch((e) => setError(e instanceof Error ? arApiError(e.message) : "خطأ"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!showForm && !detailProduct) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (detailProduct) setDetailProduct(null);
      else setShowForm(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [showForm, detailProduct]);

  useEffect(() => {
    if (menuOpenId == null) return;
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpenId(null);
      }
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [menuOpenId]);

  const openCreate = () => {
    setDetailProduct(null);
    setEditing(null);
    setName("");
    setPrice("");
    setCategory(CATEGORIES[0] ?? "");
    setImage("");
    setCollectionId(collections[0]?._id ?? "general");
    setShowForm(true);
  };

  const openEdit = (p: ProductRow) => {
    setDetailProduct(null);
    setEditing(p);
    setName(p.name);
    setPrice(p.price);
    setCategory(p.category);
    setImage(p.image);
    setCollectionId(p.collection?._id ?? collections[0]?._id ?? "general");
    setShowForm(true);
    setMenuOpenId(null);
  };

  const save = async () => {
    setSaving(true);
    try {
      const url = editing ? `/api/admin/products/${editing._id}` : "/api/admin/products";
      const method = editing ? "PUT" : "POST";
      const payload = {
        name,
        price,
        category,
        image,
        collection: collectionId && collectionId !== "general" ? collectionId : (collections[0]?._id ?? "general"),
      };
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        const raw = typeof d.error === "string" ? d.error : "";
        throw new Error(raw || "تعذر الحفظ");
      }
      setShowForm(false);
      const data = await fetchProducts();
      setProducts(data);
    } catch (e) {
      setError(arApiError(e instanceof Error ? e.message : "خطأ"));
    } finally {
      setSaving(false);
    }
  };

  const uploadImage = async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: form, credentials: "include" });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        const raw = typeof d.error === "string" ? d.error : "";
        throw new Error(raw || "فشل الرفع");
      }
      const { url } = await res.json();
      setImage(url);
    } catch (e) {
      setError(arApiError(e instanceof Error ? e.message : "فشل الرفع"));
    } finally {
      setUploading(false);
    }
  };

  const onImageDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setImageDropActive(false);
    const f = e.dataTransfer.files?.[0];
    if (f) uploadImage(f);
  };

  const onImageFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) uploadImage(f);
    e.target.value = "";
  };

  const remove = async (id: string) => {
    setMenuOpenId(null);
    if (!confirm("حذف هذا المنتج؟")) return;
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        const raw = typeof d.error === "string" ? d.error : "";
        throw new Error(raw || "تعذر الحذف");
      }
      setProducts(await fetchProducts());
    } catch (e) {
      setError(arApiError(e instanceof Error ? e.message : "خطأ"));
    }
  };

  const formFields = (
    <div className="grid gap-4">
      <div>
        <label className="block text-xs text-neutral-500 mb-1">الاسم</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-neutral-200 px-3 py-2 text-sm rounded-sm"
        />
      </div>
      <div>
        <label className="block text-xs text-neutral-500 mb-1">السعر</label>
        <input
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full border border-neutral-200 px-3 py-2 text-sm rounded-sm"
          placeholder="242.00 ر.س"
        />
      </div>
      <div>
        <label className="block text-xs text-neutral-500 mb-1">التصنيف</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full border border-neutral-200 px-3 py-2 text-sm rounded-sm"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs text-neutral-500 mb-1">المجموعة (مطلوبة)</label>
        <select
          value={collectionId}
          onChange={(e) => setCollectionId(e.target.value)}
          className="w-full border border-neutral-200 px-3 py-2 text-sm rounded-sm"
          required
        >
          {collections.length === 0 ? (
            <option value="">أنشئ مجموعة أولاً</option>
          ) : (
            collections.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))
          )}
        </select>
      </div>
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
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!uploading) setImageDropActive(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setImageDropActive(false);
          }}
          onDrop={onImageDrop}
          className={[
            "relative rounded-xl border-2 border-dashed transition-colors min-h-[168px] flex flex-col items-center justify-center text-center px-4 py-6 cursor-pointer select-none",
            uploading ? "border-neutral-200 bg-white opacity-70 pointer-events-none" : "",
            !uploading && imageDropActive ? "border-black bg-white" : "",
            !uploading && !imageDropActive ? "border-neutral-200 bg-white hover:border-neutral-400" : "",
          ].join(" ")}
        >
          {uploading ? (
            <p className="text-sm text-neutral-600" style={sans}>
              جاري الرفع…
            </p>
          ) : image ? (
            <div className="relative w-full max-w-[240px] mx-auto">
              <div className="relative aspect-square w-full rounded-lg overflow-hidden border border-black/10 bg-neutral-100">
                <Image
                  src={image}
                  alt=""
                  fill
                  className="object-contain"
                  sizes="240px"
                  unoptimized={image.startsWith("http") && !/unsplash|ebayimg|cloudinary/.test(image)}
                />
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
                <span className="text-neutral-300" aria-hidden>
                  |
                </span>
                <button
                  type="button"
                  className="text-xs text-red-600 underline hover:text-red-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    setImage("");
                  }}
                >
                  إزالة
                </button>
              </div>
            </div>
          ) : (
            <>
              <ImagePlus className="w-11 h-11 text-neutral-400 mb-3" strokeWidth={1.25} aria-hidden />
              <p className="text-sm font-medium text-neutral-800" style={sans}>
                اسحب الصورة هنا
              </p>
              <p className="text-xs text-neutral-500 mt-1">أو اضغط لاختيار ملف من جهازك</p>
              <p className="text-[11px] text-neutral-400 mt-2">PNG، JPG، WebP</p>
            </>
          )}
        </div>
      </div>
      <div className="flex gap-2 flex-wrap pt-2">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="px-4 py-2 bg-black text-white text-sm rounded-sm disabled:opacity-50"
        >
          {saving ? "جاري الحفظ…" : "حفظ"}
        </button>
        <button
          type="button"
          onClick={() => setShowForm(false)}
          className="px-4 py-2 border border-black text-sm rounded-sm"
        >
          إلغاء
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <p className="text-neutral-500" style={sans} dir="rtl">
        جاري التحميل…
      </p>
    );
  }
  if (error) {
    return (
      <p className="text-red-600" dir="rtl" style={sans}>
        {error}
      </p>
    );
  }

  return (
    <div dir="rtl" style={sans} className="relative">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h2 className="text-xl font-medium text-neutral-900">المنتجات</h2>
        <button
          type="button"
          onClick={openCreate}
          className="px-4 py-2 bg-black text-white text-sm hover:bg-neutral-800 rounded-sm"
        >
          إضافة منتج
        </button>
      </div>

      {showForm && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[60] bg-black/40"
            aria-label="إغلاق"
            onClick={() => setShowForm(false)}
          />
          <aside
            className="
              fixed z-[70] flex flex-col bg-white shadow-2xl
              inset-x-0 bottom-0 max-h-[92vh] rounded-t-2xl border-t border-black/10
              md:inset-x-auto md:right-0 md:top-0 md:bottom-0 md:left-auto md:h-full md:max-h-none md:w-full md:max-w-md md:rounded-none md:border-t-0 md:border-r md:border-black/10
            "
          >
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-black/10 px-4 py-3">
              <h3 className="text-lg font-medium">{editing ? "تعديل منتج" : "منتج جديد"}</h3>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="p-2 rounded-sm hover:opacity-70 text-neutral-600"
                aria-label="إغلاق"
              >
                <X className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4">{formFields}</div>
            <div className="h-[env(safe-area-inset-bottom)] shrink-0 md:hidden" aria-hidden />
          </aside>
        </>
      )}

      {detailProduct && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[60] bg-black/40"
            aria-label="إغلاق"
            onClick={() => setDetailProduct(null)}
          />
          <aside
            className="
              fixed z-[70] flex flex-col bg-white shadow-2xl
              inset-x-0 bottom-0 max-h-[92vh] rounded-t-2xl border-t border-black/10
              md:inset-x-auto md:right-0 md:top-0 md:bottom-0 md:left-auto md:h-full md:max-h-none md:w-full md:max-w-md md:rounded-none md:border-t-0 md:border-r md:border-black/10
            "
          >
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-black/10 px-4 py-3">
              <h3 className="text-lg font-medium">تفاصيل المنتج</h3>
              <button
                type="button"
                onClick={() => setDetailProduct(null)}
                className="p-2 rounded-sm hover:opacity-70 text-neutral-600"
                aria-label="إغلاق"
              >
                <X className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4">
              <div className="relative mx-auto aspect-square w-full max-w-[280px] overflow-hidden rounded-2xl border border-black/10 bg-neutral-100">
                {detailProduct.image ? (
                  <Image
                    src={detailProduct.image}
                    alt={detailProduct.name}
                    fill
                    className="object-contain p-4"
                    sizes="280px"
                    unoptimized={
                      detailProduct.image.startsWith("http") &&
                      !/unsplash|ebayimg|cloudinary/.test(detailProduct.image)
                    }
                  />
                ) : null}
              </div>
              <dl className="mt-6 space-y-4 text-sm">
                <div>
                  <dt className="text-xs text-neutral-500 mb-1">الاسم</dt>
                  <dd className="font-medium text-neutral-900">{detailProduct.name}</dd>
                </div>
                <div>
                  <dt className="text-xs text-neutral-500 mb-1">السعر</dt>
                  <dd className="text-neutral-900">{detailProduct.price}</dd>
                </div>
                <div>
                  <dt className="text-xs text-neutral-500 mb-1">التصنيف</dt>
                  <dd className="text-neutral-900">{detailProduct.category}</dd>
                </div>
                <div>
                  <dt className="text-xs text-neutral-500 mb-1">المجموعة</dt>
                  <dd className="text-neutral-900">
                    {(detailProduct.collection as Collection)?.name ?? "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-neutral-500 mb-1">المسار (slug)</dt>
                  <dd className="font-mono text-xs text-neutral-800 break-all" dir="ltr">
                    {detailProduct.slug}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-neutral-500 mb-1">المعرّف</dt>
                  <dd className="font-mono text-xs text-neutral-800 break-all" dir="ltr">
                    {detailProduct._id}
                  </dd>
                </div>
              </dl>
              <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                <Link
                  href={`/product/${detailProduct.slug}`}
                  className="inline-flex items-center justify-center px-4 py-2 border border-black text-sm rounded-sm hover:bg-neutral-50"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  عرض في المتجر
                </Link>
                <button
                  type="button"
                  onClick={() => openEdit(detailProduct)}
                  className="px-4 py-2 bg-black text-white text-sm rounded-sm hover:bg-neutral-800"
                >
                  تعديل
                </button>
              </div>
            </div>
            <div className="h-[env(safe-area-inset-bottom)] shrink-0 md:hidden" aria-hidden />
          </aside>
        </>
      )}

      {products.length === 0 ? (
        <p className="py-12 text-neutral-500 text-center border border-black/10 rounded-sm bg-white">لا توجد منتجات بعد.</p>
      ) : (
        <ul className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6 list-none p-0 m-0">
          {products.map((p) => (
            <li key={p._id} className="relative">
              <article
                className="group flex h-full flex-col cursor-pointer"
                role="button"
                tabIndex={0}
                onClick={() => {
                  setMenuOpenId(null);
                  setDetailProduct(p);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setMenuOpenId(null);
                    setDetailProduct(p);
                  }
                }}
              >
                <div className="relative aspect-[3/5] w-full overflow-hidden rounded-2xl bg-neutral-100 p-4 sm:p-5 md:p-6 lg:p-7">
                  {p.image && (
                    <Image
                      src={p.image}
                      alt={p.name}
                      fill
                      className="object-contain object-center p-3 transition-transform duration-300 group-hover:scale-[1.03] sm:p-4 md:p-5"
                      sizes="(max-width: 768px) 50vw, 25vw"
                      unoptimized={p.image.startsWith("http") && !/unsplash|ebayimg|cloudinary/.test(p.image)}
                    />
                  )}
                  <div className="absolute top-2 end-2 z-[1] sm:top-3 sm:end-3" ref={menuOpenId === p._id ? menuRef : undefined}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpenId((id) => (id === p._id ? null : p._id));
                      }}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-white/95 border border-black/10 shadow-sm text-neutral-700 hover:bg-white"
                      aria-expanded={menuOpenId === p._id}
                      aria-haspopup="menu"
                      aria-label="إجراءات المنتج"
                    >
                      <MoreVertical className="w-5 h-5" strokeWidth={1.5} />
                    </button>
                    {menuOpenId === p._id && (
                      <div
                        role="menu"
                        className="absolute top-full end-0 mt-1 min-w-[10rem] rounded-sm border border-black/10 bg-white py-1 shadow-lg z-[2]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          role="menuitem"
                          className="block w-full text-right px-3 py-2 text-sm hover:bg-white"
                          onClick={() => openEdit(p)}
                        >
                          تعديل
                        </button>
                        <button
                          type="button"
                          role="menuitem"
                          className="block w-full text-right px-3 py-2 text-sm text-red-600 hover:bg-white"
                          onClick={() => remove(p._id)}
                        >
                          حذف
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-4 flex flex-col gap-1 text-center">
                  <span className="text-xs text-neutral-500">{p.category}</span>
                  <span className="text-sm font-semibold text-neutral-900 line-clamp-2 leading-snug">{p.name}</span>
                  <span className="text-sm text-neutral-900">{p.price}</span>
                  {(p.collection as Collection)?.name ? (
                    <span className="text-xs text-neutral-400">{(p.collection as Collection).name}</span>
                  ) : null}
                </div>
              </article>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
