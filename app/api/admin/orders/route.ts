import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { mapOrderAdminList, type OrderRow } from "@/lib/db-mappers";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();
    const rows = await sql`
      SELECT o.id, o.customer_id, o.items, o.total, o.status, o.shipping_address,
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
