import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { compare } from "bcryptjs";
import { signToken, getCookieName } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Accept either "identifier" (email or phone) or legacy "username"/"phone" fields
    const raw =
      typeof body.identifier === "string"
        ? body.identifier.trim()
        : typeof body.username === "string"
        ? body.username.trim()
        : typeof body.phone === "string"
        ? body.phone.trim()
        : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!raw || !password) {
      return NextResponse.json({ error: "Identifier and password required" }, { status: 400 });
    }

    // Normalise: strip spaces/dashes for phone comparison
    const phoneNorm = raw.replace(/[\s\-]/g, "");
    const emailNorm = raw.toLowerCase();

    const rows = await sql`
      SELECT id, username, password, role, disabled
      FROM users
      WHERE LOWER(TRIM(COALESCE(email, ''))) = ${emailNorm}
         OR LOWER(TRIM(username)) = ${emailNorm}
         OR TRIM(COALESCE(phone, '')) = ${phoneNorm}
      LIMIT 1
    `;
    const user = rows[0];
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
    if (user.disabled) {
      return NextResponse.json({ error: "Account is disabled" }, { status: 401 });
    }

    const match = await compare(password, user.password as string);
    if (!match) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = await signToken({
      username: user.username as string,
      role: user.role as string,
      sub: String(user.id),
    });

    const res = NextResponse.json({
      ok: true,
      user: {
        username: user.username,
        role: user.role,
      },
    });
    res.cookies.set(getCookieName(), token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    return res;
  } catch {
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
