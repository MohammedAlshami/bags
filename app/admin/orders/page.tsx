"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, ClipboardPlus, X } from "lucide-react";
import { adminIconClassName, sans } from "@/lib/page-theme";
import { formatSar } from "@/lib/format-sar";
import { adminApiErrorAr, orderStatusAr } from "@/lib/admin-ar";
import { AdminSkeletonFormFields, AdminSkeletonOrdersPage } from "@/lib/admin-skeleton";
import { parsePrice } from "@/lib/cart";

type CustomerRef = { _id: string; username?: string; email?: string; fullName?: string };
type OrderRow = {
  _id: string;
  customer: CustomerRef;
  total: number;
  status: string;
  createdAt: string;
  items?: { name?: string; quantity?: number; price?: string }[];
};

type ProductOption = {
  _id: string;
  name: string;
  slug: string;
  price: string;
  image: string;
};

function ProductLinePicker({
  products,
  value,
  onChange,
}: {
  products: ProductOption[];
  value: string;
  onChange: (slug: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [open]);

  const selected = value ? products.find((p) => p.slug === value) : undefined;

  return (
    <div className="relative w-full" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 border border-neutral-200 bg-white px-2 py-2 text-sm text-right hover:border-neutral-300"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span className="flex min-w-0 flex-1 items-center gap-2">
          {selected ? (
            <>
              {selected.image ? (
                // eslint-disable-next-line @next/next/no-img-element -- dynamic admin CDN URLs
                <img
                  src={selected.image}
                  alt=""
                  className="h-9 w-9 shrink-0 rounded-sm object-cover"
                />
              ) : (
                <div className="h-9 w-9 shrink-0 rounded-sm bg-neutral-100" aria-hidden />
              )}
              <span className="truncate">
                {selected.name} — {selected.price}
              </span>
            </>
          ) : (
            <span className="text-neutral-500">— اختر —</span>
          )}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 transition-transform ${adminIconClassName} ${open ? "rotate-180" : ""}`}
          strokeWidth={1.75}
          aria-hidden
        />
      </button>
      {open ? (
        <ul
          className="absolute z-[80] mt-1 max-h-60 w-full overflow-y-auto overscroll-contain border border-neutral-200 bg-white py-1 shadow-lg"
          role="listbox"
        >
          {products.map((p) => {
            const isActive = p.slug === value;
            return (
              <li key={p._id} role="none">
                <button
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  className={`flex w-full items-center gap-2 px-2 py-2 text-right text-sm hover:bg-neutral-50 ${
                    isActive ? "bg-neutral-50" : ""
                  }`}
                  onClick={() => {
                    onChange(p.slug);
                    setOpen(false);
                  }}
                >
                  {p.image ? (
                    // eslint-disable-next-line @next/next/no-img-element -- dynamic admin CDN URLs
                    <img src={p.image} alt="" className="h-10 w-10 shrink-0 rounded-sm object-cover" />
                  ) : (
                    <div className="h-10 w-10 shrink-0 rounded-sm bg-neutral-100" aria-hidden />
                  )}
                  <span className="min-w-0 flex-1 leading-snug">
                    {p.name}
                    <span className="block text-xs text-neutral-500">{p.price}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

type LineDraft = { productSlug: string; quantity: string };

const STATUS_OPTIONS = ["pending", "paid", "shipped", "cancelled"] as const;

export default function AdminOrdersPage() {
  const [list, setList] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [customers, setCustomers] = useState<CustomerRef[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [sheetLoading, setSheetLoading] = useState(false);
  const [panelError, setPanelError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [customerId, setCustomerId] = useState("");
  const [status, setStatus] = useState<(typeof STATUS_OPTIONS)[number]>("pending");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [carrier, setCarrier] = useState("");
  const [shippingFullName, setShippingFullName] = useState("");
  const [shippingLine1, setShippingLine1] = useState("");
  const [shippingLine2, setShippingLine2] = useState("");
  const [shippingCity, setShippingCity] = useState("");
  const [shippingState, setShippingState] = useState("");
  const [shippingPostCode, setShippingPostCode] = useState("");
  const [shippingCountry, setShippingCountry] = useState("");
  const [lines, setLines] = useState<LineDraft[]>([{ productSlug: "", quantity: "1" }]);

  const fetchOrders = () =>
    fetch("/api/admin/orders").then((res) => {
      if (!res.ok) throw new Error("Failed to load orders");
      return res.json();
    });

  useEffect(() => {
    fetchOrders()
      .then(setList)
      .catch((e) => setError(adminApiErrorAr(e instanceof Error ? e.message : "Error")))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!sheetOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSheetOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [sheetOpen]);

  const resetSheet = () => {
    setCustomerId("");
    setStatus("pending");
    setTrackingNumber("");
    setCarrier("");
    setShippingFullName("");
    setShippingLine1("");
    setShippingLine2("");
    setShippingCity("");
    setShippingState("");
    setShippingPostCode("");
    setShippingCountry("");
    setLines([{ productSlug: "", quantity: "1" }]);
    setPanelError(null);
  };

  const openSheet = async () => {
    resetSheet();
    setSheetOpen(true);
    setSheetLoading(true);
    setPanelError(null);
    try {
      const [custRes, prodRes] = await Promise.all([
        fetch("/api/admin/customers"),
        fetch("/api/admin/products?all=1"),
      ]);
      if (!custRes.ok) throw new Error("Failed to fetch customers");
      if (!prodRes.ok) throw new Error("Failed to fetch products");
      const custData = await custRes.json();
      const prodData: unknown = await prodRes.json();
      setCustomers(Array.isArray(custData) ? custData : []);
      setProducts(
        Array.isArray(prodData)
          ? prodData.map((p: ProductOption) => ({
              _id: p._id,
              name: p.name,
              slug: p.slug,
              price: p.price,
              image: typeof p.image === "string" ? p.image : "",
            }))
          : []
      );
    } catch (e) {
      setPanelError(adminApiErrorAr(e instanceof Error ? e.message : "Error"));
    } finally {
      setSheetLoading(false);
    }
  };

  const closeSheet = () => {
    setSheetOpen(false);
    setPanelError(null);
  };

  const productBySlug = useMemo(() => {
    const m = new Map<string, ProductOption>();
    for (const p of products) m.set(p.slug, p);
    return m;
  }, [products]);

  const draftTotal = useMemo(() => {
    let t = 0;
    for (const line of lines) {
      const p = line.productSlug ? productBySlug.get(line.productSlug) : undefined;
      const q = Math.max(1, parseInt(line.quantity, 10) || 1);
      if (p) t += parsePrice(p.price) * q;
    }
    return t;
  }, [lines, productBySlug]);

  const addLine = () => {
    setLines((prev) => [...prev, { productSlug: "", quantity: "1" }]);
  };

  const removeLine = (index: number) => {
    setLines((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)));
  };

  const updateLine = (index: number, patch: Partial<LineDraft>) => {
    setLines((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  const saveOrder = async () => {
    if (!customerId) {
      setPanelError(adminApiErrorAr("Customer required"));
      return;
    }
    const items: { slug: string; name: string; price: string; quantity: number }[] = [];
    for (const line of lines) {
      if (!line.productSlug) {
        setPanelError(adminApiErrorAr("Invalid items"));
        return;
      }
      const p = productBySlug.get(line.productSlug);
      if (!p) {
        setPanelError(adminApiErrorAr("Invalid items"));
        return;
      }
      const quantity = Math.max(1, parseInt(line.quantity, 10) || 1);
      const line: { slug: string; name: string; price: string; quantity: number; image?: string } = {
        slug: p.slug,
        name: p.name,
        price: p.price,
        quantity,
      };
      if (p.image) line.image = p.image;
      items.push(line);
    }
    if (items.length === 0) {
      setPanelError(adminApiErrorAr("Items required"));
      return;
    }

    setSaving(true);
    setPanelError(null);
    try {
      const body: Record<string, unknown> = {
        customerId,
        status,
        items,
        shippingAddress: {
          fullName: shippingFullName,
          line1: shippingLine1,
          line2: shippingLine2,
          city: shippingCity,
          state: shippingState,
          postCode: shippingPostCode,
          country: shippingCountry,
        },
      };
      if (status === "shipped") {
        body.trackingNumber = trackingNumber;
        body.carrier = carrier;
      }

      const res = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        const raw = typeof d.error === "string" ? d.error : "";
        throw new Error(raw || "Failed to create order");
      }
      const created = await res.json();
      closeSheet();
      setList((prev) => [
        {
          _id: created._id,
          customer: created.customer,
          total: created.total,
          status: created.status,
          createdAt: created.createdAt,
          items: created.items,
        },
        ...prev,
      ]);
    } catch (e) {
      setPanelError(adminApiErrorAr(e instanceof Error ? e.message : "Error"));
    } finally {
      setSaving(false);
    }
  };

  const customerLabel = (c: CustomerRef) => c?.username ?? (c?.fullName || c?.email) ?? "—";

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
    <div dir="rtl" style={sans} className="relative">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h2 className="text-xl font-medium text-neutral-900">الطلبات</h2>
        <button
          type="button"
          onClick={openSheet}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#B63A6B] text-white text-sm rounded-sm hover:brightness-110 transition-[filter]"
        >
          <ClipboardPlus className="w-4 h-4 shrink-0" strokeWidth={1.75} aria-hidden />
          إضافة طلب
        </button>
      </div>

      {sheetOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[60] cursor-pointer bg-black/40 transition-colors hover:bg-black/50"
            aria-label="إغلاق"
            onClick={closeSheet}
          />
          <aside
            className="
              fixed z-[70] flex flex-col bg-white shadow-2xl
              inset-x-0 bottom-0 max-h-[92vh] rounded-t-2xl border-t border-black/10
              md:inset-x-auto md:left-0 md:top-0 md:bottom-0 md:right-auto md:h-full md:max-h-none md:w-full md:max-w-lg md:rounded-none md:border-t-0 md:border-l md:border-black/10
            "
          >
            <div className="flex shrink-0 items-center justify-between gap-3 px-4 py-3 border-b border-black/5">
              <h3 className="text-lg font-medium">طلب جديد</h3>
              <button
                type="button"
                onClick={closeSheet}
                className="p-2 rounded-sm hover:opacity-70 text-neutral-600"
                aria-label="إغلاق"
              >
                <X className={`w-5 h-5 ${adminIconClassName}`} strokeWidth={1.5} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4">
              {sheetLoading ? (
                <AdminSkeletonFormFields rows={8} />
              ) : (
                <div className="grid gap-4">
                  <div>
                    <label className="block text-xs text-neutral-500 mb-1">العميل</label>
                    <select
                      value={customerId}
                      onChange={(e) => setCustomerId(e.target.value)}
                      className="w-full border border-neutral-200 px-3 py-2 text-sm bg-white"
                    >
                      <option value="">— اختر عميلاً —</option>
                      {customers.map((c) => (
                        <option key={c._id} value={c._id}>
                          {customerLabel(c)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-neutral-500 mb-1">الحالة</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as (typeof STATUS_OPTIONS)[number])}
                      className="w-full border border-neutral-200 px-3 py-2 text-sm bg-white"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {orderStatusAr(s)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {status === "shipped" ? (
                    <>
                      <div>
                        <label className="block text-xs text-neutral-500 mb-1">رقم التتبع</label>
                        <input
                          value={trackingNumber}
                          onChange={(e) => setTrackingNumber(e.target.value)}
                          className="w-full border border-neutral-200 px-3 py-2 text-sm"
                          dir="ltr"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-neutral-500 mb-1">شركة الشحن</label>
                        <input
                          value={carrier}
                          onChange={(e) => setCarrier(e.target.value)}
                          className="w-full border border-neutral-200 px-3 py-2 text-sm"
                        />
                      </div>
                    </>
                  ) : null}

                  <div className="border-t border-black/10 pt-4">
                    <p className="text-sm font-medium text-neutral-800 mb-2">المنتجات</p>
                    {lines.map((line, index) => (
                      <div key={index} className="flex flex-wrap gap-2 items-end mb-3">
                        <div className="flex-1 min-w-[140px]">
                          <label className="block text-xs text-neutral-500 mb-1">المنتج</label>
                          <ProductLinePicker
                            products={products}
                            value={line.productSlug}
                            onChange={(slug) => updateLine(index, { productSlug: slug })}
                          />
                        </div>
                        <div className="w-24">
                          <label className="block text-xs text-neutral-500 mb-1">الكمية</label>
                          <input
                            type="number"
                            min={1}
                            value={line.quantity}
                            onChange={(e) => updateLine(index, { quantity: e.target.value })}
                            className="w-full border border-neutral-200 px-3 py-2 text-sm"
                            dir="ltr"
                          />
                        </div>
                        {lines.length > 1 ? (
                          <button
                            type="button"
                            onClick={() => removeLine(index)}
                            className="text-sm text-neutral-600 underline pb-2"
                          >
                            حذف
                          </button>
                        ) : null}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addLine}
                      className="text-sm text-black underline"
                    >
                      + إضافة سطر
                    </button>
                    <p className="text-sm text-neutral-700 mt-3">
                      الإجمالي: <span className="font-medium">{formatSar(draftTotal)}</span>
                    </p>
                  </div>

                  <div className="border-t border-black/10 pt-4">
                    <p className="text-sm font-medium text-neutral-800 mb-2">عنوان الشحن (اختياري)</p>
                    <div className="grid gap-3">
                      <input
                        placeholder="الاسم الكامل"
                        value={shippingFullName}
                        onChange={(e) => setShippingFullName(e.target.value)}
                        className="w-full border border-neutral-200 px-3 py-2 text-sm"
                      />
                      <input
                        placeholder="السطر 1"
                        value={shippingLine1}
                        onChange={(e) => setShippingLine1(e.target.value)}
                        className="w-full border border-neutral-200 px-3 py-2 text-sm"
                      />
                      <input
                        placeholder="السطر 2"
                        value={shippingLine2}
                        onChange={(e) => setShippingLine2(e.target.value)}
                        className="w-full border border-neutral-200 px-3 py-2 text-sm"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          placeholder="المدينة"
                          value={shippingCity}
                          onChange={(e) => setShippingCity(e.target.value)}
                          className="w-full border border-neutral-200 px-3 py-2 text-sm"
                        />
                        <input
                          placeholder="المنطقة"
                          value={shippingState}
                          onChange={(e) => setShippingState(e.target.value)}
                          className="w-full border border-neutral-200 px-3 py-2 text-sm"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          placeholder="الرمز البريدي"
                          value={shippingPostCode}
                          onChange={(e) => setShippingPostCode(e.target.value)}
                          className="w-full border border-neutral-200 px-3 py-2 text-sm"
                          dir="ltr"
                        />
                        <input
                          placeholder="الدولة"
                          value={shippingCountry}
                          onChange={(e) => setShippingCountry(e.target.value)}
                          className="w-full border border-neutral-200 px-3 py-2 text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {panelError ? (
                    <p className="text-sm text-red-600" role="alert">
                      {panelError}
                    </p>
                  ) : null}

                  <div className="flex gap-2 flex-wrap pt-2">
                    <button
                      type="button"
                      onClick={saveOrder}
                      disabled={saving}
                      className="px-4 py-2 bg-[#B63A6B] text-white text-sm rounded-sm hover:brightness-110 transition-[filter] disabled:opacity-50 disabled:hover:brightness-100"
                    >
                      {saving ? "جاري الإنشاء…" : "إنشاء الطلب"}
                    </button>
                    <button type="button" onClick={closeSheet} className="px-4 py-2 border border-black text-sm">
                      إلغاء
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="h-[env(safe-area-inset-bottom)] shrink-0 md:hidden" aria-hidden />
          </aside>
        </>
      )}

      <div className="rounded-sm border border-black/10 bg-white">
        <div className="overflow-x-auto overscroll-x-contain">
          <table className="w-full min-w-[40rem] text-sm">
          <thead>
            <tr className="border-b border-black/10 text-right">
              <th className="p-4 font-medium">العميل</th>
              <th className="p-4 font-medium">التاريخ</th>
              <th className="p-4 font-medium">الحالة</th>
              <th className="p-4 font-medium">الإجمالي</th>
              <th className="p-4 font-medium">إجراء</th>
            </tr>
          </thead>
          <tbody>
            {list.map((o) => (
              <tr key={o._id} className="border-b border-black/5 bg-white">
                <td className="p-4">
                  {o.customer?._id ? (
                    <Link href={`/admin/customers/${o.customer._id}`} className="text-black underline hover:no-underline">
                      {customerLabel(o.customer)}
                    </Link>
                  ) : (
                    customerLabel(o.customer)
                  )}
                </td>
                <td className="p-4 text-neutral-600">
                  {o.createdAt
                    ? new Date(o.createdAt).toLocaleDateString("ar-SA", { dateStyle: "medium" })
                    : "—"}
                </td>
                <td className="p-4">{orderStatusAr(o.status ?? "")}</td>
                <td className="p-4">{o.total != null ? formatSar(Number(o.total)) : "—"}</td>
                <td className="p-4">
                  <Link href={`/admin/orders/${o._id}`} className="text-black underline hover:no-underline">
                    عرض الطلب
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        {list.length === 0 && <p className="p-8 text-neutral-500 text-center">لا توجد طلبات بعد.</p>}
      </div>
    </div>
  );
}
