"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { SafeImage } from "@/app/components/SafeImage";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart } from "@/app/context/CartContext";
import { sans, pagePaddingX } from "@/lib/page-theme";
import { ProvinceSelectDropdown } from "@/app/components/ProvinceSelectDropdown";
import { getCheckoutProvinceById, CHECKOUT_PROVINCES, isValidCheckoutProvinceId, normalizeCheckoutProvinceId } from "@/lib/checkout-provinces";
import { CHECKOUT_PICKUP_POINTS, type StoreLocation } from "@/lib/store-locations";
import { YemenPaymentStepTransferSection, YemenPreCheckoutPaymentDeliveryGuide } from "@/app/components/cart/YemenCartCheckoutSections";
import { applyCheckoutDiscount } from "@/lib/order-discount";
import { formatPriceForDisplay, formatCartSubtotalDisplay, type ProductSizePrice } from "@/lib/price-format";
import { useDisplayCurrency } from "@/app/context/CurrencyContext";
import type { CartItem } from "@/lib/cart";

type MeUser = { username: string; role: string } | null;
type ProfileAddress = { fullName: string; address: string; phone: string };
type CityScope = "sanaa" | "outside";
type DeliveryMethod = "direct" | "pickup";

function branchOptionLabel(b: StoreLocation) {
  const city = b.city.trim();
  return city ? `${b.name} — ${city}` : b.name;
}

function BranchSelectDropdown({
  id,
  value,
  onChange,
  locations,
  placeholder = "اختيار نقطة التوصيل",
}: {
  id: string;
  value: string;
  onChange: (branchId: string) => void;
  locations: StoreLocation[];
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selected = locations.find((b) => b.id === value);

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

  const label = selected ? branchOptionLabel(selected) : placeholder;

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
          {locations.map((b) => {
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
                  {branchOptionLabel(b)}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

/** Same destination as `WhatsAppFloat` — customer contact for order follow-up. */
const WHATSAPP_ORDER_CONTACT_HREF = "https://wa.me/967782183149";
const WHATSAPP_DISPLAY_NUMBER = "+967 782 183 149";

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
  const displayMode = useDisplayCurrency();
  const oldRiyal = resolveOldRiyalForLine(item, meta);
  const line = formatPriceForDisplay(displayMode, item.saudiRiyal, oldRiyal != null && oldRiyal > 0 ? oldRiyal : null);
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
  const placedOrderId = paymentOrderId ? null : searchParams.get("placed");

  const { items, removeFromCart, updateQuantity, subtotal, clearCart } = useCart();
  const displayMode = useDisplayCurrency();
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
  const [branchKey, setBranchKey] = useState<string>(CHECKOUT_PICKUP_POINTS[0]?.id ?? "");
  const [provinceId, setProvinceId] = useState<string>(CHECKOUT_PROVINCES[0]?.id ?? "sanaa");
  const cityScope = useMemo((): CityScope => getCheckoutProvinceById(provinceId)?.cityScope ?? "outside", [provinceId]);
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
  const [paymentProofDoneModalOpen, setPaymentProofDoneModalOpen] = useState(false);

  const [placedOrderSnapshot, setPlacedOrderSnapshot] = useState<{ _id: string; total: number } | null>(null);
  const [placedLoading, setPlacedLoading] = useState(false);
  const [placedError, setPlacedError] = useState<string | null>(null);

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
        const profile = data as { fullName?: unknown; address?: unknown; phone?: unknown; provinceId?: unknown };
        const next = {
          fullName: typeof profile.fullName === "string" ? profile.fullName : "",
          address: typeof profile.address === "string" ? profile.address : "",
          phone: typeof profile.phone === "string" ? profile.phone : "",
        };
        setProfileAddress(next);
        setAddressDraft(next);
        if (typeof profile.provinceId === "string" && profile.provinceId.trim() && isValidCheckoutProvinceId(profile.provinceId)) {
          setProvinceId(normalizeCheckoutProvinceId(profile.provinceId.trim()));
        }
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
    const needsPickup = cityScope === "outside" || deliveryMethod === "pickup";
    if (!needsPickup) return;
    if (!CHECKOUT_PICKUP_POINTS.some((p) => p.id === branchKey)) {
      setBranchKey(CHECKOUT_PICKUP_POINTS[0]?.id ?? "");
    }
  }, [cityScope, deliveryMethod, branchKey]);

  useEffect(() => {
    if (!paymentOrderId) {
      setPaymentOrder(null);
      setPaymentProofDoneModalOpen(false);
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

  useEffect(() => {
    if (!placedOrderId) {
      setPlacedOrderSnapshot(null);
      setPlacedError(null);
      return;
    }
    let cancelled = false;
    setPlacedLoading(true);
    setPlacedError(null);
    fetch(`/api/me/orders/${encodeURIComponent(placedOrderId)}`, { credentials: "include" })
      .then((r) => {
        if (r.status === 401) {
          router.replace(`/login?next=${encodeURIComponent(`/cart?placed=${placedOrderId}`)}`);
          return null;
        }
        if (!r.ok) throw new Error("Failed to load order");
        return r.json();
      })
      .then((data) => {
        if (cancelled || !data || typeof data !== "object") return;
        const d = data as Record<string, unknown>;
        const id = typeof d._id === "string" ? d._id : "";
        const total = typeof d.total === "number" ? d.total : Number(d.total ?? 0);
        const sa = d.shippingAddress;
        const pm =
          sa && typeof sa === "object" && typeof (sa as Record<string, unknown>).paymentMethod === "string"
            ? String((sa as Record<string, unknown>).paymentMethod)
            : "";
        if (pm === "bank") {
          router.replace(`/cart?payment=${encodeURIComponent(id)}`);
          return;
        }
        setPlacedOrderSnapshot({ _id: id, total });
      })
      .catch(() => {
        if (!cancelled) setPlacedError("تعذر تحميل الطلب.");
      })
      .finally(() => {
        if (!cancelled) setPlacedLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [placedOrderId, router]);

  useEffect(() => {
    if (!paymentProofDoneModalOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPaymentProofDoneModalOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [paymentProofDoneModalOpen]);

  const placeOrder = useCallback(async () => {
    const needsBranch = cityScope === "outside" || deliveryMethod === "pickup";
    const normalizedPaymentMethod = cityScope === "outside" ? "bank" : paymentMethod;
    if ((needsBranch && !branchKey) || items.length === 0) return;
    if (!profileAddress?.address?.trim()) {
      setPlaceError("أضف العنوان الكامل أولاً.");
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
          provinceId,
          branchKey: needsBranch ? branchKey : null,
          deliveryMethod,
          paymentMethod: normalizedPaymentMethod,
          address: profileAddress,
          ...(appliedVoucher ? { discountCode: appliedVoucher } : {}),
          items: items.map((i) => ({
            slug: i.slug,
            name: i.name,
            saudiRiyal: i.saudiRiyal,
            oldRiyal: i.oldRiyal,
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
      const newOrderId = typeof data._id === "string" ? data._id : "";
      if (!newOrderId) throw new Error("تعذر إنشاء الطلب");
      clearCart();
      if (normalizedPaymentMethod === "cod") {
        router.replace(`/cart?placed=${encodeURIComponent(newOrderId)}`);
      } else {
        router.replace(`/cart?payment=${encodeURIComponent(newOrderId)}`);
      }
    } catch (e) {
      setPlaceError(e instanceof Error ? e.message : "خطأ");
    } finally {
      setPlacing(false);
    }
  }, [branchKey, cityScope, deliveryMethod, items, clearCart, router, paymentMethod, appliedVoucher, profileAddress, provinceId]);

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
      router.push(`/payment-confirmed?orderId=${encodeURIComponent(pData._id ?? paymentOrderId)}`);
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
            حوّل المبلغ بإحدى الطرق المعروضة أدناه، ثم ارفع صورة إثبات التحويل. اذكر رقم الطلب في وصف التحويل إن أمكن.
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
                  <span className="font-semibold text-neutral-900">
                    {formatPriceForDisplay(displayMode, Number(paymentOrder.total), null)}
                  </span>
                </p>
              </section>

              <section className="rounded-2xl border border-neutral-200 bg-white p-6">
                <h2 className="text-lg font-semibold text-neutral-900" style={sans}>
                  بيانات التحويل
                </h2>
                <div className="mt-4">
                  <YemenPaymentStepTransferSection />
                </div>
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

        {paymentProofDoneModalOpen ? (
          <div className="fixed inset-0 z-[90] flex items-center justify-center p-4" dir="rtl">
            <button
              type="button"
              className="absolute inset-0 bg-black/45"
              aria-label="إغلاق"
              onClick={() => setPaymentProofDoneModalOpen(false)}
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="payment-proof-done-title"
              className="relative z-[1] w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-xl"
              style={sans}
            >
              <h2 id="payment-proof-done-title" className="text-lg font-semibold text-neutral-900">
                تم استلام طلبك
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-neutral-600">
                تم استلام إثبات الدفع. سنتواصل معك قريباً بخصوص الطلب. يمكنك أيضاً مراسلتنا على واتساب على الرقم{" "}
                <a
                  href={WHATSAPP_ORDER_CONTACT_HREF}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-brand-primary underline underline-offset-2 hover:text-brand-dark"
                  dir="ltr"
                >
                  {WHATSAPP_DISPLAY_NUMBER}
                </a>
                .
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href={WHATSAPP_ORDER_CONTACT_HREF}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex flex-1 min-w-[8rem] justify-center rounded-full border border-emerald-600 bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
                >
                  واتساب
                </a>
                <button
                  type="button"
                  onClick={() => setPaymentProofDoneModalOpen(false)}
                  className="inline-flex flex-1 min-w-[8rem] justify-center rounded-full border border-neutral-300 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-900 transition-colors hover:bg-neutral-50"
                >
                  حسناً
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </main>
    );
  }

  if (placedOrderId) {
    return (
      <main className="min-h-screen bg-white pb-24 pt-24 md:pb-32 md:pt-32" dir="rtl">
        <div className={`mx-auto max-w-2xl ${pagePaddingX}`}>
          <p className="text-xs text-neutral-500" style={sans}>
            تأكيد الطلب
          </p>
          <h1 className="mt-2 text-3xl font-medium text-neutral-900 md:text-4xl" style={sans}>
            تم استلام طلبك
          </h1>
          <p className="mt-2 text-sm text-neutral-600" style={sans}>
            شكراً لثقتك. سيتم الدفع عند الاستلام كما اخترت.
          </p>

          {placedLoading ? (
            <div className="mt-10 animate-pulse space-y-4">
              <div className="h-28 rounded-xl bg-neutral-100" />
              <div className="h-20 rounded-xl bg-neutral-100" />
            </div>
          ) : placedError ? (
            <p className="mt-8 text-red-600" style={sans}>
              {placedError}
            </p>
          ) : placedOrderSnapshot?._id ? (
            <div className="mt-10 space-y-8">
              <section className="rounded-2xl border border-emerald-200/80 bg-emerald-50/40 p-6">
                <p className="text-sm text-neutral-800" style={sans}>
                  رقم الطلب:{" "}
                  <span className="font-mono text-[13px] font-semibold tabular-nums text-neutral-900" dir="ltr">
                    #{String(placedOrderSnapshot._id).slice(-8).toUpperCase()}
                  </span>
                </p>
                <p className="mt-3 text-sm text-neutral-700" style={sans}>
                  الإجمالي:{" "}
                  <span className="font-semibold text-neutral-900">
                    {formatPriceForDisplay(displayMode, Number(placedOrderSnapshot.total), null)}
                  </span>
                </p>
                <p className="mt-4 text-sm leading-relaxed text-neutral-600" style={sans}>
                  سنُتابع تجهيز الطلب والتوصيل حسب الخيارات المحددة. يمكنك مراجعة تفاصيل الطلب في أي وقت من صفحة
                  الطلبات.
                </p>
              </section>

              <div className="flex flex-wrap gap-4">
                <Link
                  href={`/profile/orders/${encodeURIComponent(placedOrderSnapshot._id)}`}
                  className="inline-flex rounded-full border border-neutral-900 bg-neutral-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-neutral-800"
                  style={sans}
                >
                  تفاصيل الطلب
                </Link>
                <Link
                  href="/profile"
                  className="inline-flex rounded-full border border-neutral-200 bg-white px-6 py-3 text-sm font-semibold text-neutral-800 transition-colors hover:bg-neutral-50"
                  style={sans}
                >
                  طلباتي
                </Link>
                <Link href="/shop" className="inline-flex items-center text-sm text-neutral-600 underline-offset-4 hover:text-neutral-900 hover:underline" style={sans}>
                  متابعة التسوق
                </Link>
              </div>
            </div>
          ) : (
            <p className="mt-8 text-sm text-neutral-500" style={sans}>
              لم يُعثر على بيانات الطلب.
            </p>
          )}
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
                      <dd className="font-medium tabular-nums text-neutral-900">
                        {formatCartSubtotalDisplay(items, displayMode)}
                      </dd>
                    </div>
                    {checkoutTotals.discountAmount > 0 ? (
                      <div className="flex justify-between gap-4 text-brand-primary">
                        <dt>الخصم {appliedVoucher ? `(${appliedVoucher})` : ""}</dt>
                        <dd className="font-medium tabular-nums">− {formatPriceForDisplay(displayMode, checkoutTotals.discountAmount, null)}</dd>
                      </div>
                    ) : null}
                    <div className="flex justify-between gap-4 pt-1 text-base font-semibold text-neutral-900">
                      <dt>الإجمالي</dt>
                      <dd className="tabular-nums text-brand-primary">
                        {formatPriceForDisplay(displayMode, checkoutTotals.total, null)}
                      </dd>
                    </div>
                  </dl>
                  <p className="mt-3 text-[11px] leading-relaxed text-neutral-500" style={sans}>
                    {paymentMethod === "bank"
                      ? "يُستكمل الدفع بالتحويل إلى حسابنا بعد تأكيد الطلب."
                      : cityScope === "sanaa" && deliveryMethod === "direct"
                        ? "لا يُطلب تحويل الآن؛ السداد عند التوصيل إلى عنوانك."
                        : "لا يُطلب تحويل الآن؛ السداد عند الاستلام."}
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
                        placeholder="أدخل الكود"
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
                      سجّل الدخول لإتمام الطلب وتحديد المحافظة والعنوان وطريقة الدفع.
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
                      <label htmlFor="checkout-province" className="mb-2 block text-xs font-medium text-neutral-500" style={sans}>
                        المحافظة
                      </label>
                      <ProvinceSelectDropdown id="checkout-province" value={provinceId} onChange={setProvinceId} />
                      <p className="mt-2 text-[11px] leading-relaxed text-neutral-500" style={sans}>
                        يحدد اختيار المحافظة خيارات التوصيل والدفع أدناه (صنعاء: توصيل مباشر أو استلام من المكتب؛ باقي المحافظات وفق سياسة الشحن).
                      </p>
                    </div>

                    <div className="rounded-xl bg-neutral-50 p-3 ring-1 ring-neutral-200/80">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0" style={sans}>
                          <p className="text-xs font-medium text-neutral-500">العنوان التفصيلي</p>
                          <p className="mt-0.5 text-[11px] leading-relaxed text-neutral-400">
                            مطلوب لجميع الطلبات — الحي، الشارع، وأقرب معلم داخل المحافظة المختارة.
                          </p>
                          <p className="mt-2 whitespace-pre-wrap text-sm text-neutral-900">
                            {profileAddress?.address?.trim() || "لا يوجد عنوان محفوظ بعد."}
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

                    <YemenPreCheckoutPaymentDeliveryGuide />

                    {cityScope === "sanaa" ? (
                      <div>
                        <p className="mb-2 text-xs font-medium text-neutral-500" style={sans}>
                          التوصيل أو الاستلام
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
                              <span className="mt-1 block text-xs text-neutral-500">نُوصّل الطلب إلى عنوانك المحفوظ داخل المدينة.</span>
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
                              <span className="font-medium text-neutral-900">الاستلام من نقطة توصيل</span>
                              <span className="mt-1 block text-xs text-neutral-500">
                                استلم الطلب من مكتب الشحن المتاح في منطقتك.
                              </span>
                            </span>
                          </label>
                        </div>
                      </div>
                    ) : (
                      <details className="group rounded-xl bg-neutral-50 ring-1 ring-neutral-200/80" style={sans}>
                        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-semibold text-neutral-900 outline-none transition-colors hover:bg-neutral-100/80 [&::-webkit-details-marker]:hidden">
                          <span>سياسة التوصيل للمحافظات</span>
                          <ChevronDown
                            className="size-4 shrink-0 text-neutral-500 transition-transform duration-200 group-open:rotate-180"
                            strokeWidth={2}
                            aria-hidden
                          />
                        </summary>
                        <div className="border-t border-neutral-200/70 px-4 pb-4 pt-1">
                          <ul className="list-disc space-y-2 pe-1 ps-5 text-sm leading-relaxed text-neutral-600 marker:text-brand-primary/70">
                            <li>توصيل سريع: اليوم التالي أو في نفس اليوم حسب التوفر.</li>
                            <li>الدفع عند الاستلام عند استلام الشحنة من المكتب.</li>
                            <li>رسوم التوصيل للمحافظات الأخرى: 1000 ريال يمني أو 8 ريال سعودي (حسب التنسيق).</li>
                            <li>يكمّل السداد عبر تحويل بنكي حسب التنسيق معنا.</li>
                            <li>مدة التوصيل المتوقعة: ٢–٥ أيام عمل.</li>
                          </ul>
                        </div>
                      </details>
                    )}

                    <div>
                      {(cityScope === "outside" || deliveryMethod === "pickup") ? null : null}
                    </div>

                    <div>
                      <p className="text-xs font-medium text-neutral-500" style={sans}>
                        طريقة الدفع
                      </p>
                      <p className="mt-1 text-[11px] text-neutral-400" style={sans}>
                        {cityScope === "outside"
                          ? "للمحافظات غير صنعاء يتوفر التحويل البنكي فقط."
                          : "في صنعاء يمكنك اختيار التحويل أو الدفع عند الاستلام."}
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
                              بعد تأكيد الطلب ستجد بيانات الحساب لإتمام التحويل ورفع إثبات الدفع.
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
                      disabled={placing || items.length === 0}
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
                العنوان والتواصل
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
                <label className="mb-1 block text-xs text-neutral-500">العنوان التفصيلي</label>
                <textarea
                  value={addressDraft.address}
                  onChange={(e) => setAddressDraft((prev) => ({ ...prev, address: e.target.value }))}
                  className="min-h-28 w-full rounded-xl bg-neutral-50 px-3 py-2.5 text-sm ring-1 ring-neutral-200/80 outline-none focus:ring-2 focus:ring-brand-primary/35"
                  placeholder="الحي، الشارع، أقرب معلم، وفق المحافظة المختارة في السلة…"
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
