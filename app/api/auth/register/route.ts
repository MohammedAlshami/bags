import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { mapUserPublic, type UserRow } from "@/lib/db-mappers";
import { isValidCheckoutProvinceId, normalizeCheckoutProvinceId } from "@/lib/checkout-provinces";

export const runtime = "nodejs";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function registrationErrorPayload(err: unknown): { message: string; detail?: string } {
  const raw = err instanceof Error ? err.message : String(err);
  const lower = raw.toLowerCase();
  const detail = raw.trim().length > 0 ? (raw.length > 700 ? `${raw.slice(0, 700)}…` : raw) : undefined;

  if (
    lower.includes("no column named province_id") ||
    lower.includes("has no column named province_id")
  ) {
    return {
      message:
        "قاعدة البيانات لم تُحدَّث بعد (عمود المحافظة مفقود). من جذر المشروع شغّل: npx wrangler d1 migrations apply goldqueen --remote",
      detail,
    };
  }

  return {
    message: "حدث خطأ أثناء التسجيل",
    detail,
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const emailRaw = typeof body.email === "string" ? body.email.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const fullName = typeof body.fullName === "string" ? body.fullName.trim() : "";
    const address = typeof body.address === "string" ? body.address.trim() : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";
    const provinceIdRaw = typeof body.provinceId === "string" ? body.provinceId.trim() : "";

    if (!emailRaw || !emailRaw.includes("@")) {
      return NextResponse.json({ message: "البريد الإلكتروني غير صالح" }, { status: 400 });
    }
    if (!fullName) {
      return NextResponse.json({ message: "الاسم مطلوب" }, { status: 400 });
    }
    if (!password || password.length < 6) {
      return NextResponse.json({ message: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" }, { status: 400 });
    }
    if (!address) {
      return NextResponse.json({ message: "العنوان مطلوب" }, { status: 400 });
    }
    if (!provinceIdRaw || !isValidCheckoutProvinceId(provinceIdRaw)) {
      return NextResponse.json({ message: "اختر المحافظة" }, { status: 400 });
    }
    if (!phone) {
      return NextResponse.json({ message: "رقم الهاتف مطلوب" }, { status: 400 });
    }

    const provinceId = normalizeCheckoutProvinceId(provinceIdRaw);
    const emailNorm = normalizeEmail(emailRaw);

    const duplicate = await sql`
      SELECT id FROM users
      WHERE LOWER(TRIM(username)) = ${emailNorm}
         OR LOWER(TRIM(COALESCE(email, ''))) = ${emailNorm}
      LIMIT 1
    `;

    if (duplicate.length > 0) {
      return NextResponse.json({ message: "البريد الإلكتروني مستخدم بالفعل" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const inserted = await sql`
      INSERT INTO users (username, password, role, email, full_name, address, phone, province_id)
      VALUES (${emailNorm}, ${hashedPassword}, 'customer', ${emailRaw}, ${fullName}, ${address}, ${phone}, ${provinceId})
      RETURNING id, username, password, role, email, full_name, address, phone, province_id, disabled, created_at, updated_at
    `;

    const row = inserted[0] as UserRow;

    return NextResponse.json({ success: true, user: mapUserPublic(row) }, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    const { message, detail } = registrationErrorPayload(error);
    return NextResponse.json({ message, ...(detail ? { detail } : {}) }, { status: 500 });
  }
}
