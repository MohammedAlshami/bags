import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { isUuid } from "@/lib/id";
import { mapOrderAdminDetail, type OrderRow } from "@/lib/db-mappers";

export const dynamic = "force-dynamic";

async function fetchCustomerOrder(orderId: string, customerId: string) {
  const rows = await sql`
    SELECT o.id, o.customer_id, o.items, o.total, o.status, o.shipping_address,
           o.payment_proof_url, o.branch_key,
           o.tracking_number, o.carrier, o.shipped_at, o.created_at, o.updated_at,
           u.username AS customer_username, u.email AS customer_email, u.full_name AS customer_full_name,
           u.address AS customer_address, u.phone AS customer_phone
    FROM orders o
    JOIN users u ON u.id = o.customer_id
    WHERE o.id = ${orderId}::uuid AND o.customer_id = ${customerId}::uuid
    LIMIT 1
  `;
  return rows[0] as OrderRow | undefined;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (session.role !== "customer") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const { id } = await params;
    if (!isUuid(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    const order = await fetchCustomerOrder(id, session.sub);
    if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(mapOrderAdminDetail(order));
  } catch (err) {
    console.error("[GET /api/me/orders/[id]]", err);
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (session.role !== "customer") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const { id } = await params;
    if (!isUuid(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const orderBefore = await fetchCustomerOrder(id, session.sub);
    if (!orderBefore) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (orderBefore.status !== "pending") {
      return NextResponse.json({ error: "Order cannot be updated" }, { status: 400 });
    }

    const body = await request.json();
    const paymentProofUrl =
      typeof body?.paymentProofUrl === "string" ? body.paymentProofUrl.trim() : undefined;
    if (paymentProofUrl === undefined) {
      return NextResponse.json({ error: "paymentProofUrl required" }, { status: 400 });
    }

    const prevSa =
      orderBefore.shipping_address && typeof orderBefore.shipping_address === "object"
        ? ({ ...(orderBefore.shipping_address as Record<string, unknown>) } as Record<string, unknown>)
        : {};
    delete prevSa.paymentProofUrl;

    await sql`
      UPDATE orders SET
        payment_proof_url = ${paymentProofUrl || null},
        shipping_address = ${JSON.stringify(prevSa)}::jsonb,
        updated_at = now()
      WHERE id = ${id}::uuid AND customer_id = ${session.sub}::uuid
    `;

    const order = await fetchCustomerOrder(id, session.sub);
    if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(mapOrderAdminDetail(order));
  } catch (err) {
    console.error("[PATCH /api/me/orders/[id]]", err);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
