"use client";

import Link from "next/link";
import { SafeImage } from "@/app/components/SafeImage";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Package, Banknote, MapPin } from "lucide-react";
import { sans, pagePaddingX } from "@/lib/page-theme";
import { ProfileBreadcrumb, ProfileAccountNav, profileAccentIcon } from "@/app/components/profile/ProfileAccountChrome";
import { getStoreLocationById } from "@/lib/store-locations";
import { formatSar } from "@/lib/format-sar";
import { formatDualPrice } from "@/lib/price-format";

type OrderItem = { slug?: string; name?: string; price?: string; quantity?: number; image?: string };
type ShippingAddress = Record<string, unknown>;
type LinePriceMeta = { oldRiyal: number | null };

type OrderDetail = {
  _id: string;
  status: string;
  total: number;
  items: OrderItem[];
  createdAt?: string;
  branchKey?: string | null;
  paymentProofUrl?: string | null;
  trackingNumber?: string;
  carrier?: string;
  shippedAt?: string | null;
  shippingAddress?: ShippingAddress;
};

function statusAr(s: string) {
  const m: Record<string, string> = {
    pending: "في انتظار الدفع",
    paid: "مدفوع",
    shipped: "تم الشحن",
    cancelled: "ملغاة",
  };
  return m[s] ?? s;
}

export default function ProfileOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [user, setUser] = useState<{ username: string; role: string } | null>(null);
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [linePriceMetaBySlug, setLinePriceMetaBySlug] = useState<Record<string, LinePriceMeta>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        const auth = data as { user?: { username: string; role: string } | null };
        const u = auth.user ?? null;
        setUser(u);
        if (!u) {
          router.replace("/login");
          return;
        }
        if (u.role === "admin") {
          router.replace("/admin");
          return;
        }
        if (!id) return;
        return fetch(`/api/me/orders/${id}`, { credentials: "include" });
      })
      .then((res) => {
        if (!res) return;
        if (res.status === 401) {
          router.replace("/login");
          return;
        }
        if (!res.ok) {
          setError("تعذر تحميل الطلب.");
          return;
        }
        return res.json();
      })
      .then((data) => {
        if (data) setOrder(data as OrderDetail);
      })
      .catch(() => setError("حدث خطأ."))
      .finally(() => setLoading(false));
  }, [id, router]);

  useEffect(() => {
    const slugs = [...new Set((order?.items ?? []).map((item) => item.slug).filter((slug): slug is string => Boolean(slug)))];
    if (slugs.length === 0) {
      setLinePriceMetaBySlug({});
      return;
    }
    let cancelled = false;
    void (async () => {
      const entries = await Promise.all(
        slugs.map(async (slug) => {
          try {
            const res = await fetch(`/api/products/${encodeURIComponent(slug)}`);
            if (!res.ok) return [slug, null] as const;
            const data = (await res.json()) as { oldRiyal?: unknown };
            const oldRiyal = typeof data.oldRiyal === "number" ? data.oldRiyal : data.oldRiyal ? Number(data.oldRiyal) : null;
            return [slug, { oldRiyal: Number.isFinite(oldRiyal) ? oldRiyal : null }] as const;
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
  }, [order?.items]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-white pb-24 pt-24 md:pb-32 md:pt-32" dir="rtl">
        <div className={`mx-auto w-full max-w-[1920px] ${pagePaddingX}`}>
          <p className="text-neutral-500" style={sans}>
            جاري التحميل…
          </p>
        </div>
      </main>
    );
  }

  if (!user || user.role === "admin") return null;

  if (error || !order) {
    return (
      <main className="min-h-screen bg-white pb-24 pt-24 md:pb-32 md:pt-32" dir="rtl">
        <div className={`mx-auto w-full max-w-[1920px] ${pagePaddingX}`}>
          <ProfileBreadcrumb
            items={[
              { label: "الرئيسية", href: "/" },
              { label: "حسابي", href: "/profile" },
              { label: "طلباتي", href: "/profile" },
              { label: "الطلب" },
            ]}
          />
          <p className="text-red-600" style={sans}>
            {error ?? "الطلب غير موجود."}
          </p>
          <Link href="/profile" className="mt-4 inline-block text-sm text-[#B63A6B] underline" style={sans}>
            العودة إلى طلباتي
          </Link>
        </div>
      </main>
    );
  }

  const branch = order.branchKey ? getStoreLocationById(order.branchKey) : undefined;
  const shortId = String(order._id).slice(-8);

  return (
    <main className="min-h-screen bg-white pb-24 pt-24 md:pb-32 md:pt-32" dir="rtl">
      <div className={`mx-auto w-full max-w-[1920px] ${pagePaddingX}`}>
        <ProfileBreadcrumb
          items={[
            { label: "الرئيسية", href: "/" },
            { label: "حسابي", href: "/profile" },
            { label: "طلباتي", href: "/profile" },
            { label: `طلب ${shortId}` },
          ]}
        />

        <div className="flex flex-col gap-10 lg:flex-row lg:gap-12">
          <aside className="w-full shrink-0 lg:w-56">
            <ProfileAccountNav current="orders" onLogout={handleLogout} />
          </aside>

          <div className="min-w-0 flex-1 space-y-6">
            <div>
              <h1 className="text-2xl font-medium text-neutral-900 md:text-3xl" style={sans}>
                تفاصيل الطلب
              </h1>
              <p className="mt-1 text-sm text-neutral-500" style={sans}>
                رقم الطلب الكامل متاح للدفع والمراسلات
              </p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/[0.04] md:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-xs text-neutral-400" dir="ltr">
                    {order._id}
                  </p>
                  <p className="mt-2 text-sm text-neutral-600" style={sans}>
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleDateString("ar-SA", { dateStyle: "long" })
                      : "—"}
                  </p>
                </div>
                <span
                  className={`inline-flex rounded-full px-4 py-1.5 text-xs font-medium ${
                    order.status === "shipped"
                      ? "bg-emerald-50 text-emerald-800"
                      : order.status === "cancelled"
                        ? "bg-red-50 text-red-800"
                        : order.status === "paid"
                          ? "bg-[#FCF0F2] text-[#8B2D52]"
                          : "bg-neutral-100 text-neutral-800"
                  }`}
                  style={sans}
                >
                  {statusAr(order.status)}
                </span>
              </div>
              <p className="mt-6 text-lg font-medium text-neutral-900" style={sans}>
                الإجمالي: {formatSar(Number(order.total))}
              </p>

              {branch ? (
                <div className="mt-6 flex items-start gap-3 rounded-xl bg-[#FCF0F2]/50 p-4">
                  <MapPin className={`mt-0.5 h-5 w-5 ${profileAccentIcon}`} strokeWidth={1.35} />
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-neutral-500" style={sans}>
                      الفرع
                    </p>
                    <p className="mt-0.5 text-sm text-neutral-900" style={sans}>
                      {branch.name}
                    </p>
                  </div>
                </div>
              ) : null}

              {order.status === "pending" && !order.paymentProofUrl ? (
                <div className="mt-6">
                  <Link
                    href={`/cart?payment=${order._id}`}
                    className="inline-flex rounded-full bg-[#B63A6B] px-6 py-3 text-sm font-semibold text-white transition-[filter] hover:brightness-110"
                    style={sans}
                  >
                    إتمام الدفع ورفع إثبات التحويل
                  </Link>
                </div>
              ) : null}
            </div>

            {(order.trackingNumber || order.carrier || order.shippedAt) && order.status !== "cancelled" ? (
              <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/[0.04] md:p-8">
                <h2 className="flex items-center gap-2 text-lg font-medium text-neutral-900" style={sans}>
                  <Package className={profileAccentIcon} strokeWidth={1.35} />
                  الشحن والتتبع
                </h2>
                <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
                  {order.carrier ? (
                    <div>
                      <dt className="text-neutral-500" style={sans}>
                        الناقل
                      </dt>
                      <dd className="mt-0.5 font-medium" style={sans}>
                        {order.carrier}
                      </dd>
                    </div>
                  ) : null}
                  {order.trackingNumber ? (
                    <div>
                      <dt className="text-neutral-500" style={sans}>
                        رقم التتبع
                      </dt>
                      <dd className="mt-0.5 font-mono" dir="ltr">
                        {order.trackingNumber}
                      </dd>
                    </div>
                  ) : null}
                  {order.shippedAt ? (
                    <div>
                      <dt className="text-neutral-500" style={sans}>
                        تاريخ الشحن
                      </dt>
                      <dd className="mt-0.5" style={sans}>
                        {new Date(order.shippedAt).toLocaleDateString("ar-SA", { dateStyle: "medium" })}
                      </dd>
                    </div>
                  ) : null}
                </dl>
              </div>
            ) : null}

            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/[0.04] md:p-8">
              <h2 className="flex items-center gap-2 text-lg font-medium text-neutral-900" style={sans}>
                <Package className={profileAccentIcon} strokeWidth={1.35} />
                المنتجات
              </h2>
              {order.items?.length ? (
                <ul className="mt-6 space-y-4">
                  {order.items.map((it, i) => {
                    const meta = it.slug ? linePriceMetaBySlug[it.slug] : undefined;
                    const priceLine = it.price ? formatDualPrice(it.price, meta?.oldRiyal) : "";
                    return (
                      <li key={i} className="flex gap-4">
                        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[#FCF0F2]">
                          {it.image ? (
                            <SafeImage src={it.image} alt="" fill className="object-contain p-1" sizes="80px" />
                          ) : null}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-neutral-900" style={sans}>
                            {it.name ?? "—"}
                          </p>
                          <p className="mt-0.5 text-sm text-neutral-500" style={sans}>
                            {priceLine} × {it.quantity ?? 0}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="mt-4 text-sm text-neutral-500" style={sans}>
                  لا توجد بنود.
                </p>
              )}
            </div>

            {order.paymentProofUrl ? (
              <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/[0.04] md:p-8">
                <h2 className="flex items-center gap-2 text-lg font-medium text-neutral-900" style={sans}>
                  <Banknote className={profileAccentIcon} strokeWidth={1.35} />
                  إثبات الدفع
                </h2>
                <div className="relative mt-4 max-h-96 w-full overflow-hidden rounded-xl bg-neutral-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={order.paymentProofUrl} alt="إثبات الدفع" className="max-h-96 w-full object-contain" />
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </main>
  );
}
