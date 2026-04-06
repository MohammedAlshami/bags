import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
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

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();
    const username = typeof body.username === "string" ? body.username.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";
    if (!username || !password) {
      return NextResponse.json({ error: "Username and password required" }, { status: 400 });
    }

    const taken = await sql`SELECT id FROM users WHERE username = ${username} LIMIT 1`;
    if (taken.length > 0) {
      return NextResponse.json({ error: "Username already taken" }, { status: 400 });
    }

    const email = typeof body.email === "string" ? body.email.trim() : "";
    const fullName = typeof body.fullName === "string" ? body.fullName.trim() : "";
    const address = typeof body.address === "string" ? body.address.trim() : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";
    const disabled = typeof body.disabled === "boolean" ? body.disabled : false;

    const hashed = await hash(password, 10);
    const inserted = await sql`
      INSERT INTO users (username, password, role, email, full_name, address, phone, disabled)
      VALUES (${username}, ${hashed}, 'customer', ${email}, ${fullName}, ${address}, ${phone}, ${disabled})
      RETURNING id, username, email, full_name, address, phone, disabled, role, created_at, updated_at
    `;
    const user = inserted[0] as UserRow;
    return NextResponse.json({
      ...mapUserPublic(user),
      orderCount: 0,
    });
  } catch (err) {
    const e = err as { status?: number };
    if (e.status === 403) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ error: "Failed to create customer" }, { status: 500 });
  }
}
