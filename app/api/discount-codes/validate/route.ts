import { NextResponse } from "next/server";
import { discountErrorAr, lookupDiscountCode } from "@/lib/discount-codes";

export const dynamic = "force-dynamic";

/** Checks a voucher for the cart; the order endpoint re-validates, so this is advisory. */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { code?: unknown; subtotal?: unknown };
    const subtotal = Number(body.subtotal);
    if (typeof body.code !== "string" || !Number.isFinite(subtotal) || subtotal < 0) {
      return NextResponse.json({ error: "كود الخصم غير صالح" }, { status: 400 });
    }
    const result = await lookupDiscountCode(body.code, subtotal);
    if (!result.ok) {
      return NextResponse.json({ error: discountErrorAr(result.reason, result.minSubtotal) }, { status: 400 });
    }
    return NextResponse.json({ rule: result.rule });
  } catch {
    return NextResponse.json({ error: "تعذر التحقق من الكود" }, { status: 500 });
  }
}
