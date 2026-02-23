"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const serif = { fontFamily: "var(--font-cormorant), serif" };

type Collection = { _id: string; name: string; slug: string; image?: string; description?: string };

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
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [productCounts, setProductCounts] = useState<Record<string, number>>({});

  const fetchList = async () => {
    try {
      const res = await fetch("/api/admin/collections");
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setList(data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
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
    setShowForm(true);
  };

  const openEdit = (c: Collection) => {
    setEditing(c);
    setName(c.name);
    setSlug(c.slug);
    setImage(c.image ?? "");
    setDescription(c.description ?? "");
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
        body: JSON.stringify({ name, slug, image, description }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Failed to save");
      }
      setShowForm(false);
      fetchList();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
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
        throw new Error(d.error || "Upload failed");
      }
      const { url } = await res.json();
      setImage(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this collection? Products in it will move to General.")) return;
    try {
      const res = await fetch(`/api/admin/collections/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      fetchList();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    }
  };

  if (loading) return <p className="text-neutral-500" style={serif}>Loading…</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-light text-neutral-900" style={serif}>Collections</h2>
        <button
          type="button"
          onClick={openCreate}
          className="px-4 py-2 bg-black text-white text-sm uppercase tracking-widest hover:bg-neutral-800"
        >
          Add collection
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-black/10 rounded-sm p-6 mb-8">
          <h3 className="text-lg font-light mb-4" style={serif}>{editing ? "Edit collection" : "New collection"}</h3>
          <div className="grid gap-4 max-w-md">
            <div>
              <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-1">Name</label>
              <input
                value={name}
                onChange={(e) => { setName(e.target.value); if (!editing) setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")); }}
                className="w-full border border-neutral-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-1">Slug</label>
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full border border-neutral-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-1">Cover image</label>
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
                {uploading && <span className="text-neutral-500 text-sm">Uploading…</span>}
              </div>
              <input
                value={image}
                onChange={(e) => setImage(e.target.value)}
                className="w-full border border-neutral-200 px-3 py-2 text-sm mt-2"
                placeholder="Or paste image URL"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border border-neutral-200 px-3 py-2 text-sm"
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={save} disabled={saving} className="px-4 py-2 bg-black text-white text-sm disabled:opacity-50">
                {saving ? "Saving…" : "Save"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-black text-sm">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white border border-black/10 rounded-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-black/10 text-left">
              <th className="p-4 font-medium">Name</th>
              <th className="p-4 font-medium">Slug</th>
              <th className="p-4 font-medium">Description</th>
              <th className="p-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map((c) => (
              <tr key={c._id} className="border-b border-black/5 hover:bg-black/[0.02]">
                <td className="p-4">
                  <Link href={`/admin/collections/${c._id}`} className="text-black font-medium underline hover:no-underline">
                    {c.name}
                  </Link>
                </td>
                <td className="p-4 text-neutral-600">{c.slug}</td>
                <td className="p-4 text-neutral-600 max-w-xs truncate">{c.description || "—"}</td>
                <td className="p-4">
                  <Link href={`/admin/collections/${c._id}`} className="text-black underline mr-3">View & add products</Link>
                  <button type="button" onClick={(e) => { e.preventDefault(); openEdit(c); }} className="text-black underline mr-3">Edit</button>
                  <button type="button" onClick={() => remove(c._id)} className="text-red-600 underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.length === 0 && (
          <p className="p-8 text-neutral-500 text-center">No collections. Add one or use General for products.</p>
        )}
      </div>
    </div>
  );
}
