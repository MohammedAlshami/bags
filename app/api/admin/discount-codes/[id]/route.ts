import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { mapDiscountCode, normalizeCode, type DiscountCodeRow } from "@/lib/discount-codes";
import { parseDiscountBody } from "../parse";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

function errorResponse(err: unknown) {
  const e = err as { status?: number; message?: string };
  if (e.status === 403) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  return NextResponse.json({ error: e.message || "Request failed" }, { status: 500 });
}

export async function PUT(request: Request, { params }: Ctx) {
  try {
    await requireAdmin();
    const { id } = await params;
    const parsed = parseDiscountBody((await request.json()) as Record<string, unknown>);
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
    const d = parsed.data;
    const clash = await sql`SELECT 1 FROM discount_codes WHERE code = ${normalizeCode(d.code)} AND id != ${id} LIMIT 1`;
    if (clash.length > 0) return NextResponse.json({ error: "هذا الكود موجود مسبقاً" }, { status: 409 });

    await sql`
      UPDATE discount_codes SET
        code = ${normalizeCode(d.code)}, type = ${d.type}, value = ${d.value}, min_subtotal = ${d.minSubtotal},
        max_uses = ${d.maxUses}, starts_at = ${d.startsAt}, expires_at = ${d.expiresAt},
        is_active = ${d.isActive ? 1 : 0}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
    `;
    const rows = await sql`SELECT * FROM discount_codes WHERE id = ${id} LIMIT 1`;
    if (rows.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(mapDiscountCode(rows[0] as DiscountCodeRow));
  } catch (err) {
    return errorResponse(err);
  }
}

export async function DELETE(_request: Request, { params }: Ctx) {
  try {
    await requireAdmin();
    const { id } = await params;
    await sql`DELETE FROM discount_codes WHERE id = ${id}`;
    return NextResponse.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
