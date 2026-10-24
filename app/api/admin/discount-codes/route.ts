import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { mapDiscountCode, normalizeCode, type DiscountCodeRow } from "@/lib/discount-codes";
import { parseDiscountBody } from "./parse";

export const dynamic = "force-dynamic";

function errorResponse(err: unknown) {
  const e = err as { status?: number; message?: string };
  if (e.status === 403) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  return NextResponse.json({ error: e.message || "Request failed" }, { status: 500 });
}

export async function GET() {
  try {
    await requireAdmin();
    const rows = await sql`SELECT * FROM discount_codes ORDER BY created_at DESC`;
    return NextResponse.json((rows as DiscountCodeRow[]).map(mapDiscountCode));
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const parsed = parseDiscountBody((await request.json()) as Record<string, unknown>);
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
    const d = parsed.data;
    const existing = await sql`SELECT 1 FROM discount_codes WHERE code = ${normalizeCode(d.code)} LIMIT 1`;
    if (existing.length > 0) return NextResponse.json({ error: "هذا الكود موجود مسبقاً" }, { status: 409 });

    const id = crypto.randomUUID();
    await sql`
      INSERT INTO discount_codes (id, code, type, value, min_subtotal, max_uses, starts_at, expires_at, is_active)
      VALUES (${id}, ${normalizeCode(d.code)}, ${d.type}, ${d.value}, ${d.minSubtotal}, ${d.maxUses}, ${d.startsAt}, ${d.expiresAt}, ${d.isActive ? 1 : 0})
    `;
    const rows = await sql`SELECT * FROM discount_codes WHERE id = ${id} LIMIT 1`;
    return NextResponse.json(mapDiscountCode(rows[0] as DiscountCodeRow), { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}
