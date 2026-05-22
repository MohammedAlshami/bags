import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireSuperadmin } from "@/lib/auth";
import { hash } from "bcryptjs";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await requireSuperadmin();
    const rows = await sql`
      SELECT id, username, email, role, disabled, full_name, created_at, updated_at
      FROM users
      WHERE role IN ('admin', 'superadmin') AND id <> ${session.sub}
      ORDER BY created_at ASC
    `;
    return NextResponse.json(rows);
  } catch (err) {
    const e = err as { status?: number };
    if (e.status === 403) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireSuperadmin();
    const body = (await request.json()) as Record<string, unknown>;
    const username = String(body.username ?? "").trim();
    const password = String(body.password ?? "");
    const role = String(body.role ?? "admin").trim();

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password required" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const hashed = await hash(password, 10);
    await sql`
      INSERT INTO users (username, password, role, email)
      VALUES (${username}, ${hashed}, ${role}, ${username})
    `;

    const rows = await sql`
      SELECT id, username, email, role, disabled, created_at
      FROM users WHERE username = ${username} LIMIT 1
    `;
    return NextResponse.json(rows[0], { status: 201 });
  } catch (err) {
    const e = err as { status?: number };
    if (e.status === 403) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const msg = err instanceof Error ? err.message : "Failed to create user";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
