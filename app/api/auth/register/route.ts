import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { hash } from "bcryptjs";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const username = typeof body.username === "string" ? body.username.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const role = body.role === "admin" ? "admin" : "customer";

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password required" }, { status: 400 });
    }

    const existing = await sql`
      SELECT id FROM users WHERE username = ${username} LIMIT 1
    `;
    if (existing.length > 0) {
      return NextResponse.json({ error: "Username already taken" }, { status: 400 });
    }

    const hashed = await hash(password, 10);
    await sql`
      INSERT INTO users (username, password, role)
      VALUES (${username}, ${hashed}, ${role})
    `;
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
