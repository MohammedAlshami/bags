import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getSession, requireCustomer } from "@/lib/auth";
import { getCheckoutProvinceById } from "@/lib/checkout-provinces";
import { isValidBranchKey } from "@/lib/store-locations";
import {
  collectSlugsFromOrderItemsJson,
  enrichOrderItemsWithCatalog,
  getOrderLineSar,
  normalizeOrderLineItems,
  orderItemsToProductSummaries,
  type CatalogLineMeta,
  type OrderLineItem,
} from "@/lib/order-line-items";
import { mapOrderAdminDetail, type OrderRow } from "@/lib/db-mappers";
import { applyCheckoutDiscount } from "@/lib/order-discount";

export const dynamic = "force-dynamic";

/** D1 may return `items` as an array or a JSON string. */
function coerceOrderItemsArray(items: unknown): unknown {
  if (Array.isArray(items)) return items;
  if (typeof items === "string" && items.trim()) {
    try {
      const parsed = JSON.parse(items) as unknown;
      return Array.isArray(parsed) ? parsed : items;
    } catch {
      return items;
    }
  }
  return items;
}

function toOrderLineArray(items: unknown): unknown[] {
  const c = coerceOrderItemsArray(items);
  return Array.isArray(c) ? c : [];
}

async function fetchCatalogLineMetaByIds(ids: string[]): Promise<Map<string, CatalogLineMeta>> {
  const map = new Map<string, CatalogLineMeta>();
  if (ids.length === 0) return map;
  const idJson = JSON.stringify(ids);
  const productRows = await sql`
    SELECT id, name, image FROM products
    WHERE id IN (SELECT value FROM json_each(${idJson}))
  `;
  for (const row of productRows) {
    const r = row as { id: unknown; name: unknown; image: unknown };
    const id = String(r.id ?? "").trim();
    if (!id) continue;
    map.set(id, {
      name: String(r.name ?? "").trim(),
      image: String(r.image ?? "").trim(),
    });
  }
  const packageRows = await sql`
    SELECT id, name, image FROM packages
    WHERE id IN (SELECT value FROM json_each(${idJson}))
  `;
  for (const row of packageRows) {
    const r = row as { id: unknown; name: unknown; image: unknown };
    const id = String(r.id ?? "").trim();
    if (!id || map.has(id)) continue;
    map.set(id, {
      name: String(r.name ?? "").trim(),
      image: String(r.image ?? "").trim(),
    });
  }
  return map;
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.role !== "customer") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const orders = await sql`
      SELECT id, items, total, status, shipping_address, payment_proof_url, tracking_number, carrier, shipped_at, created_at
      FROM orders
      WHERE customer_id = ${session.sub}::uuid
      ORDER BY created_at DESC
    `;
    const idSet = new Set<string>();
    for (const o of orders) {
      for (const id of collectSlugsFromOrderItemsJson(toOrderLineArray(o.items))) idSet.add(id);
    }
    const catalog = await fetchCatalogLineMetaByIds([...idSet]);
    return NextResponse.json(
      orders.map((o) => {
        const sa =
          o.shipping_address && typeof o.shipping_address === "object"
            ? (o.shipping_address as Record<string, unknown>)
            : {};
        const branchKey =
          typeof sa.branchKey === "string" && sa.branchKey.trim() ? sa.branchKey.trim() : null;
        const proofCol =
          o.payment_proof_url != null && String(o.payment_proof_url).trim() !== ""
            ? String(o.payment_proof_url).trim()
            : "";
        const paymentProofUrl =
          proofCol ||
          (typeof sa.paymentProofUrl === "string" && sa.paymentProofUrl.trim()
            ? sa.paymentProofUrl.trim()
            : null);
        const enrichedItems = enrichOrderItemsWithCatalog(toOrderLineArray(o.items), catalog);
        return {
          _id: o.id,
          status: o.status,
          total: o.total,
          createdAt: o.created_at,
          trackingNumber: o.tracking_number,
          carrier: o.carrier,
          shippedAt: o.shipped_at,
          items: enrichedItems,
          products: orderItemsToProductSummaries(enrichedItems),
          paymentProofUrl,
          branchKey,
        };
      })
    );
  } catch {
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireCustomer();
    const body = (await request.json()) as Record<string, unknown>;
    const provinceIdRaw = typeof body.provinceId === "string" ? body.provinceId.trim() : "";
    const province = getCheckoutProvinceById(provinceIdRaw);
    if (!province) {
      return NextResponse.json({ error: "اختيار المحافظة مطلوب" }, { status: 400 });
    }
    const cityScope = province.cityScope;
    const deliveryMethod = cityScope === "outside" ? "pickup" : body.deliveryMethod === "pickup" ? "pickup" : "direct";
    const needsBranch = cityScope === "outside" || deliveryMethod === "pickup";
    const rawBranchKey = typeof body.branchKey === "string" ? body.branchKey.trim() : "";
    const branchKey = needsBranch ? rawBranchKey : "";
    if (needsBranch && (!branchKey || !isValidBranchKey(branchKey))) {
      return NextResponse.json({ error: "Branch required" }, { status: 400 });
    }

    let items: OrderLineItem[];
    try {
      items = normalizeOrderLineItems(body.items);
    } catch {
      return NextResponse.json({ error: "Invalid items" }, { status: 400 });
    }

    const subtotal = items.reduce((sum, it) => sum + getOrderLineSar(it) * it.quantity, 0);
    const rawDiscountCode = typeof body.discountCode === "string" ? body.discountCode.trim() : "";
    const discountOutcome = applyCheckoutDiscount(subtotal, rawDiscountCode || undefined);
    if (rawDiscountCode && !discountOutcome.appliedCode) {
      return NextResponse.json({ error: "كود الخصم غير صالح" }, { status: 400 });
    }
    const total = discountOutcome.total;
    const itemsJson = JSON.stringify(items);

    const rawPm = typeof body.paymentMethod === "string" ? body.paymentMethod.trim().toLowerCase() : "";
    const paymentMethod = cityScope === "outside" ? "bank" : rawPm === "cod" ? "cod" : "bank";
    const submittedAddress =
      body.address && typeof body.address === "object" ? (body.address as Record<string, unknown>) : null;

    const userRows = await sql`
      SELECT address, full_name, phone FROM users WHERE id = ${session.sub}::uuid AND role = 'customer' LIMIT 1
    `;
    const u = userRows[0] as { address: string; full_name: string; phone: string } | undefined;
    const addressLine = String(submittedAddress?.address ?? u?.address ?? "").trim();
    if (!addressLine) {
      return NextResponse.json({ error: "العنوان مطلوب" }, { status: 400 });
    }
    const shippingAddress = {
      fullName: String(submittedAddress?.fullName ?? u?.full_name ?? ""),
      line1: addressLine,
      line2: "",
      city: province.label,
      provinceId: province.id,
      state: "",
      postCode: "",
      country: "YE",
      phone: String(submittedAddress?.phone ?? u?.phone ?? ""),
      cityScope,
      deliveryMethod,
      branchKey: branchKey || null,
      paymentMethod,
      ...(discountOutcome.appliedCode ? { discountCode: discountOutcome.appliedCode } : {}),
    };

    const inserted = await sql`
      INSERT INTO orders (
        customer_id, items, total, status, shipping_address,
        tracking_number, carrier, shipped_at
      )
      VALUES (
        ${session.sub}::uuid,
        ${itemsJson}::jsonb,
        ${total},
        ${"pending"},
        ${JSON.stringify(shippingAddress)}::jsonb,
        ${""},
        ${""},
        ${null}
      )
      RETURNING id
    `;
    const newId = (inserted[0] as { id: string }).id;

    const rows = await sql`
      SELECT o.id, o.customer_id, o.items, o.total, o.status, o.shipping_address,
             o.payment_proof_url, o.branch_key,
             o.tracking_number, o.carrier, o.shipped_at, o.created_at, o.updated_at,
             u.username AS customer_username, u.email AS customer_email, u.full_name AS customer_full_name,
             u.address AS customer_address, u.phone AS customer_phone
      FROM orders o
      JOIN users u ON u.id = o.customer_id
      WHERE o.id = ${newId}::uuid
      LIMIT 1
    `;
    const row = rows[0] as OrderRow | undefined;
    if (!row) {
      return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
    }
    return NextResponse.json(mapOrderAdminDetail(row));
  } catch (err) {
    const e = err as { status?: number };
    if (e.status === 403) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    console.error("[POST /api/me/orders]", err);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
