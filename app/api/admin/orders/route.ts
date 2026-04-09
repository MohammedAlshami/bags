import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { mapOrderAdminDetail, mapOrderAdminList, type OrderRow } from "@/lib/db-mappers";
import { requireAdmin } from "@/lib/auth";
import { isUuid } from "@/lib/id";
import { parsePrice } from "@/lib/cart";

export const dynamic = "force-dynamic";

type LineItem = { slug: string; name: string; price: string; quantity: number; image?: string };

function normalizeLineItems(raw: unknown): LineItem[] {
  if (!Array.isArray(raw)) {
    throw new Error("Invalid items");
  }
  if (raw.length === 0) {
    throw new Error("Items required");
  }
  const out: LineItem[] = [];
  for (const entry of raw) {
    if (!entry || typeof entry !== "object") continue;
    const o = entry as Record<string, unknown>;
    const slug = typeof o.slug === "string" ? o.slug.trim() : "";
    const name = typeof o.name === "string" ? o.name.trim() : "";
    const price = typeof o.price === "string" ? o.price.trim() : "";
    const image = typeof o.image === "string" ? o.image.trim() : "";
    const q = typeof o.quantity === "number" ? o.quantity : parseInt(String(o.quantity ?? ""), 10);
    const quantity = Number.isFinite(q) && q >= 1 ? Math.floor(q) : 0;
    if (!slug || !name || !price || quantity < 1) {
      throw new Error("Invalid items");
    }
    const line: LineItem = { slug, name, price, quantity };
    if (image) line.image = image;
    out.push(line);
  }
  return out;
}

function normalizeShipping(body: Record<string, unknown>) {
  const sa = body.shippingAddress;
  if (!sa || typeof sa !== "object") {
    return {
      fullName: "",
      line1: "",
      line2: "",
      city: "",
      state: "",
      postCode: "",
      country: "",
    };
  }
  const o = sa as Record<string, unknown>;
  return {
    fullName: typeof o.fullName === "string" ? o.fullName : "",
    line1: typeof o.line1 === "string" ? o.line1 : "",
    line2: typeof o.line2 === "string" ? o.line2 : "",
    city: typeof o.city === "string" ? o.city : "",
    state: typeof o.state === "string" ? o.state : "",
    postCode: typeof o.postCode === "string" ? o.postCode : "",
    country: typeof o.country === "string" ? o.country : "",
  };
}

export async function GET() {
  try {
    await requireAdmin();
    const rows = await sql`
      SELECT o.id, o.customer_id, o.items, o.total, o.status, o.shipping_address,
             o.payment_proof_url,
             o.tracking_number, o.carrier, o.shipped_at, o.created_at, o.updated_at,
             u.username AS customer_username, u.email AS customer_email, u.full_name AS customer_full_name
      FROM orders o
      JOIN users u ON u.id = o.customer_id
      ORDER BY o.created_at DESC
    `;
    const list = (rows as OrderRow[]).map((r) => mapOrderAdminList(r));
    return NextResponse.json(list);
  } catch (err) {
    const e = err as { status?: number };
    if (e.status === 403) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = (await request.json()) as Record<string, unknown>;
    const customerId = typeof body.customerId === "string" ? body.customerId.trim() : "";
    if (!customerId) {
      return NextResponse.json({ error: "Customer required" }, { status: 400 });
    }
    if (!isUuid(customerId)) {
      return NextResponse.json({ error: "Invalid customer" }, { status: 400 });
    }

    const custRows = await sql`
      SELECT id FROM users WHERE id = ${customerId}::uuid AND role = 'customer' LIMIT 1
    `;
    if (custRows.length === 0) {
      return NextResponse.json({ error: "Customer not found" }, { status: 400 });
    }

    let items: LineItem[];
    try {
      items = normalizeLineItems(body.items);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Invalid items";
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const total = items.reduce((sum, it) => sum + parsePrice(it.price) * it.quantity, 0);

    let status = "pending";
    const statusIn = body.status;
    if (
      statusIn === "pending" ||
      statusIn === "paid" ||
      statusIn === "shipped" ||
      statusIn === "cancelled"
    ) {
      status = statusIn;
    }

    const shippingAddress = normalizeShipping(body);
    const branchKey =
      typeof body.branchKey === "string" && body.branchKey.trim()
        ? body.branchKey.trim()
        : null;
    const shippingPayload = branchKey ? { ...shippingAddress, branchKey } : shippingAddress;
    const trackingNumber =
      typeof body.trackingNumber === "string" ? body.trackingNumber.trim() : "";
    const carrier = typeof body.carrier === "string" ? body.carrier.trim() : "";
    let shippedAt: string | null = null;
    if (typeof body.shippedAt === "string" && body.shippedAt.trim()) {
      shippedAt = new Date(body.shippedAt).toISOString();
    }
    if (status === "shipped" && !shippedAt) {
      shippedAt = new Date().toISOString();
    }

    const itemsJson = JSON.stringify(items);

    const inserted = await sql`
      INSERT INTO orders (
        customer_id, items, total, status, shipping_address,
        tracking_number, carrier, shipped_at
      )
      VALUES (
        ${customerId}::uuid,
        ${itemsJson}::jsonb,
        ${total},
        ${status},
        ${JSON.stringify(shippingPayload)}::jsonb,
        ${trackingNumber},
        ${carrier},
        ${shippedAt}
      )
      RETURNING id
    `;
    const newId = (inserted[0] as { id: string }).id;

    const rows = await sql`
      SELECT o.id, o.customer_id, o.items, o.total, o.status, o.shipping_address,
             o.payment_proof_url,
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
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
