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
    const rows = await sql`
      SELECT id, username, email, full_name, address, phone
      FROM users
      WHERE id = ${session.sub}::uuid
      LIMIT 1
    `;
    const user = rows[0];
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({
      _id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.full_name,
      address: user.address,
      phone: user.phone,
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.role !== "customer") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const body = await request.json();
    const curRows = await sql`
      SELECT email, full_name, address, phone FROM users WHERE id = ${session.sub}::uuid LIMIT 1
    `;
    const cur = curRows[0];
    if (!cur) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const email = typeof body.email === "string" ? body.email.trim() : cur.email;
    const fullName = typeof body.fullName === "string" ? body.fullName.trim() : cur.full_name;
    const address = typeof body.address === "string" ? body.address.trim() : cur.address;
    const phone = typeof body.phone === "string" ? body.phone.trim() : cur.phone;

    const rows = await sql`
      UPDATE users SET
        email = ${email},
        full_name = ${fullName},
        address = ${address},
        phone = ${phone},
        updated_at = now()
      WHERE id = ${session.sub}::uuid
      RETURNING id, username, email, full_name, address, phone
    `;
    const user = rows[0];
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({
      _id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.full_name,
      address: user.address,
      phone: user.phone,
    });
  } catch {
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
