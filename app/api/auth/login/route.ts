import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { compare } from "bcryptjs";
import { signToken, getCookieName } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const username = typeof body.username === "string" ? body.username.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password required" }, { status: 400 });
    }

    const rows = await sql`
      SELECT id, username, password, role, disabled
      FROM users
      WHERE username = ${username}
      LIMIT 1
    `;
    const user = rows[0];
    if (!user) {
      return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
    }
    if (user.disabled) {
      return NextResponse.json({ error: "Account is disabled" }, { status: 401 });
    }

    const match = await compare(password, user.password);
    if (!match) {
      return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
    }

    const token = await signToken({
      username: user.username,
      role: user.role,
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
