import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireSuperadmin } from "@/lib/auth";
import { hash } from "bcryptjs";

export const dynamic = "force-dynamic";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSuperadmin();
    const { id } = await params;

    if (id === session.sub) {
      return NextResponse.json({ error: "Cannot delete yourself" }, { status: 400 });
    }

    await sql`DELETE FROM users WHERE id = ${id} AND role IN ('admin', 'superadmin')`;
    return NextResponse.json({ success: true });
  } catch (err) {
    const e = err as { status?: number };
    if (e.status === 403) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSuperadmin();
    const { id } = await params;
    const body = (await request.json()) as Record<string, unknown>;

    const username = String(body.username ?? "").trim();
    const role = String(body.role ?? "admin").trim();
    const password = body.password ? String(body.password).trim() : "";

    if (id === session.sub && role !== "superadmin") {
      const current = (await sql`SELECT role FROM users WHERE id = ${id} LIMIT 1`)[0] as { role?: string } | undefined;
      if (current?.role === "superadmin") {
        return NextResponse.json({ error: "Cannot demote yourself" }, { status: 400 });
      }
    }

    if (password) {
      if (password.length < 6) {
        return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
      }
      const hashed = await hash(password, 10);
      await sql`
        UPDATE users SET username = ${username}, role = ${role}, password = ${hashed}, email = ${username}, updated_at = now()
        WHERE id = ${id}
      `;
    } else {
      await sql`
        UPDATE users SET username = ${username}, role = ${role}, email = ${username}, updated_at = now()
        WHERE id = ${id}
      `;
    }

    const rows = await sql`
      SELECT id, username, email, role, disabled, created_at, updated_at
      FROM users WHERE id = ${id} LIMIT 1
    `;
    return NextResponse.json(rows[0]);
  } catch (err) {
    const e = err as { status?: number };
    if (e.status === 403) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}
