"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  User as UserIcon,
  MapPin,
  ShoppingBag,
} from "lucide-react";

const serif = { fontFamily: "var(--font-cormorant), serif" };

type CustomerOrder = { _id: string; status: string; total?: number; createdAt?: string };
type CustomerDetail = {
  _id: string;
  username: string;
  email?: string;
  fullName?: string;
  address?: string;
  phone?: string;
  disabled?: boolean;
  orderCount?: number;
  orders?: CustomerOrder[];
  createdAt?: string;
};

export default function AdminCustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/admin/customers/${id}`)
      .then((res) => {
        if (res.status === 404) throw new Error("Customer not found");
        if (!res.ok) throw new Error("Failed to load customer");
        return res.json();
      })
      .then(setCustomer)
      .catch((e) => setError(e instanceof Error ? e.message : "Error"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="text-neutral-500" style={serif}>Loading…</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!customer) return null;

  const orders = customer.orders ?? [];

  return (
    <div className="px-2 md:px-4">
      <Link
        href="/admin/customers"
        className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-black mb-6"
      >
        <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
        Back to customers
      </Link>

      <p className="text-[10px] uppercase tracking-[0.35em] text-gray-500">Customer</p>
      <h2 className="mt-2 text-3xl font-light text-neutral-900 md:text-4xl mb-8" style={serif}>
        {customer.fullName || customer.username}
      </h2>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <section className="bg-white border border-black/10 rounded-sm p-6 md:p-8">
          <h3 className="text-lg font-light text-black mb-5 flex items-center gap-2" style={serif}>
            <UserIcon className="w-5 h-5 text-neutral-500" strokeWidth={1.25} />
            Details
          </h3>
          <dl className="space-y-4 text-sm">
            <div>
              <dt className="text-[10px] uppercase tracking-widest text-neutral-500 mb-0.5">Username</dt>
              <dd className="text-neutral-900">{customer.username}</dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-widest text-neutral-500 mb-0.5">Email</dt>
              <dd className="text-neutral-700">{customer.email || "—"}</dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-widest text-neutral-500 mb-0.5">Full name</dt>
              <dd className="text-neutral-700">{customer.fullName || "—"}</dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-widest text-neutral-500 mb-0.5">Phone</dt>
              <dd className="text-neutral-700">{customer.phone || "—"}</dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-widest text-neutral-500 mb-0.5">Status</dt>
              <dd>{customer.disabled ? <span className="text-amber-600">Disabled</span> : "Active"}</dd>
            </div>
            {customer.createdAt && (
              <div>
                <dt className="text-[10px] uppercase tracking-widest text-neutral-500 mb-0.5">Joined</dt>
                <dd className="text-neutral-600">
                  {new Date(customer.createdAt).toLocaleDateString(undefined, {
                    dateStyle: "medium",
                  })}
                </dd>
              </div>
            )}
          </dl>
        </section>

        <section className="bg-white border border-black/10 rounded-sm p-6 md:p-8">
          <h3 className="text-lg font-light text-black mb-5 flex items-center gap-2" style={serif}>
            <MapPin className="w-5 h-5 text-neutral-500" strokeWidth={1.25} />
            Shipping address
          </h3>
          <p className="text-sm text-neutral-700 whitespace-pre-wrap">
            {customer.address?.trim() || "No address on file."}
          </p>
          <Link
            href="/admin/customers"
            className="inline-block mt-4 text-sm text-black underline hover:no-underline"
          >
            Edit customer (in list)
          </Link>
        </section>
      </div>

      <section className="bg-white border border-black/10 rounded-sm overflow-hidden">
        <div className="p-6 md:p-8 border-b border-black/10 flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-neutral-500" strokeWidth={1.25} />
          <h3 className="text-lg font-light text-black" style={serif}>
            Orders ({customer.orderCount ?? 0})
          </h3>
        </div>
        {orders.length === 0 ? (
          <p className="p-8 text-neutral-500 text-sm">No orders yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-black/10 text-left">
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Total</th>
                <th className="p-4 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o._id} className="border-b border-black/5">
                  <td className="p-4 text-neutral-600">
                    {o.createdAt
                      ? new Date(o.createdAt).toLocaleDateString(undefined, { dateStyle: "medium" })
                      : "—"}
                  </td>
                  <td className="p-4">{o.status ?? "—"}</td>
                  <td className="p-4">{o.total != null ? `$${Number(o.total)}` : "—"}</td>
                  <td className="p-4">
                    <Link
                      href={`/admin/orders/${o._id}`}
                      className="text-black underline hover:no-underline"
                    >
                      View order
                    </Link>
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
