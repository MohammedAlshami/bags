import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { mapUserPublic, type UserRow } from "@/lib/db-mappers";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() ?? "";

    const rows = await sql`
      SELECT u.id, u.username, u.email, u.full_name, u.address, u.phone, u.disabled, u.role, u.created_at, u.updated_at,
        (SELECT COUNT(*)::int FROM orders o WHERE o.customer_id = u.id) AS order_count
      FROM users u
      WHERE u.role = 'customer'
      AND (
        ${search}::text = ''
        OR u.username ILIKE '%' || ${search} || '%'
        OR u.email ILIKE '%' || ${search} || '%'
        OR u.full_name ILIKE '%' || ${search} || '%'
      )
      ORDER BY u.created_at DESC
    `;
    const list = rows.map((r) => {
      const u = mapUserPublic(r as UserRow);
      return {
        ...u,
        orderCount: (r as { order_count: number }).order_count,
      };
    });
    return NextResponse.json(list);
  } catch (err) {
    const e = err as { status?: number };
    if (e.status === 403) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 });
  }
}
