import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

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
      SELECT id, items, total, status, tracking_number, carrier, shipped_at, created_at
      FROM orders
      WHERE customer_id = ${session.sub}::uuid
      ORDER BY created_at DESC
    `;
    return NextResponse.json(
      orders.map((o) => ({
        _id: o.id,
        status: o.status,
        total: o.total,
        createdAt: o.created_at,
        trackingNumber: o.tracking_number,
        carrier: o.carrier,
        shippedAt: o.shipped_at,
        items: o.items,
      }))
    );
  } catch {
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
