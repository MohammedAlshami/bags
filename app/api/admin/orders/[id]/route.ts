import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { mapOrderAdminDetail, type OrderRow } from "@/lib/db-mappers";
import { requireAdmin } from "@/lib/auth";
import { isUuid } from "@/lib/id";

export const dynamic = "force-dynamic";

async function fetchOrderJoined(id: string) {
  const rows = await sql`
    SELECT o.id, o.customer_id, o.items, o.total, o.status, o.shipping_address,
           o.tracking_number, o.carrier, o.shipped_at, o.created_at, o.updated_at,
           u.username AS customer_username, u.email AS customer_email, u.full_name AS customer_full_name,
           u.address AS customer_address, u.phone AS customer_phone
    FROM orders o
    JOIN users u ON u.id = o.customer_id
    WHERE o.id = ${id}::uuid
    LIMIT 1
  `;
  return rows[0] as OrderRow | undefined;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    if (!isUuid(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }
    const order = await fetchOrderJoined(id);
    if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(mapOrderAdminDetail(order));
  } catch (err) {
    const e = err as { status?: number };
    if (e.status === 403) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    if (!isUuid(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }
    const body = await request.json();

    const orderBefore = await fetchOrderJoined(id);
    if (!orderBefore) return NextResponse.json({ error: "Not found" }, { status: 404 });

    let status = orderBefore.status;
    const statusIn = body?.status;
    if (
      statusIn === "pending" ||
      statusIn === "paid" ||
      statusIn === "shipped" ||
      statusIn === "cancelled"
    ) {
      status = statusIn;
    }

    let shippingAddress: Record<string, string> =
      orderBefore.shipping_address && typeof orderBefore.shipping_address === "object"
        ? (orderBefore.shipping_address as Record<string, string>)
        : {};
    if (body?.shippingAddress && typeof body.shippingAddress === "object") {
      const sa = body.shippingAddress as Record<string, string>;
      shippingAddress = {
        fullName: typeof sa.fullName === "string" ? sa.fullName : "",
        line1: typeof sa.line1 === "string" ? sa.line1 : "",
        line2: typeof sa.line2 === "string" ? sa.line2 : "",
        city: typeof sa.city === "string" ? sa.city : "",
        state: typeof sa.state === "string" ? sa.state : "",
        postCode: typeof sa.postCode === "string" ? sa.postCode : "",
        country: typeof sa.country === "string" ? sa.country : "",
      };
    }

    let trackingNumber = orderBefore.tracking_number;
    if (typeof body?.trackingNumber === "string") trackingNumber = body.trackingNumber.trim();

    let carrier = orderBefore.carrier;
    if (typeof body?.carrier === "string") carrier = body.carrier.trim();

    let shippedAt: string | null = orderBefore.shipped_at as string | null;
    if (body?.shippedAt !== undefined) {
      shippedAt = body.shippedAt ? new Date(body.shippedAt).toISOString() : null;
    }
    if (status === "shipped" && !orderBefore.shipped_at) {
      shippedAt = new Date().toISOString();
    }

    await sql`
      UPDATE orders SET
        status = ${status},
        shipping_address = ${JSON.stringify(shippingAddress)}::jsonb,
        tracking_number = ${trackingNumber},
        carrier = ${carrier},
        shipped_at = ${shippedAt},
        updated_at = now()
      WHERE id = ${id}::uuid
    `;

    const order = await fetchOrderJoined(id);
    if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(mapOrderAdminDetail(order));
  } catch (err) {
    const e = err as { status?: number };
    if (e.status === 403) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
