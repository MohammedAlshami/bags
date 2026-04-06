import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { isUuid } from "@/lib/id";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId")?.trim();
    const email = searchParams.get("email")?.trim();

    if (!orderId || !email) {
      return NextResponse.json(
        { error: "Order ID and email are required" },
        { status: 400 }
      );
    }
    if (!isUuid(orderId)) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const rows = await sql`
      SELECT o.id, o.status, o.tracking_number, o.carrier, o.shipped_at, u.email AS customer_email
      FROM orders o
      JOIN users u ON u.id = o.customer_id
      WHERE o.id = ${orderId}::uuid
      LIMIT 1
    `;
    const order = rows[0];
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const customerEmail = order.customer_email ?? "";
    if (customerEmail.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({
      orderId: order.id,
      status: order.status,
      trackingNumber: order.tracking_number || null,
      carrier: order.carrier || null,
      shippedAt: order.shipped_at || null,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to look up order" },
      { status: 500 }
    );
  }
}
