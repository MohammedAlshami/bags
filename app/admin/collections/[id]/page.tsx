"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Package, Plus } from "lucide-react";

const serif = { fontFamily: "var(--font-cormorant), serif" };

type CollectionDoc = { _id: string; name: string; slug: string; image?: string; description?: string };
type ProductRow = {
  _id: string;
  name: string;
  price: string;
  category: string;
  image: string;
  slug: string;
  collection?: { _id: string; name: string; slug: string } | null;
};

export default function AdminCollectionDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [collection, setCollection] = useState<CollectionDoc | null>(null);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Handbags");
  const [image, setImage] = useState("");
  const [slug, setSlug] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchCollection = () =>
    fetch(`/api/admin/collections/${id}`).then((res) => {
      if (res.status === 404) throw new Error("Collection not found");
      if (!res.ok) throw new Error("Failed to load collection");
      return res.json();
    });

  const fetchProducts = () =>
    fetch(`/api/admin/products?collectionId=${encodeURIComponent(id)}`).then((res) => {
      if (!res.ok) throw new Error("Failed to load products");
      return res.json();
    });

  useEffect(() => {
    if (!id) return;
    Promise.all([fetchCollection(), fetchProducts()])
      .then(([col, prods]) => {
        setCollection(col);
        setProducts(prods);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Error"))
      .finally(() => setLoading(false));
  }, [id]);

  const refreshProducts = () => fetchProducts().then(setProducts);

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

  const addProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          price,
          category,
          image,
          slug: slug || name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
          collection: id,
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Failed to add product");
      }
      setName("");
      setPrice("");
      setCategory("Handbags");
      setImage("");
      setSlug("");
      setShowAddForm(false);
      await refreshProducts();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setSaving(false);
    }
  };

  const removeFromCollection = async (productId: string) => {
    if (!confirm("Move this product to the default collection (Essentials)?")) return;
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collection: "general" }),
      });
      if (!res.ok) throw new Error("Failed to update");
      await refreshProducts();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    }
  };

  if (loading) return <p className="text-neutral-500" style={serif}>Loading…</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!collection) return null;

  return (
    <div className="px-2 md:px-4">
      <Link
        href="/admin/collections"
        className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-black mb-6"
      >
        <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
        Back to collections
      </Link>

      <p className="text-[10px] uppercase tracking-[0.35em] text-gray-500">Collection</p>
      <h2 className="mt-2 text-3xl font-light text-neutral-900 md:text-4xl mb-2" style={serif}>
        {collection.name}
      </h2>
      <p className="text-sm text-neutral-600 mb-8">{collection.slug}</p>

      {collection.image && (
        <div className="relative w-full max-w-xs aspect-square rounded-sm overflow-hidden border border-black/10 mb-8">
          <Image src={collection.image} alt={collection.name} fill className="object-cover" />
        </div>
      )}
      {collection.description && (
        <p className="text-sm text-neutral-700 mb-8 max-w-2xl">{collection.description}</p>
      )}

      <section className="bg-white border border-black/10 rounded-sm overflow-hidden">
        <div className="p-6 md:p-8 border-b border-black/10 flex flex-wrap items-center justify-between gap-4">
          <h3 className="text-lg font-light text-black flex items-center gap-2" style={serif}>
            <Package className="w-5 h-5 text-neutral-500" strokeWidth={1.25} />
            Products in this collection ({products.length})
          </h3>
          <button
            type="button"
            onClick={() => setShowAddForm((v) => !v)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white text-sm uppercase tracking-widest hover:bg-neutral-800"
          >
            <Plus className="w-4 h-4" />
            Add product
          </button>
        </div>

        {showAddForm && (
          <form onSubmit={addProduct} className="p-6 md:p-8 border-b border-black/10 bg-neutral-50/50">
            <h4 className="text-base font-light mb-4" style={serif}>New product in {collection.name}</h4>
            <div className="grid gap-4 max-w-2xl md:grid-cols-2">
              <div>
                <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-1">Name</label>
                <input
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""));
                  }}
                  className="w-full border border-neutral-200 px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-1">Price</label>
                <input
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full border border-neutral-200 px-3 py-2 text-sm"
                  placeholder="$1,280"
                  required
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
                <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-1">Slug</label>
                <input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full border border-neutral-200 px-3 py-2 text-sm"
                />
              </div>
              <div className="md:col-span-2">
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
            </div>
            <div className="flex gap-2 mt-4">
              <button type="submit" disabled={saving} className="px-4 py-2 bg-black text-white text-sm disabled:opacity-50">
                {saving ? "Adding…" : "Add product"}
              </button>
              <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 border border-black text-sm">
                Cancel
              </button>
            </div>
          </form>
        )}

        {products.length === 0 ? (
          <p className="p-8 text-neutral-500 text-center">
            No products in this collection yet. Click &quot;Add product&quot; to add one.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-black/10 text-left">
                <th className="p-4 font-medium">Product</th>
                <th className="p-4 font-medium">Category</th>
                <th className="p-4 font-medium">Price</th>
                <th className="p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id} className="border-b border-black/5">
                  <td className="p-4">
                    <Link href={`/admin/products`} className="text-black underline hover:no-underline">
                      {p.name}
                    </Link>
                  </td>
                  <td className="p-4 text-neutral-600">{p.category}</td>
                  <td className="p-4">{p.price}</td>
                  <td className="p-4">
                    <Link href="/admin/products" className="text-black underline mr-3 text-xs">Edit in Products</Link>
                    <button
                      type="button"
                      onClick={() => removeFromCollection(p._id)}
                      className="text-neutral-600 underline text-xs hover:text-black"
                    >
                      Remove from collection
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
