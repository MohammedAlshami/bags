import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { mapUserPublic, type UserRow } from "@/lib/db-mappers";
import { requireAdmin } from "@/lib/auth";
import { isUuid } from "@/lib/id";

export const dynamic = "force-dynamic";

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
    const userRows = await sql`
      SELECT id, username, email, full_name, address, phone, disabled, role, created_at, updated_at
      FROM users
      WHERE id = ${id}::uuid AND role = 'customer'
      LIMIT 1
    `;
    const user = userRows[0] as UserRow | undefined;
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const orders = await sql`
      SELECT id, status, total, created_at
      FROM orders
      WHERE customer_id = ${id}::uuid
      ORDER BY created_at DESC
    `;
    const orderCount = orders.length;
    return NextResponse.json({
      ...mapUserPublic(user),
      orderCount,
      orders: orders.map((o) => ({
        _id: String(o.id),
        status: o.status,
        total: o.total,
        createdAt: o.created_at,
      })),
    });
  } catch (err) {
    const e = err as { status?: number };
    if (e.status === 403) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ error: "Failed to fetch customer" }, { status: 500 });
  }
}

export async function PUT(
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

    const curRows = await sql`
      SELECT email, full_name, address, phone, disabled
      FROM users WHERE id = ${id}::uuid AND role = 'customer' LIMIT 1
    `;
    const cur = curRows[0];
    if (!cur) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const email = typeof body.email === "string" ? body.email.trim() : cur.email;
    const fullName = typeof body.fullName === "string" ? body.fullName.trim() : cur.full_name;
    const address = typeof body.address === "string" ? body.address.trim() : cur.address;
    const phone = typeof body.phone === "string" ? body.phone.trim() : cur.phone;
    const disabled = typeof body.disabled === "boolean" ? body.disabled : cur.disabled;

    const updated = await sql`
      UPDATE users SET
        email = ${email},
        full_name = ${fullName},
        address = ${address},
        phone = ${phone},
        disabled = ${disabled},
        updated_at = now()
      WHERE id = ${id}::uuid AND role = 'customer'
      RETURNING id, username, email, full_name, address, phone, disabled, role, created_at, updated_at
    `;
    const user = updated[0] as UserRow | undefined;
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(mapUserPublic(user));
  } catch (err) {
    const e = err as { status?: number };
    if (e.status === 403) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ error: "Failed to update customer" }, { status: 500 });
  }
}
