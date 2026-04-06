"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { sans } from "@/lib/page-theme";
import { adminApiErrorAr } from "@/lib/admin-ar";

type Collection = {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  description?: string;
  story?: string;
  material?: string;
  quality?: string;
};

export default function AdminCollectionsPage() {
  const [list, setList] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Collection | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [image, setImage] = useState("");
  const [description, setDescription] = useState("");
  const [story, setStory] = useState("");
  const [material, setMaterial] = useState("");
  const [quality, setQuality] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchList = async () => {
    try {
      const res = await fetch("/api/admin/collections");
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setList(data);
      setError(null);
    } catch (e) {
      setError(adminApiErrorAr(e instanceof Error ? e.message : "Error"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setName("");
    setSlug("");
    setImage("");
    setDescription("");
    setStory("");
    setMaterial("");
    setQuality("");
    setShowForm(true);
  };

  const openEdit = (c: Collection) => {
    setEditing(c);
    setName(c.name);
    setSlug(c.slug);
    setImage(c.image ?? "");
    setDescription(c.description ?? "");
    setStory(c.story ?? "");
    setMaterial(c.material ?? "");
    setQuality(c.quality ?? "");
    setShowForm(true);
  };

  const save = async () => {
    setSaving(true);
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
      fetchList();
    } catch (e) {
      setError(adminApiErrorAr(e instanceof Error ? e.message : "Error"));
    } finally {
      setSaving(false);
    }
  };

  const uploadImage = async (file: File) => {
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
      setError(adminApiErrorAr(e instanceof Error ? e.message : "Upload failed"));
    } finally {
      setUploading(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("حذف هذه المجموعة؟ تُنقل منتجاتها إلى المجموعة الافتراضية.")) return;
    try {
      const res = await fetch(`/api/admin/collections/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        const raw = typeof d.error === "string" ? d.error : "";
        throw new Error(raw || "Failed to delete");
      }
      fetchList();
    } catch (e) {
      setError(adminApiErrorAr(e instanceof Error ? e.message : "Error"));
    }
  };

  if (loading) {
    return (
      <p className="text-neutral-500" style={sans} dir="rtl">
        جاري التحميل…
      </p>
    );
  }
  if (error) {
    return (
      <p className="text-red-600" style={sans} dir="rtl">
        {error}
      </p>
    );
  }

  return (
    <div dir="rtl" style={sans}>
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h2 className="text-xl font-medium text-neutral-900">المجموعات</h2>
        <button
          type="button"
          onClick={openCreate}
          className="px-4 py-2 bg-black text-white text-sm hover:bg-neutral-800"
        >
          إضافة مجموعة
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-black/10 rounded-sm p-6 mb-8">
          <h3 className="text-lg font-medium mb-4">{editing ? "تعديل مجموعة" : "مجموعة جديدة"}</h3>
          <div className="grid gap-4 max-w-md">
            <div>
              <label className="block text-xs text-neutral-500 mb-1">الاسم</label>
              <input
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!editing) setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""));
                }}
                className="w-full border border-neutral-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">المسار (slug)</label>
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full border border-neutral-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">صورة الغلاف</label>
              <div className="flex gap-2 items-center flex-wrap">
                <input
                  type="file"
                  accept="image/*"
                  className="text-sm"
                  disabled={uploading}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) uploadImage(f);
                    e.target.value = "";
                  }}
                />
                {uploading && <span className="text-neutral-500 text-sm">جاري الرفع…</span>}
              </div>
              <input
                value={image}
                onChange={(e) => setImage(e.target.value)}
                className="w-full border border-neutral-200 px-3 py-2 text-sm mt-2"
                placeholder="أو الصق رابط الصورة"
              />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">وصف قصير (ظهور في البطاقة / الهيرو)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border border-neutral-200 px-3 py-2 text-sm"
                rows={2}
              />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">قسم القصة</label>
              <textarea
                value={story}
                onChange={(e) => setStory(e.target.value)}
                className="w-full border border-neutral-200 px-3 py-2 text-sm"
                rows={4}
                placeholder="قصة المجموعة…"
              />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">قسم المواد</label>
              <textarea
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                className="w-full border border-neutral-200 px-3 py-2 text-sm"
                rows={4}
                placeholder="المواد والمكوّنات…"
              />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">قسم الجودة</label>
              <textarea
                value={quality}
                onChange={(e) => setQuality(e.target.value)}
                className="w-full border border-neutral-200 px-3 py-2 text-sm"
                rows={4}
                placeholder="الجودة والعناية…"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <button type="button" onClick={save} disabled={saving} className="px-4 py-2 bg-black text-white text-sm disabled:opacity-50">
                {saving ? "جاري الحفظ…" : "حفظ"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-black text-sm">
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white border border-black/10 rounded-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-black/10 text-right">
              <th className="p-4 font-medium">الاسم</th>
              <th className="p-4 font-medium">المسار</th>
              <th className="p-4 font-medium">الوصف</th>
              <th className="p-4 font-medium">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {list.map((c) => (
              <tr key={c._id} className="border-b border-black/5 bg-white">
                <td className="p-4">
                  <Link href={`/admin/collections/${c._id}`} className="text-black font-medium underline hover:no-underline">
                    {c.name}
                  </Link>
                </td>
                <td className="p-4 text-neutral-600 font-mono text-left" dir="ltr">
                  {c.slug}
                </td>
                <td className="p-4 text-neutral-600 max-w-xs truncate">{c.description || "—"}</td>
                <td className="p-4">
                  <Link href={`/admin/collections/${c._id}`} className="text-black underline ms-3">
                    عرض وإضافة منتجات
                  </Link>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      openEdit(c);
                    }}
                    className="text-black underline ms-3"
                  >
                    تعديل
                  </button>
                  <button type="button" onClick={() => remove(c._id)} className="text-red-600 underline">
                    حذف
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.length === 0 && (
          <p className="p-8 text-neutral-500 text-center">لا توجد مجموعات. أضف مجموعة أو استخدم الافتراضية للمنتجات.</p>
        )}
      </div>
    </div>
  );
}
