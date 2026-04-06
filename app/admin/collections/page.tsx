"use client";

import { useEffect, useRef, useState, type ChangeEvent, type DragEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { ImagePlus, MoreVertical, X } from "lucide-react";
import { sans } from "@/lib/page-theme";
import { adminApiErrorAr } from "@/lib/admin-ar";

const API_ERROR_AR: Record<string, string> = {
  Forbidden: "غير مسموح",
  "Failed to load": "تعذر التحميل",
  "Failed to save": "تعذر الحفظ",
  "Name required": "الاسم مطلوب",
  "Slug already taken": "المسار (slug) مستخدم مسبقاً",
  "Upload failed": "فشل رفع الملف",
};

function arApiError(msg: string) {
  return API_ERROR_AR[msg] ?? adminApiErrorAr(msg);
}

type Collection = {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  description?: string;
  story?: string;
  material?: string;
  quality?: string;
  productCount?: number;
};

const SHEET_ASIDE = `
  fixed z-[70] flex flex-col bg-white shadow-2xl
  inset-x-0 bottom-0 max-h-[92vh] rounded-t-2xl border-t border-black/10
  md:inset-x-auto md:right-0 md:top-0 md:bottom-0 md:left-auto md:h-full md:max-h-none md:w-full md:max-w-md md:rounded-none md:border-t-0 md:border-r md:border-black/10
`;

export default function AdminCollectionsPage() {
  const [list, setList] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [bannerError, setBannerError] = useState<string | null>(null);
  const [panelError, setPanelError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Collection | null>(null);
  const [detailCollection, setDetailCollection] = useState<Collection | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [image, setImage] = useState("");
  const [description, setDescription] = useState("");
  const [story, setStory] = useState("");
  const [material, setMaterial] = useState("");
  const [quality, setQuality] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [imageDropActive, setImageDropActive] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const imageFileInputRef = useRef<HTMLInputElement>(null);

  const fetchList = async () => {
    const res = await fetch("/api/admin/collections");
    if (!res.ok) throw new Error("Failed to load");
    return res.json();
  };

  useEffect(() => {
    fetchList()
      .then((data) => {
        setList(data);
        setLoadError(null);
      })
      .catch((e) => setLoadError(arApiError(e instanceof Error ? e.message : "Error")))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!showForm && !detailCollection) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (detailCollection) setDetailCollection(null);
      else setShowForm(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [showForm, detailCollection]);

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
    setDetailCollection(null);
    setEditing(null);
    setName("");
    setSlug("");
    setImage("");
    setDescription("");
    setStory("");
    setMaterial("");
    setQuality("");
    setPanelError(null);
    setShowForm(true);
  };

  const openEdit = (c: Collection) => {
    setDetailCollection(null);
    setEditing(c);
    setName(c.name);
    setSlug(c.slug);
    setImage(c.image ?? "");
    setDescription(c.description ?? "");
    setStory(c.story ?? "");
    setMaterial(c.material ?? "");
    setQuality(c.quality ?? "");
    setPanelError(null);
    setShowForm(true);
    setMenuOpenId(null);
  };

  const save = async () => {
    setSaving(true);
    setPanelError(null);
    try {
      const url = editing ? `/api/admin/collections/${editing._id}` : "/api/admin/collections";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug, image, description, story, material, quality }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        const raw = typeof d.error === "string" ? d.error : "";
        throw new Error(raw || "Failed to save");
      }
      setShowForm(false);
      setList(await fetchList());
    } catch (e) {
      setPanelError(arApiError(e instanceof Error ? e.message : "Error"));
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
        throw new Error(raw || "Upload failed");
      }
      const { url } = await res.json();
      setImage(url);
    } catch (e) {
      setPanelError(arApiError(e instanceof Error ? e.message : "Upload failed"));
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
    if (!confirm("حذف هذه المجموعة؟ تُنقل منتجاتها إلى المجموعة الافتراضية.")) return;
    try {
      const res = await fetch(`/api/admin/collections/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        const raw = typeof d.error === "string" ? d.error : "";
        throw new Error(raw || "Failed to delete");
      }
      setList(await fetchList());
      if (detailCollection?._id === id) setDetailCollection(null);
      setBannerError(null);
    } catch (e) {
      setBannerError(arApiError(e instanceof Error ? e.message : "Error"));
    }
  };

  const formFields = (
    <div className="grid gap-4">
      <div>
        <label className="block text-xs text-neutral-500 mb-1">الاسم</label>
        <input
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (!editing) setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""));
          }}
          className="w-full border border-neutral-200 px-3 py-2 text-sm rounded-sm"
        />
      </div>
      <div>
        <label className="block text-xs text-neutral-500 mb-1">المسار (slug)</label>
        <input
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="w-full border border-neutral-200 px-3 py-2 text-sm rounded-sm"
          dir="ltr"
        />
      </div>
      <div>
        <label className="block text-xs text-neutral-500 mb-1">صورة الغلاف</label>
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
              <p className="text-xs text-neutral-500 mt-1">أو اضغط لاختيار ملف</p>
            </>
          )}
        </div>
      </div>
      <div>
        <label className="block text-xs text-neutral-500 mb-1">وصف قصير (البطاقة / الهيرو)</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border border-neutral-200 px-3 py-2 text-sm rounded-sm"
          rows={2}
        />
      </div>
      <div>
        <label className="block text-xs text-neutral-500 mb-1">قسم القصة</label>
        <textarea
          value={story}
          onChange={(e) => setStory(e.target.value)}
          className="w-full border border-neutral-200 px-3 py-2 text-sm rounded-sm"
          rows={4}
          placeholder="قصة المجموعة…"
        />
      </div>
      <div>
        <label className="block text-xs text-neutral-500 mb-1">قسم المواد</label>
        <textarea
          value={material}
          onChange={(e) => setMaterial(e.target.value)}
          className="w-full border border-neutral-200 px-3 py-2 text-sm rounded-sm"
          rows={4}
          placeholder="المواد والمكوّنات…"
        />
      </div>
      <div>
        <label className="block text-xs text-neutral-500 mb-1">قسم الجودة</label>
        <textarea
          value={quality}
          onChange={(e) => setQuality(e.target.value)}
          className="w-full border border-neutral-200 px-3 py-2 text-sm rounded-sm"
          rows={4}
          placeholder="الجودة والعناية…"
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
          onClick={save}
          disabled={saving}
          className="px-4 py-2 bg-black text-white text-sm rounded-sm disabled:opacity-50"
        >
          {saving ? "جاري الحفظ…" : "حفظ"}
        </button>
        <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-black text-sm rounded-sm">
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
  if (loadError) {
    return (
      <p className="text-red-600" style={sans} dir="rtl">
        {loadError}
      </p>
    );
  }

  return (
    <div dir="rtl" style={sans} className="relative">
      {bannerError ? (
        <p className="mb-4 text-sm text-red-600" role="alert">
          {bannerError}
        </p>
      ) : null}

      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h2 className="text-xl font-medium text-neutral-900">المجموعات</h2>
        <button
          type="button"
          onClick={openCreate}
          className="px-4 py-2 bg-black text-white text-sm hover:bg-neutral-800 rounded-sm"
        >
          إضافة مجموعة
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
          <aside className={SHEET_ASIDE}>
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-black/10 px-4 py-3">
              <h3 className="text-lg font-medium">{editing ? "تعديل مجموعة" : "مجموعة جديدة"}</h3>
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

      {detailCollection && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[60] bg-black/40"
            aria-label="إغلاق"
            onClick={() => setDetailCollection(null)}
          />
          <aside className={SHEET_ASIDE}>
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-black/10 px-4 py-3">
              <h3 className="text-lg font-medium">تفاصيل المجموعة</h3>
              <button
                type="button"
                onClick={() => setDetailCollection(null)}
                className="p-2 rounded-sm hover:opacity-70 text-neutral-600"
                aria-label="إغلاق"
              >
                <X className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4">
              <div className="relative mx-auto aspect-[3/5] w-full max-w-[280px] overflow-hidden rounded-2xl border border-black/10 bg-neutral-100">
                {detailCollection.image ? (
                  <Image
                    src={detailCollection.image}
                    alt={detailCollection.name}
                    fill
                    className="object-contain p-4"
                    sizes="280px"
                    unoptimized={
                      detailCollection.image.startsWith("http") &&
                      !/unsplash|ebayimg|cloudinary/.test(detailCollection.image)
                    }
                  />
                ) : null}
              </div>
              <dl className="mt-6 space-y-4 text-sm">
                <div>
                  <dt className="text-xs text-neutral-500 mb-1">الاسم</dt>
                  <dd className="font-medium text-neutral-900">{detailCollection.name}</dd>
                </div>
                <div>
                  <dt className="text-xs text-neutral-500 mb-1">المسار (slug)</dt>
                  <dd className="font-mono text-xs text-neutral-800 break-all" dir="ltr">
                    {detailCollection.slug}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-neutral-500 mb-1">عدد المنتجات</dt>
                  <dd className="text-neutral-900">{detailCollection.productCount ?? 0}</dd>
                </div>
                <div>
                  <dt className="text-xs text-neutral-500 mb-1">الوصف</dt>
                  <dd className="text-neutral-900 whitespace-pre-wrap">{detailCollection.description || "—"}</dd>
                </div>
              </dl>
              <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                <Link
                  href={`/collections/${detailCollection.slug}`}
                  className="inline-flex items-center justify-center px-4 py-2 border border-black text-sm rounded-sm hover:bg-neutral-50"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  عرض في المتجر
                </Link>
                <Link
                  href={`/admin/collections/${detailCollection._id}`}
                  className="inline-flex items-center justify-center px-4 py-2 border border-black text-sm rounded-sm hover:bg-neutral-50"
                >
                  إدارة المنتجات
                </Link>
                <button
                  type="button"
                  onClick={() => openEdit(detailCollection)}
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

      {list.length === 0 ? (
        <p className="py-12 text-neutral-500 text-center border border-black/10 rounded-sm bg-white">
          لا توجد مجموعات. أضف مجموعة أو استخدم الافتراضية للمنتجات.
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6 list-none p-0 m-0">
          {list.map((c) => (
            <li key={c._id} className="relative">
              <article
                className="group flex h-full flex-col cursor-pointer"
                role="button"
                tabIndex={0}
                onClick={() => {
                  setMenuOpenId(null);
                  setDetailCollection(c);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setMenuOpenId(null);
                    setDetailCollection(c);
                  }
                }}
              >
                <div className="relative aspect-[3/5] w-full overflow-hidden rounded-2xl bg-neutral-100 p-4 sm:p-5 md:p-6 lg:p-7">
                  {c.image && (
                    <Image
                      src={c.image}
                      alt={c.name}
                      fill
                      className="object-contain object-center p-3 transition-transform duration-300 group-hover:scale-[1.03] sm:p-4 md:p-5"
                      sizes="(max-width: 768px) 50vw, 25vw"
                      unoptimized={c.image.startsWith("http") && !/unsplash|ebayimg|cloudinary/.test(c.image)}
                    />
                  )}
                  <div
                    className="absolute top-2 end-2 z-[1] sm:top-3 sm:end-3"
                    ref={menuOpenId === c._id ? menuRef : undefined}
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpenId((id) => (id === c._id ? null : c._id));
                      }}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-white/95 border border-black/10 shadow-sm text-neutral-700 hover:bg-white"
                      aria-expanded={menuOpenId === c._id}
                      aria-haspopup="menu"
                      aria-label="إجراءات المجموعة"
                    >
                      <MoreVertical className="w-5 h-5" strokeWidth={1.5} />
                    </button>
                    {menuOpenId === c._id && (
                      <div
                        role="menu"
                        className="absolute top-full end-0 mt-1 min-w-[11rem] rounded-sm border border-black/10 bg-white py-1 shadow-lg z-[2]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Link
                          href={`/admin/collections/${c._id}`}
                          role="menuitem"
                          className="block w-full text-right px-3 py-2 text-sm hover:bg-neutral-50"
                          onClick={() => setMenuOpenId(null)}
                        >
                          عرض وإضافة منتجات
                        </Link>
                        <button
                          type="button"
                          role="menuitem"
                          className="block w-full text-right px-3 py-2 text-sm hover:bg-neutral-50"
                          onClick={() => openEdit(c)}
                        >
                          تعديل
                        </button>
                        <button
                          type="button"
                          role="menuitem"
                          className="block w-full text-right px-3 py-2 text-sm text-red-600 hover:bg-neutral-50"
                          onClick={() => remove(c._id)}
                        >
                          حذف
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-4 flex flex-col gap-1 text-center">
                  <span className="text-xs text-neutral-500 font-mono" dir="ltr">
                    {c.slug}
                  </span>
                  <span className="text-sm font-semibold text-neutral-900 line-clamp-2 leading-snug">{c.name}</span>
                  <span className="text-xs text-neutral-500 line-clamp-2">{c.description || "—"}</span>
                  <span className="text-xs text-neutral-400">منتجات: {c.productCount ?? 0}</span>
                </div>
              </article>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
