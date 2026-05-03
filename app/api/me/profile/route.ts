import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { isValidCheckoutProvinceId, normalizeCheckoutProvinceId } from "@/lib/checkout-provinces";

export const dynamic = "force-dynamic";

function provinceIdFromRow(row: { province_id?: unknown }): string | undefined {
  const raw = row.province_id;
  if (raw == null) return undefined;
  const s = String(raw).trim();
  return s !== "" ? s : undefined;
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const rows = await sql`
      SELECT id, username, email, full_name, address, phone, province_id
      FROM users
      WHERE id = ${session.sub}::uuid
      LIMIT 1
    `;
    const user = rows[0];
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const provinceId = provinceIdFromRow(user);
    return NextResponse.json({
      _id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.full_name,
      address: user.address,
      phone: user.phone,
      ...(provinceId ? { provinceId } : {}),
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
      SELECT email, full_name, address, phone, province_id FROM users WHERE id = ${session.sub}::uuid LIMIT 1
    `;
    const cur = curRows[0];
    if (!cur) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const email = typeof body.email === "string" ? body.email.trim() : cur.email;
    const fullName = typeof body.fullName === "string" ? body.fullName.trim() : cur.full_name;
    const address = typeof body.address === "string" ? body.address.trim() : cur.address;
    const phone = typeof body.phone === "string" ? body.phone.trim() : cur.phone;

    let provinceIdValue: string | null =
      cur.province_id != null && String(cur.province_id).trim() !== ""
        ? String(cur.province_id).trim()
        : null;

    if (Object.prototype.hasOwnProperty.call(body, "provinceId")) {
      const raw = body.provinceId;
      if (raw === null || raw === undefined) {
        provinceIdValue = null;
      } else if (typeof raw === "string") {
        const t = raw.trim();
        if (!t) provinceIdValue = null;
        else if (!isValidCheckoutProvinceId(t)) {
          return NextResponse.json({ error: "Invalid province" }, { status: 400 });
        } else {
          provinceIdValue = normalizeCheckoutProvinceId(t);
        }
      } else {
        return NextResponse.json({ error: "Invalid province" }, { status: 400 });
      }
    }

    const rows = await sql`
      UPDATE users SET
        email = ${email},
        full_name = ${fullName},
        address = ${address},
        phone = ${phone},
        province_id = ${provinceIdValue},
        updated_at = now()
      WHERE id = ${session.sub}::uuid
      RETURNING id, username, email, full_name, address, phone, province_id
    `;
    const user = rows[0];
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const provinceId = provinceIdFromRow(user);
    return NextResponse.json({
      _id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.full_name,
      address: user.address,
      phone: user.phone,
      ...(provinceId ? { provinceId } : {}),
    });
  } catch {
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
