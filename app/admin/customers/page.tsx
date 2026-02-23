"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const serif = { fontFamily: "var(--font-cormorant), serif" };

type Customer = {
  _id: string;
  username: string;
  email?: string;
  fullName?: string;
  address?: string;
  phone?: string;
  disabled?: boolean;
  orderCount?: number;
  createdAt?: string;
};

export default function AdminCustomersPage() {
  const [list, setList] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [editing, setEditing] = useState<Customer | null>(null);
  const [editEmail, setEditEmail] = useState("");
  const [editFullName, setEditFullName] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editDisabled, setEditDisabled] = useState(false);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);

  const fetchList = async () => {
    const url = search ? `/api/admin/customers?search=${encodeURIComponent(search)}` : "/api/admin/customers";
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to load customers");
    return res.json();
  };

  useEffect(() => {
    fetchList()
      .then(setList)
      .catch((e) => setError(e instanceof Error ? e.message : "Error"))
      .finally(() => setLoading(false));
  }, [search]);

  const openEdit = (c: Customer) => {
    setEditing(c);
    setEditEmail(c.email ?? "");
    setEditFullName(c.fullName ?? "");
    setEditAddress(c.address ?? "");
    setEditPhone(c.phone ?? "");
    setEditDisabled(c.disabled ?? false);
  };

  const saveEdit = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/customers/${editing._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: editEmail,
          fullName: editFullName,
          address: editAddress,
          phone: editPhone,
          disabled: editDisabled,
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Failed to save");
      }
      setEditing(null);
      setList(await fetchList());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setSaving(false);
    }
  };

  const toggleDisabled = async (c: Customer) => {
    try {
      const res = await fetch(`/api/admin/customers/${c._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ disabled: !c.disabled }),
      });
      if (!res.ok) throw new Error("Failed to update");
      setList(await fetchList());
      if (editing?._id === c._id) {
        setEditDisabled(!c.disabled);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    }
  };

  const doExport = () => {
    setExporting(true);
    window.location.href = "/api/admin/customers/export";
    setTimeout(() => setExporting(false), 2000);
  };

  if (loading) return <p className="text-neutral-500" style={serif}>Loading…</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h2 className="text-xl font-light text-neutral-900" style={serif}>Customers</h2>
        <div className="flex gap-2 items-center flex-wrap">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && setSearch(searchInput)}
            placeholder="Search username, email, name…"
            className="border border-neutral-200 px-3 py-2 text-sm w-56"
          />
          <button
            type="button"
            onClick={() => setSearch(searchInput)}
            className="px-4 py-2 border border-black text-sm"
          >
            Search
          </button>
          <button
            type="button"
            onClick={doExport}
            disabled={exporting}
            className="px-4 py-2 bg-black text-white text-sm disabled:opacity-50"
          >
            {exporting ? "Exporting…" : "Export CSV"}
          </button>
        </div>
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-10 p-4">
          <div className="bg-white border border-black/10 rounded-sm p-6 max-w-md w-full shadow-lg">
            <h3 className="text-lg font-light mb-4" style={serif}>Edit customer</h3>
            <div className="grid gap-4">
              <p className="text-sm text-neutral-600">Username: {editing.username}</p>
              <div>
                <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-1">Email</label>
                <input
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full border border-neutral-200 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-1">Full name</label>
                <input
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="w-full border border-neutral-200 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-1">Phone</label>
                <input
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full border border-neutral-200 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-neutral-500 mb-1">Address</label>
                <textarea
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  className="w-full border border-neutral-200 px-3 py-2 text-sm"
                  rows={2}
                />
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editDisabled}
                  onChange={(e) => setEditDisabled(e.target.checked)}
                />
                <span className="text-sm">Disabled (cannot log in)</span>
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={saveEdit}
                  disabled={saving}
                  className="px-4 py-2 bg-black text-white text-sm disabled:opacity-50"
                >
                  {saving ? "Saving…" : "Save"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="px-4 py-2 border border-black text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white border border-black/10 rounded-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-black/10 text-left">
              <th className="p-4 font-medium">Username</th>
              <th className="p-4 font-medium">Email</th>
              <th className="p-4 font-medium">Full name</th>
              <th className="p-4 font-medium">Phone</th>
              <th className="p-4 font-medium">Address</th>
              <th className="p-4 font-medium">Orders</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map((c) => (
              <tr key={c._id} className="border-b border-black/5">
                <td className="p-4">
                  <Link href={`/admin/customers/${c._id}`} className="text-black underline hover:no-underline">
                    {c.username}
                  </Link>
                </td>
                <td className="p-4 text-neutral-600">{c.email || "—"}</td>
                <td className="p-4 text-neutral-600">{c.fullName || "—"}</td>
                <td className="p-4 text-neutral-600">{c.phone || "—"}</td>
                <td className="p-4 text-neutral-600 max-w-xs truncate">{c.address || "—"}</td>
                <td className="p-4">{c.orderCount ?? 0}</td>
                <td className="p-4">{c.disabled ? <span className="text-amber-600">Disabled</span> : "Active"}</td>
                <td className="p-4">
                  <button type="button" onClick={() => openEdit(c)} className="text-black underline mr-3">
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleDisabled(c)}
                    className="text-black underline mr-3"
                  >
                    {c.disabled ? "Enable" : "Disable"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.length === 0 && (
          <p className="p-8 text-neutral-500 text-center">No customers found.</p>
        )}
      </div>
    </div>
  );
}
