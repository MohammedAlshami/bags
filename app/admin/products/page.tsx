"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const serif = { fontFamily: "var(--font-cormorant), serif" };

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
  const [slug, setSlug] = useState("");
  const [collectionId, setCollectionId] = useState<string>("general");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchProducts = async () => {
    const res = await fetch("/api/admin/products");
    if (!res.ok) throw new Error("Failed to load products");
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
      .catch((e) => setError(e instanceof Error ? e.message : "Error"))
      .finally(() => setLoading(false));
  }, []);

  const openCreate = () => {
    setEditing(null);
    setName("");
    setPrice("");
    setCategory("Handbags");
    setImage("");
    setSlug("");
    setCollectionId(collections[0]?._id ?? "general");
    setShowForm(true);
  };

  const openEdit = (p: ProductRow) => {
    setEditing(p);
    setName(p.name);
    setPrice(p.price);
    setCategory(p.category);
    setImage(p.image);
    setSlug(p.slug);
    setCollectionId(p.collection?._id ?? collections[0]?._id ?? "general");
    setShowForm(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      const url = editing ? `/api/admin/products/${editing._id}` : "/api/admin/products";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          price,
          category,
          image,
          slug: slug || name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
          collection: collectionId && collectionId !== "general" ? collectionId : (collections[0]?._id ?? "general"),
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Failed to save");
      }
      setShowForm(false);
      const data = await fetchProducts();
      setProducts(data);
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
    if (!confirm("Delete this product?")) return;
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setProducts(await fetchProducts());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    }
  };

  if (loading) return <p className="text-neutral-500" style={serif}>Loading…</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-light text-neutral-900" style={serif}>Products</h2>
        <button
          type="button"
          onClick={openCreate}
          className="px-4 py-2 bg-black text-white text-sm uppercase tracking-widest hover:bg-neutral-800"
        >
          Add product
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-black/10 rounded-sm p-6 mb-8">
          <h3 className="text-lg font-light mb-4" style={serif}>{editing ? "Edit product" : "New product"}</h3>
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
              <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-1">Price</label>
              <input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full border border-neutral-200 px-3 py-2 text-sm"
                placeholder="$1,280"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-neutral-200 px-3 py-2 text-sm"
              >
                <option value="Handbags">Handbags</option>
                <option value="Travel">Travel</option>
                <option value="Evening">Evening</option>
              </select>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-1">Collection (required)</label>
              <select
                value={collectionId}
                onChange={(e) => setCollectionId(e.target.value)}
                className="w-full border border-neutral-200 px-3 py-2 text-sm"
                required
              >
                {collections.length === 0 ? (
                  <option value="">Create a collection first</option>
                ) : (
                  collections.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))
                )}
              </select>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-1">Image</label>
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
              <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-1">Slug</label>
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full border border-neutral-200 px-3 py-2 text-sm"
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
              <th className="p-4 font-medium">Image</th>
              <th className="p-4 font-medium">Name</th>
              <th className="p-4 font-medium">Price</th>
              <th className="p-4 font-medium">Category</th>
              <th className="p-4 font-medium">Collection</th>
              <th className="p-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id} className="border-b border-black/5">
                <td className="p-4">
                  <div className="relative w-12 h-16 bg-neutral-100">
                    {p.image && (
                      <Image
                        src={p.image}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="48px"
                        unoptimized={p.image.startsWith("http") && !/unsplash|ebayimg|cloudinary/.test(p.image)}
                      />
                    )}
                  </div>
                </td>
                <td className="p-4">{p.name}</td>
                <td className="p-4">{p.price}</td>
                <td className="p-4">{p.category}</td>
                <td className="p-4 text-neutral-600">{(p.collection as Collection)?.name ?? "—"}</td>
                <td className="p-4">
                  <button type="button" onClick={() => openEdit(p)} className="text-black underline mr-3">Edit</button>
                  <button type="button" onClick={() => remove(p._id)} className="text-red-600 underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && (
          <p className="p-8 text-neutral-500 text-center">No products yet.</p>
        )}
      </div>
    </div>
  );
}
