import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getSession, requireCustomer } from "@/lib/auth";
import { isValidBranchKey } from "@/lib/store-locations";
import { parsePrice } from "@/lib/cart";
import { mapOrderAdminDetail, type OrderRow } from "@/lib/db-mappers";

export const dynamic = "force-dynamic";

type LineItem = { slug: string; name: string; price: string; quantity: number; image?: string };

function normalizeLineItems(raw: unknown): LineItem[] {
  if (!Array.isArray(raw) || raw.length === 0) {
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
  if (out.length === 0) throw new Error("Invalid items");
  return out;
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
      SELECT id, items, total, status, shipping_address, tracking_number, carrier, shipped_at, created_at
      FROM orders
      WHERE customer_id = ${session.sub}::uuid
      ORDER BY created_at DESC
    `;
    return NextResponse.json(
      orders.map((o) => {
        const sa =
          o.shipping_address && typeof o.shipping_address === "object"
            ? (o.shipping_address as Record<string, unknown>)
            : {};
        const branchKey =
          typeof sa.branchKey === "string" && sa.branchKey.trim() ? sa.branchKey.trim() : null;
        const paymentProofUrl =
          typeof sa.paymentProofUrl === "string" && sa.paymentProofUrl.trim()
            ? sa.paymentProofUrl.trim()
            : null;
        return {
          _id: o.id,
          status: o.status,
          total: o.total,
          createdAt: o.created_at,
          trackingNumber: o.tracking_number,
          carrier: o.carrier,
          shippedAt: o.shipped_at,
          items: o.items,
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
    const branchKey = typeof body.branchKey === "string" ? body.branchKey.trim() : "";
    if (!branchKey || !isValidBranchKey(branchKey)) {
      return NextResponse.json({ error: "Branch required" }, { status: 400 });
    }

    let items: LineItem[];
    try {
      items = normalizeLineItems(body.items);
    } catch {
      return NextResponse.json({ error: "Invalid items" }, { status: 400 });
    }

    const total = items.reduce((sum, it) => sum + parsePrice(it.price) * it.quantity, 0);
    const itemsJson = JSON.stringify(items);

    const userRows = await sql`
      SELECT address, full_name, phone FROM users WHERE id = ${session.sub}::uuid AND role = 'customer' LIMIT 1
    `;
    const u = userRows[0] as { address: string; full_name: string; phone: string } | undefined;
    const shippingAddress = {
      fullName: u?.full_name ?? "",
      line1: u?.address ?? "",
      line2: "",
      city: "",
      state: "",
      postCode: "",
      country: "",
      phone: u?.phone ?? "",
      branchKey,
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
