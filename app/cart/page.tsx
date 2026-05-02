"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { SafeImage } from "@/app/components/SafeImage";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart } from "@/app/context/CartContext";
import { sans, pagePaddingX } from "@/lib/page-theme";
import { STORE_LOCATIONS } from "@/lib/store-locations";
import { BANK_TRANSFER_INFO } from "@/lib/bank-info";
import { applyCheckoutDiscount } from "@/lib/order-discount";
import { formatDualPrice, type ProductSizePrice } from "@/lib/price-format";
import type { CartItem } from "@/lib/cart";

function formatSar(n: number) {
  return (
    new Intl.NumberFormat("ar-SA", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n) + " ر.س"
  );
}

type MeUser = { username: string; role: string } | null;
type ProfileAddress = { fullName: string; address: string; phone: string };
type CityScope = "sanaa" | "outside";
type DeliveryMethod = "direct" | "pickup";

function BranchSelectDropdown({
  id,
  value,
  onChange,
}: {
  id: string;
  value: string;
  onChange: (branchId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selected = STORE_LOCATIONS.find((b) => b.id === value);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const label = selected ? `${selected.name} — ${selected.city}` : "اختيار الفرع";

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        id={id}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-listbox`}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 rounded-xl bg-neutral-50 px-3 py-3 text-start text-sm text-neutral-900 ring-1 ring-neutral-200/80 transition-[box-shadow,ring-color] hover:ring-neutral-300 focus:outline-none focus:ring-2 focus:ring-brand-primary/35"
        style={sans}
      >
        <span className="min-w-0 flex-1 leading-snug">{label}</span>
        <ChevronDown
          className={`size-4 shrink-0 text-neutral-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          strokeWidth={2}
          aria-hidden
        />
      </button>
      {open ? (
        <ul
          id={`${id}-listbox`}
          role="listbox"
          aria-labelledby={id}
          className="absolute start-0 top-full z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white py-1 ring-1 ring-neutral-200/90"
        >
          {STORE_LOCATIONS.map((b) => {
            const isSel = b.id === value;
            return (
              <li key={b.id} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={isSel}
                  onClick={() => {
                    onChange(b.id);
                    setOpen(false);
                  }}
                  className={`w-full px-3 py-2.5 text-start text-sm leading-snug transition-colors ${
                    isSel ? "bg-brand-light/45 font-medium text-brand-dark" : "text-neutral-800 hover:bg-neutral-50"
                  }`}
                  style={sans}
                >
                  {b.name} — {b.city}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

const QTY_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

function QuantitySelectDropdown({
  id,
  value,
  onChange,
}: {
  id: string;
  value: number;
  onChange: (qty: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div ref={containerRef} className="relative w-[5.25rem] shrink-0">
      <button
        type="button"
        id={id}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-listbox`}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-1 rounded-xl bg-neutral-50 px-2.5 py-2 text-sm tabular-nums text-neutral-900 ring-1 ring-neutral-200/80 transition-[box-shadow,ring-color] hover:ring-neutral-300 focus:outline-none focus:ring-2 focus:ring-brand-primary/35"
        style={sans}
      >
        <span>{value}</span>
        <ChevronDown
          className={`size-3.5 shrink-0 text-neutral-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          strokeWidth={2}
          aria-hidden
        />
      </button>
      {open ? (
        <ul
          id={`${id}-listbox`}
          role="listbox"
          aria-labelledby={id}
          className="absolute start-0 top-full z-50 mt-1 max-h-48 w-full overflow-auto rounded-xl bg-white py-1 ring-1 ring-neutral-200/90"
        >
          {QTY_OPTIONS.map((n) => {
            const isSel = n === value;
            return (
              <li key={n} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={isSel}
                  onClick={() => {
                    onChange(n);
                    setOpen(false);
                  }}
                  className={`w-full px-2.5 py-2 text-center text-sm tabular-nums transition-colors ${
                    isSel ? "bg-brand-light/45 font-medium text-brand-dark" : "text-neutral-800 hover:bg-neutral-50"
                  }`}
                  style={sans}
                >
                  {n}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

type LinePriceMeta = { oldRiyal: number | null; sizes: ProductSizePrice[] | null };

function resolveOldRiyalForLine(item: Pick<CartItem, "name" | "oldRiyal">, meta?: LinePriceMeta | null): number | null {
  if (item.oldRiyal != null && item.oldRiyal > 0) return item.oldRiyal;
  if (!meta) return null;

  const sizes = meta.sizes;
  if (sizes && sizes.length > 0) {
    const dashIdx = item.name.lastIndexOf(" - ");
    if (dashIdx >= 0) {
      const label = item.name.slice(dashIdx + 3).trim();
      const matched = sizes.find((s) => s.label === label);
      if (matched != null && matched.oldRiyal > 0) return matched.oldRiyal;
    }
    if (meta.oldRiyal != null && meta.oldRiyal > 0) return meta.oldRiyal;
    const first = sizes[0];
    return first != null && first.oldRiyal > 0 ? first.oldRiyal : null;
  }

  return meta.oldRiyal != null && meta.oldRiyal > 0 ? meta.oldRiyal : null;
}

function CartLinePrice({ item, meta }: { item: CartItem; meta?: LinePriceMeta | null }) {
  const oldRiyal = resolveOldRiyalForLine(item, meta);
  const line = oldRiyal != null && oldRiyal > 0 ? formatDualPrice(item.price, oldRiyal) : item.price;
  return (
    <p className="mt-0.5 text-sm text-neutral-500" style={sans}>
      {line}
    </p>
  );
}

function CartSkeleton() {
  return (
    <main className="min-h-screen bg-white pb-24 pt-24 md:pb-32 md:pt-32" dir="rtl">
      <div className={`mx-auto max-w-[1920px] ${pagePaddingX}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-32 rounded bg-neutral-200" />
          <div className="h-40 rounded bg-neutral-100" />
        </div>
      </div>
    </main>
  );
}

function CartCheckoutInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentOrderId = searchParams.get("payment");

  const { items, removeFromCart, updateQuantity, subtotal, clearCart } = useCart();
  const cartSlugKey = useMemo(
    () =>
      [...new Set(items.map((i) => i.slug))]
        .sort()
        .join(","),
    [items]
  );
  const [linePriceMetaBySlug, setLinePriceMetaBySlug] = useState<Record<string, LinePriceMeta>>({});

  useEffect(() => {
    if (!cartSlugKey) {
      setLinePriceMetaBySlug({});
      return;
    }
    const slugs = cartSlugKey.split(",").filter(Boolean);
    let cancelled = false;
    void (async () => {
      const entries = await Promise.all(
        slugs.map(async (slug) => {
          try {
            const res = await fetch(`/api/products/${encodeURIComponent(slug)}`);
            if (!res.ok) return [slug, null] as const;
            const data = (await res.json()) as { oldRiyal?: unknown; sizes?: unknown };
            const rawOld = data.oldRiyal;
            const oldRiyalNum =
              typeof rawOld === "number"
                ? rawOld
                : typeof rawOld === "string"
                  ? Number(rawOld)
                  : NaN;
            const oldRiyal = Number.isFinite(oldRiyalNum) ? oldRiyalNum : null;
            const rawSizes = data.sizes;
            const sizes: ProductSizePrice[] | null = Array.isArray(rawSizes)
              ? rawSizes.filter((s): s is ProductSizePrice => {
                  return (
                    s != null &&
                    typeof s === "object" &&
                    typeof (s as ProductSizePrice).label === "string" &&
                    typeof (s as ProductSizePrice).sarPrice === "number" &&
                    typeof (s as ProductSizePrice).oldRiyal === "number"
                  );
                })
              : null;
            return [slug, { oldRiyal, sizes }] as const;
          } catch {
            return [slug, null] as const;
          }
        })
      );
      if (cancelled) return;
      const next: Record<string, LinePriceMeta> = {};
      for (const [slug, meta] of entries) {
        if (meta) next[slug] = meta;
      }
      setLinePriceMetaBySlug(next);
    })();
    return () => {
      cancelled = true;
    };
  }, [cartSlugKey]);

  const [me, setMe] = useState<MeUser | undefined>(undefined);
  const [profileAddress, setProfileAddress] = useState<ProfileAddress | null>(null);
  const [addressPanelOpen, setAddressPanelOpen] = useState(false);
  const [addressDraft, setAddressDraft] = useState<ProfileAddress>({ fullName: "", address: "", phone: "" });
  const [addressSaving, setAddressSaving] = useState(false);
  const [branchKey, setBranchKey] = useState<string>(STORE_LOCATIONS[0]?.id ?? "");
  const [cityScope, setCityScope] = useState<CityScope>("sanaa");
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("direct");
  const [paymentMethod, setPaymentMethod] = useState<"bank" | "cod">("bank");
  const [voucherInput, setVoucherInput] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState<string | null>(null);
  const [voucherError, setVoucherError] = useState<string | null>(null);
  const [placing, setPlacing] = useState(false);
  const [placeError, setPlaceError] = useState<string | null>(null);

  const [paymentOrder, setPaymentOrder] = useState<{
    _id: string;
    total: number;
    status: string;
    paymentProofUrl?: string | null;
  } | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [uploadBusy, setUploadBusy] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        const data = d as { user?: MeUser };
        setMe(data.user ?? null);
      })
      .catch(() => setMe(null));
  }, []);

  useEffect(() => {
    if (me?.role !== "customer") return;
    fetch("/api/me/profile", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;
        const profile = data as { fullName?: unknown; address?: unknown; phone?: unknown };
        const next = {
          fullName: typeof profile.fullName === "string" ? profile.fullName : "",
          address: typeof profile.address === "string" ? profile.address : "",
          phone: typeof profile.phone === "string" ? profile.phone : "",
        };
        setProfileAddress(next);
        setAddressDraft(next);
      })
      .catch(() => undefined);
  }, [me]);

  useEffect(() => {
    if (cityScope === "outside") {
      setDeliveryMethod("pickup");
      setPaymentMethod("bank");
    }
  }, [cityScope]);

  useEffect(() => {
    if (!paymentOrderId) {
      setPaymentOrder(null);
      return;
    }
    setPaymentLoading(true);
    setPaymentError(null);
    fetch(`/api/me/orders/${paymentOrderId}`, { credentials: "include" })
      .then((r) => {
        if (r.status === 401) {
          router.replace(`/login?next=${encodeURIComponent(`/cart?payment=${paymentOrderId}`)}`);
          return null;
        }
        if (!r.ok) throw new Error("Failed to load order");
        return r.json();
      })
      .then((data) => {
        const order = data as { _id?: string; total?: number; status?: string; paymentProofUrl?: string | null } | null;
        if (order?._id) {
          setPaymentOrder({
            _id: order._id,
            total: Number(order.total ?? 0),
            status: order.status ?? "",
            paymentProofUrl: order.paymentProofUrl ?? null,
          });
        }
      })
      .catch(() => setPaymentError("تعذر تحميل الطلب."))
      .finally(() => setPaymentLoading(false));
  }, [paymentOrderId, router]);

  const placeOrder = useCallback(async () => {
    const needsBranch = cityScope === "outside" || deliveryMethod === "pickup";
    const needsAddress = cityScope === "sanaa" && deliveryMethod === "direct";
    const normalizedPaymentMethod = cityScope === "outside" ? "bank" : paymentMethod;
    if ((needsBranch && !branchKey) || items.length === 0) return;
    if (needsAddress && !profileAddress?.address?.trim()) {
      setPlaceError("أضيفي عنوان التوصيل داخل صنعاء أولاً.");
      setAddressPanelOpen(true);
      return;
    }
    setPlacing(true);
    setPlaceError(null);
    try {
      const res = await fetch("/api/me/orders", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          branchKey: needsBranch ? branchKey : null,
          cityScope,
          deliveryMethod,
          paymentMethod: normalizedPaymentMethod,
          address: needsAddress ? profileAddress : null,
          ...(appliedVoucher ? { discountCode: appliedVoucher } : {}),
          items: items.map((i) => ({
            slug: i.slug,
            name: i.name,
            price: i.price,
            quantity: i.quantity,
            image: i.image,
          })),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { _id?: string; error?: string };
      if (res.status === 401) {
        router.push(`/login?next=${encodeURIComponent("/cart")}`);
        return;
      }
      if (!res.ok) {
        const err = typeof data.error === "string" ? data.error : "";
        throw new Error(err || "تعذر إنشاء الطلب");
      }
      clearCart();
      if (normalizedPaymentMethod === "cod") {
        router.replace("/profile");
      } else {
        router.replace(`/cart?payment=${data._id}`);
      }
    } catch (e) {
      setPlaceError(e instanceof Error ? e.message : "خطأ");
    } finally {
      setPlacing(false);
    }
  }, [branchKey, cityScope, deliveryMethod, items, clearCart, router, paymentMethod, appliedVoucher, profileAddress]);

  const checkoutTotals = useMemo(
    () => applyCheckoutDiscount(subtotal, appliedVoucher ?? undefined),
    [subtotal, appliedVoucher]
  );

  const uploadSlip = async (file: File) => {
    if (!paymentOrderId || !paymentOrder) return;
    setUploadBusy(true);
    setPaymentError(null);
    try {
      const fd = new FormData();
      fd.set("file", file);
      const up = await fetch("/api/me/upload", { method: "POST", body: fd, credentials: "include" });
      const upData = (await up.json().catch(() => ({}))) as { error?: string; url?: string };
      if (!up.ok) {
        const err = typeof upData.error === "string" ? upData.error : "";
        throw new Error(err || "فشل رفع الملف");
      }
      const url = typeof upData.url === "string" ? upData.url : "";
      if (!url) throw new Error("فشل رفع الملف");

      const patch = await fetch(`/api/me/orders/${paymentOrderId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentProofUrl: url }),
      });
      const pData = (await patch.json().catch(() => ({}))) as { _id?: string; total?: number; status?: string; paymentProofUrl?: string | null; error?: string };
      if (!patch.ok) {
        const err = typeof pData.error === "string" ? pData.error : "";
        throw new Error(err || "تعذر حفظ إثبات الدفع");
      }
      setPaymentOrder({
        _id: pData._id ?? paymentOrderId,
        total: Number(pData.total ?? 0),
        status: pData.status ?? "",
        paymentProofUrl: pData.paymentProofUrl ?? null,
      });
    } catch (e) {
      setPaymentError(e instanceof Error ? e.message : "خطأ");
    } finally {
      setUploadBusy(false);
    }
  };

  const saveAddressDraft = async () => {
    setAddressSaving(true);
    setPlaceError(null);
    try {
      const res = await fetch("/api/me/profile", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: addressDraft.fullName,
          address: addressDraft.address,
          phone: addressDraft.phone,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { fullName?: string; address?: string; phone?: string; error?: string };
      if (!res.ok) throw new Error(data.error || "تعذر حفظ العنوان");
      const next = {
        fullName: data.fullName ?? addressDraft.fullName,
        address: data.address ?? addressDraft.address,
        phone: data.phone ?? addressDraft.phone,
      };
      setProfileAddress(next);
      setAddressDraft(next);
      setAddressPanelOpen(false);
    } catch (e) {
      setPlaceError(e instanceof Error ? e.message : "تعذر حفظ العنوان");
    } finally {
      setAddressSaving(false);
    }
  };

  const isCustomer = me?.role === "customer";
  const showPaymentStep = Boolean(paymentOrderId);

  if (me === undefined) {
    return <CartSkeleton />;
  }

  if (showPaymentStep) {
    return (
      <main className="min-h-screen bg-white pb-24 pt-24 md:pb-32 md:pt-32" dir="rtl">
        <div className={`mx-auto max-w-2xl ${pagePaddingX}`}>
          <p className="text-xs text-neutral-500" style={sans}>
            الدفع
          </p>
          <h1 className="mt-2 text-3xl font-medium text-neutral-900 md:text-4xl" style={sans}>
            إتمام الدفع
          </h1>
          <p className="mt-2 text-sm text-neutral-600" style={sans}>
            حوّل المبلغ إلى حسابنا، ثم ارفع صورة إثبات التحويل. اذكر رقم الطلب في وصف التحويل إن أمكن.
          </p>

          {paymentLoading ? (
            <div className="mt-10 animate-pulse space-y-4">
              <div className="h-32 rounded-xl bg-neutral-100" />
              <div className="h-24 rounded-xl bg-neutral-100" />
            </div>
          ) : paymentError && !paymentOrder ? (
            <p className="mt-8 text-red-600" style={sans}>
              {paymentError}
            </p>
          ) : paymentOrder ? (
            <div className="mt-10 space-y-8">
              <section className="rounded-2xl border border-neutral-200 bg-[#FCF0F2]/40 p-6">
                <p className="mt-4 text-sm text-neutral-700" style={sans}>
                  المبلغ المستحق:{" "}
                  <span className="font-semibold text-neutral-900">{formatSar(Number(paymentOrder.total))}</span>
                </p>
              </section>

              <section className="rounded-2xl border border-neutral-200 bg-white p-6">
                <h2 className="text-lg font-semibold text-neutral-900" style={sans}>
                  بيانات التحويل البنكي
                </h2>
                <dl className="mt-4 space-y-3 text-sm" style={sans}>
                  <div>
                    <dt className="text-neutral-500">البنك</dt>
                    <dd className="font-medium text-neutral-900">{BANK_TRANSFER_INFO.bankName}</dd>
                  </div>
                  <div>
                    <dt className="text-neutral-500">اسم الحساب</dt>
                    <dd className="font-medium text-neutral-900">{BANK_TRANSFER_INFO.accountName}</dd>
                  </div>
                  <div>
                    <dt className="text-neutral-500">الآيبان (IBAN)</dt>
                    <dd className="font-mono text-right text-neutral-900" dir="ltr">
                      {BANK_TRANSFER_INFO.iban}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-neutral-500">رقم الحساب</dt>
                    <dd className="font-mono text-right text-neutral-900" dir="ltr">
                      {BANK_TRANSFER_INFO.accountNumber}
                    </dd>
                  </div>
                </dl>
                <p className="mt-4 text-xs text-neutral-600" style={sans}>
                  {BANK_TRANSFER_INFO.referenceHint}
                </p>
              </section>

              {paymentError ? (
                <p className="text-sm text-red-600" role="alert">
                  {paymentError}
                </p>
              ) : null}

              <section className="rounded-2xl border border-neutral-200 bg-white p-6">
                <h2 className="text-lg font-semibold text-neutral-900" style={sans}>
                  إثبات الدفع
                </h2>
                {paymentOrder.paymentProofUrl ? (
                  <div className="mt-4 space-y-4">
                    <p className="text-sm text-emerald-700" style={sans}>
                      تم رفع إثبات الدفع. سنراجع الطلب قريباً.
                    </p>
                    <div className="relative max-h-80 w-full overflow-hidden rounded-xl border border-neutral-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={paymentOrder.paymentProofUrl}
                        alt="إثبات الدفع"
                        className="max-h-80 w-full object-contain"
                      />
                    </div>
                    <label className="inline-flex cursor-pointer text-sm text-neutral-600 underline">
                      <input
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        disabled={uploadBusy}
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          e.target.value = "";
                          if (f) void uploadSlip(f);
                        }}
                      />
                      {uploadBusy ? "جاري الرفع…" : "استبدال الصورة"}
                    </label>
                  </div>
                ) : (
                  <div className="mt-4">
                    <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50 px-6 py-10 transition-colors hover:border-neutral-400">
                      <input
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        disabled={uploadBusy}
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          e.target.value = "";
                          if (f) void uploadSlip(f);
                        }}
                      />
                      <span className="text-sm font-medium text-neutral-800" style={sans}>
                        {uploadBusy ? "جاري الرفع…" : "اضغط لرفع صورة الحوالة أو الإيصال"}
                      </span>
                      <span className="mt-1 text-xs text-neutral-500">PNG، JPG، WebP</span>
                    </label>
                  </div>
                )}
              </section>

              <div className="flex flex-wrap gap-4">
                <Link
                  href="/profile"
                  className="inline-flex rounded-full border border-neutral-900 bg-neutral-900 px-6 py-3 text-sm font-semibold text-white"
                  style={sans}
                >
                  طلباتي
                </Link>
                <Link href="/shop" className="inline-flex text-sm text-neutral-600 underline" style={sans}>
                  متابعة التسوق
                </Link>
              </div>
            </div>
          ) : null}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white pb-24 pt-24 md:pb-32 md:pt-32" dir="rtl">
      <div className={`mx-auto max-w-[1920px] ${pagePaddingX}`}>
        <div className="mb-8">
          <p className="text-xs text-neutral-500" style={sans}>
            السلة
          </p>
          <h1 className="mt-2 text-3xl font-medium text-neutral-900 md:text-4xl" style={sans}>
            سلّتك
          </h1>
        </div>

        {items.length === 0 ? (
          <div className="py-16 text-center">
            <p className="mb-6 text-neutral-600" style={sans}>
              السلة فارغة.
            </p>
            <Link
              href="/shop"
              className="inline-block rounded-full border border-neutral-900 bg-neutral-900 px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-neutral-800"
              style={sans}
            >
              متابعة التسوق
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-12 lg:flex-row lg:gap-16">
            <div className="flex-1 space-y-8">
              {items.map((item) => (
                <div key={item.slug} className="flex gap-6 border-b border-neutral-100 pb-8">
                  <div className="relative h-40 w-36 shrink-0 overflow-hidden rounded-xl md:h-48 md:w-40">
                    <SafeImage src={item.image} alt={item.name} fill className="object-contain p-1" sizes="160px" />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col justify-between">
                    <div className="flex justify-between gap-4">
                      <div>
                        <h2 className="text-base font-semibold text-neutral-900" style={sans}>
                          {item.name}
                        </h2>
                        <CartLinePrice item={item} meta={linePriceMetaBySlug[item.slug]} />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.slug)}
                        className="shrink-0 text-xs text-neutral-400 transition-colors hover:text-black"
                        style={sans}
                        aria-label={`إزالة ${item.name} من السلة`}
                      >
                        إزالة
                      </button>
                    </div>
                    <div className="mt-4 flex items-center gap-4">
                      <label htmlFor={`qty-${item.slug}`} className="text-xs text-neutral-500" style={sans}>
                        الكمية
                      </label>
                      <QuantitySelectDropdown
                        id={`qty-${item.slug}`}
                        value={item.quantity}
                        onChange={(n) => updateQuantity(item.slug, n)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="shrink-0 lg:w-96">
              <div className="sticky top-32 space-y-8 pt-2">
                <div>
                  <p className="text-xs font-medium text-neutral-500" style={sans}>
                    المبالغ
                  </p>
                  <dl className="mt-3 space-y-2 text-sm" style={sans}>
                    <div className="flex justify-between gap-4 text-neutral-700">
                      <dt>المجموع الفرعي</dt>
                      <dd className="font-medium tabular-nums text-neutral-900">{formatSar(subtotal)}</dd>
                    </div>
                    {checkoutTotals.discountAmount > 0 ? (
                      <div className="flex justify-between gap-4 text-brand-primary">
                        <dt>الخصم {appliedVoucher ? `(${appliedVoucher})` : ""}</dt>
                        <dd className="font-medium tabular-nums">− {formatSar(checkoutTotals.discountAmount)}</dd>
                      </div>
                    ) : null}
                    <div className="flex justify-between gap-4 pt-1 text-base font-semibold text-neutral-900">
                      <dt>الإجمالي</dt>
                      <dd className="tabular-nums text-brand-primary">{formatSar(checkoutTotals.total)}</dd>
                    </div>
                  </dl>
                  <p className="mt-3 text-[11px] leading-relaxed text-neutral-500" style={sans}>
                    {paymentMethod === "bank"
                      ? "يُستكمل الدفع بالتحويل إلى حسابنا بعد تأكيد الطلب."
                      : "لا يُطلب تحويل الآن؛ السداد عند الاستلام من الفرع."}
                  </p>
                </div>

                {isCustomer ? (
                  <div>
                    <label htmlFor="voucher-code" className="text-xs font-medium text-neutral-500" style={sans}>
                      كود الخصم
                    </label>
                    <div className="mt-2 flex gap-2">
                      <input
                        id="voucher-code"
                        type="text"
                        value={voucherInput}
                        onChange={(e) => {
                          setVoucherInput(e.target.value);
                          setVoucherError(null);
                        }}
                        placeholder="أدخلي الكود"
                        className="min-w-0 flex-1 rounded-xl bg-neutral-50 px-3 py-2.5 text-sm text-neutral-900 outline-none ring-1 ring-neutral-200/80 transition-shadow placeholder:text-neutral-400 focus:ring-2 focus:ring-brand-primary/35"
                        style={sans}
                        autoComplete="off"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setVoucherError(null);
                          const raw = voucherInput.trim();
                          if (!raw) {
                            setAppliedVoucher(null);
                            return;
                          }
                          const r = applyCheckoutDiscount(subtotal, raw);
                          if (!r.appliedCode) {
                            setVoucherError("كود الخصم غير صالح");
                            setAppliedVoucher(null);
                            return;
                          }
                          setAppliedVoucher(r.appliedCode);
                          setVoucherInput("");
                        }}
                        className="shrink-0 rounded-xl px-4 py-2.5 text-[13px] font-semibold text-brand-primary ring-1 ring-brand-primary transition-colors hover:bg-brand-light"
                        style={sans}
                      >
                        تطبيق
                      </button>
                    </div>
                    {appliedVoucher ? (
                      <button
                        type="button"
                        onClick={() => {
                          setAppliedVoucher(null);
                          setVoucherInput("");
                          setVoucherError(null);
                        }}
                        className="mt-2 text-[11px] text-neutral-500 underline-offset-2 hover:text-brand-primary hover:underline"
                        style={sans}
                      >
                        إزالة الكود
                      </button>
                    ) : null}
                    {voucherError ? (
                      <p className="mt-2 text-xs text-red-600" role="alert">
                        {voucherError}
                      </p>
                    ) : null}
                  </div>
                ) : null}

                {!isCustomer ? (
                  <div className="space-y-3">
                    <p className="text-sm text-neutral-600" style={sans}>
                      سجّلي الدخول لإتمام الطلب واختيار الفرع وطريقة الدفع.
                    </p>
                    <Link
                      href={`/login?next=${encodeURIComponent("/cart")}`}
                      className="qgb-btn-primary flex w-full justify-center"
                      style={sans}
                    >
                      تسجيل الدخول
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div>
                      <p className="mb-2 text-xs font-medium text-neutral-500" style={sans}>
                        المدينة
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setCityScope("sanaa")}
                          className={`rounded-xl px-3 py-3 text-sm ring-1 transition-colors ${
                            cityScope === "sanaa"
                              ? "bg-brand-light text-brand-primary ring-brand-primary"
                              : "bg-neutral-50 text-neutral-700 ring-neutral-200/80 hover:ring-neutral-300"
                          }`}
                          style={sans}
                        >
                          داخل صنعاء
                        </button>
                        <button
                          type="button"
                          onClick={() => setCityScope("outside")}
                          className={`rounded-xl px-3 py-3 text-sm ring-1 transition-colors ${
                            cityScope === "outside"
                              ? "bg-brand-light text-brand-primary ring-brand-primary"
                              : "bg-neutral-50 text-neutral-700 ring-neutral-200/80 hover:ring-neutral-300"
                          }`}
                          style={sans}
                        >
                          خارج صنعاء
                        </button>
                      </div>
                    </div>

                    {cityScope === "sanaa" ? (
                      <div>
                        <p className="mb-2 text-xs font-medium text-neutral-500" style={sans}>
                          طريقة الاستلام
                        </p>
                        <div className="grid gap-2">
                          <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-neutral-50 px-3 py-3 ring-1 ring-neutral-200/80">
                            <input
                              type="radio"
                              name="delivery-method"
                              checked={deliveryMethod === "direct"}
                              onChange={() => setDeliveryMethod("direct")}
                              className="mt-1 size-4 accent-brand-primary"
                            />
                            <span className="text-sm text-neutral-800" style={sans}>
                              <span className="font-medium text-neutral-900">توصيل مباشر داخل صنعاء</span>
                              <span className="mt-1 block text-xs text-neutral-500">سنستخدم عنوانك المحفوظ للتوصيل.</span>
                            </span>
                          </label>
                          <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-neutral-50 px-3 py-3 ring-1 ring-neutral-200/80">
                            <input
                              type="radio"
                              name="delivery-method"
                              checked={deliveryMethod === "pickup"}
                              onChange={() => setDeliveryMethod("pickup")}
                              className="mt-1 size-4 accent-brand-primary"
                            />
                            <span className="text-sm text-neutral-800" style={sans}>
                              <span className="font-medium text-neutral-900">استلام من نقطة بيع</span>
                              <span className="mt-1 block text-xs text-neutral-500">اختاري نقطة البيع المناسبة لك.</span>
                            </span>
                          </label>
                        </div>
                      </div>
                    ) : (
                      <p className="rounded-xl bg-neutral-50 px-3 py-3 text-xs leading-6 text-neutral-600 ring-1 ring-neutral-200/80" style={sans}>
                        خارج صنعاء: الدفع يكون بتحويل بنكي فقط، والاستلام من نقاط البيع.
                      </p>
                    )}

                    {cityScope === "sanaa" && deliveryMethod === "direct" ? (
                      <div className="rounded-xl bg-neutral-50 p-3 ring-1 ring-neutral-200/80">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0" style={sans}>
                            <p className="text-xs font-medium text-neutral-500">عنوان التوصيل</p>
                            <p className="mt-1 whitespace-pre-wrap text-sm text-neutral-900">
                              {profileAddress?.address?.trim() || "لا يوجد عنوان محفوظ."}
                            </p>
                            {profileAddress?.phone ? <p className="mt-1 text-xs text-neutral-500">{profileAddress.phone}</p> : null}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setAddressDraft(profileAddress ?? { fullName: "", address: "", phone: "" });
                              setAddressPanelOpen(true);
                            }}
                            className="shrink-0 rounded-full border border-brand-primary px-3 py-1.5 text-xs font-semibold text-brand-primary hover:bg-brand-light"
                            style={sans}
                          >
                            {profileAddress?.address?.trim() ? "تغيير" : "إضافة"}
                          </button>
                        </div>
                      </div>
                    ) : null}

                    <div>
                      {(cityScope === "outside" || deliveryMethod === "pickup") ? (
                        <>
                          <label htmlFor="branch" className="mb-2 block text-xs font-medium text-neutral-500" style={sans}>
                            نقطة البيع للاستلام
                          </label>
                          <BranchSelectDropdown id="branch" value={branchKey} onChange={setBranchKey} />
                          <p className="mt-2 text-[11px] leading-relaxed text-neutral-500" style={sans}>
                            اختاري نقطة البيع التي تريدين استلام الطلب منها.
                          </p>
                        </>
                      ) : null}
                    </div>

                    <div>
                      <p className="text-xs font-medium text-neutral-500" style={sans}>
                        طريقة الدفع
                      </p>
                      <p className="mt-1 text-[11px] text-neutral-400" style={sans}>
                        {cityScope === "outside"
                          ? "خارج صنعاء متاح التحويل البنكي فقط."
                          : "داخل صنعاء يمكنك اختيار التحويل أو الدفع عند الاستلام."}
                      </p>
                      <div className="mt-4 space-y-3">
                        <label className="flex cursor-pointer items-start gap-3 text-start">
                          <input
                            type="radio"
                            name="checkout-payment"
                            checked={paymentMethod === "bank"}
                            onChange={() => setPaymentMethod("bank")}
                            className="mt-1 size-4 shrink-0 accent-brand-primary"
                          />
                          <span className="text-sm leading-snug text-neutral-800" style={sans}>
                            <span className="font-medium text-neutral-900">تحويل بنكي</span>
                            <span className="mt-1 block text-[13px] font-normal text-neutral-500">
                              بعد تأكيد الطلب ستجدين بيانات الحساب لإتمام التحويل ورفع إثبات الدفع.
                            </span>
                          </span>
                        </label>
                        {cityScope === "sanaa" ? (
                          <label className="flex cursor-pointer items-start gap-3 text-start">
                            <input
                              type="radio"
                              name="checkout-payment"
                              checked={paymentMethod === "cod"}
                              onChange={() => setPaymentMethod("cod")}
                              className="mt-1 size-4 shrink-0 accent-brand-primary"
                            />
                            <span className="text-sm leading-snug text-neutral-800" style={sans}>
                              <span className="font-medium text-neutral-900">الدفع عند الاستلام</span>
                              <span className="mt-1 block text-[13px] font-normal text-neutral-500">
                                الدفع نقداً عند استلام الطلب.
                              </span>
                            </span>
                          </label>
                        ) : null}
                      </div>
                    </div>
                    {placeError ? (
                      <p className="text-sm text-red-600" role="alert">
                        {placeError}
                      </p>
                    ) : null}
                    <button
                      type="button"
                      disabled={placing || !branchKey}
                      onClick={() => void placeOrder()}
                      className="qgb-btn-primary flex w-full justify-center disabled:pointer-events-none disabled:opacity-45"
                      style={sans}
                    >
                      {placing ? "جاري إنشاء الطلب…" : "تأكيد الطلب"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      {addressPanelOpen ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[60] bg-black/40"
            aria-label="إغلاق"
            onClick={() => setAddressPanelOpen(false)}
          />
          <aside className="fixed inset-x-0 bottom-0 z-[70] flex max-h-[85vh] flex-col rounded-t-2xl border-t border-black/10 bg-white shadow-2xl md:inset-x-auto md:bottom-0 md:left-0 md:top-0 md:h-full md:max-h-none md:w-full md:max-w-md md:rounded-none md:border-l md:border-t-0">
            <div className="flex shrink-0 items-center justify-between gap-3 px-4 py-3">
              <h2 className="text-lg font-semibold text-neutral-900" style={sans}>
                عنوان التوصيل
              </h2>
              <button type="button" onClick={() => setAddressPanelOpen(false)} className="rounded-sm p-2 text-neutral-600 hover:opacity-70">
                إغلاق
              </button>
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4" style={sans}>
              {profileAddress?.address?.trim() ? (
                <button
                  type="button"
                  onClick={() => {
                    setAddressDraft(profileAddress);
                    setAddressPanelOpen(false);
                  }}
                  className="w-full rounded-xl border border-brand-primary bg-brand-light/25 p-4 text-right text-sm text-neutral-900"
                >
                  <span className="block font-semibold">العنوان المحفوظ</span>
                  <span className="mt-1 block whitespace-pre-wrap text-neutral-700">{profileAddress.address}</span>
                  {profileAddress.phone ? <span className="mt-1 block text-xs text-neutral-500">{profileAddress.phone}</span> : null}
                </button>
              ) : null}
              <div>
                <label className="mb-1 block text-xs text-neutral-500">الاسم</label>
                <input
                  value={addressDraft.fullName}
                  onChange={(e) => setAddressDraft((prev) => ({ ...prev, fullName: e.target.value }))}
                  className="w-full rounded-xl bg-neutral-50 px-3 py-2.5 text-sm ring-1 ring-neutral-200/80 outline-none focus:ring-2 focus:ring-brand-primary/35"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-neutral-500">رقم الهاتف</label>
                <input
                  value={addressDraft.phone}
                  onChange={(e) => setAddressDraft((prev) => ({ ...prev, phone: e.target.value }))}
                  className="w-full rounded-xl bg-neutral-50 px-3 py-2.5 text-sm ring-1 ring-neutral-200/80 outline-none focus:ring-2 focus:ring-brand-primary/35"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-neutral-500">العنوان داخل صنعاء</label>
                <textarea
                  value={addressDraft.address}
                  onChange={(e) => setAddressDraft((prev) => ({ ...prev, address: e.target.value }))}
                  className="min-h-28 w-full rounded-xl bg-neutral-50 px-3 py-2.5 text-sm ring-1 ring-neutral-200/80 outline-none focus:ring-2 focus:ring-brand-primary/35"
                  placeholder="الحي، الشارع، أقرب معلم..."
                />
              </div>
              <button
                type="button"
                onClick={() => void saveAddressDraft()}
                disabled={addressSaving || !addressDraft.address.trim()}
                className="qgb-btn-primary flex w-full justify-center disabled:pointer-events-none disabled:opacity-45"
              >
                {addressSaving ? "جاري الحفظ..." : "حفظ واستخدام العنوان"}
              </button>
            </div>
          </aside>
        </>
      ) : null}
    </main>
  );
}

export default function CartPage() {
  return (
    <Suspense fallback={<CartSkeleton />}>
      <CartCheckoutInner />
    </Suspense>
  );
}
