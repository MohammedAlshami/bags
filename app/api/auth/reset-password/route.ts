import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import bcrypt from "bcryptjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token = typeof body.token === "string" ? body.token.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!token) {
      return NextResponse.json({ message: "رمز غير صالح" }, { status: 400 });
    }
    if (!password || password.length < 6) {
      return NextResponse.json({ message: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" }, { status: 400 });
    }

    const now = new Date().toISOString();

    const rows = await sql`
      SELECT id FROM users
      WHERE password_reset_token = ${token}
        AND password_reset_expires > ${now}
      LIMIT 1
    `;

    if (rows.length === 0) {
      return NextResponse.json({ message: "الرابط منتهي الصلاحية أو غير صالح" }, { status: 400 });
    }

    const userId = rows[0].id as string;
    const hashedPassword = await bcrypt.hash(password, 10);

    await sql`
      UPDATE users
      SET password = ${hashedPassword},
          password_reset_token = NULL,
          password_reset_expires = NULL
      WHERE id = ${userId}
    `;

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ message: "حدث خطأ، يرجى المحاولة مجدداً" }, { status: 500 });
  }
}
