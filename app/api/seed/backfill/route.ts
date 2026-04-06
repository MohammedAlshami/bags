import { sql } from "@/lib/db";
import { NextResponse } from "next/server";
import { SEED_CUSTOMER_PROFILE, SEED_SHIPPING_ADDRESS } from "@/lib/seed-data";

export const dynamic = "force-dynamic";

const SEED_CUSTOMER_USERNAME = "customer";

/** Backfill shipping/address on existing seed customer and their orders. Does not delete or change products/landing. */
export async function POST() {
  try {
    const seedRows = await sql`
      SELECT id FROM users WHERE username = ${SEED_CUSTOMER_USERNAME} AND role = 'customer' LIMIT 1
    `;
    if (seedRows.length === 0) {
      return NextResponse.json(
        { ok: false, error: "لم يُعثر على العميل التجريبي. شغّل الإدخال الكامل أولاً." },
        { status: 400 }
      );
    }
    const customerId = seedRows[0].id as string;

    await sql`
      UPDATE users SET
        email = ${SEED_CUSTOMER_PROFILE.email},
        full_name = ${SEED_CUSTOMER_PROFILE.fullName},
        address = ${SEED_CUSTOMER_PROFILE.address},
        phone = ${SEED_CUSTOMER_PROFILE.phone},
        updated_at = now()
      WHERE id = ${customerId}::uuid
    `;

    const orders = await sql`
      SELECT id, shipping_address, status, tracking_number, carrier, shipped_at
      FROM orders
      WHERE customer_id = ${customerId}::uuid
    `;

    let ordersUpdated = 0;
    for (const order of orders) {
      const o = order as {
        id: string;
        shipping_address?: { line1?: string; city?: string; country?: string };
        status?: string;
        tracking_number?: string;
        carrier?: string;
        shipped_at?: string | null;
      };
      const needsShipping =
        !o.shipping_address?.line1 &&
        !o.shipping_address?.city &&
        !o.shipping_address?.country;
      const needsTracking =
        o.status === "shipped" && !o.tracking_number?.trim();

      if (!needsShipping && !needsTracking) continue;

      const shipping_address = needsShipping ? SEED_SHIPPING_ADDRESS : o.shipping_address;
      const tracking_number = needsTracking ? "TRK-SA-9876543210" : (o.tracking_number ?? "");
      const carrier = needsTracking ? "أرامكس" : (o.carrier ?? "");
      const shipped_at =
        needsTracking && !o.shipped_at ? new Date().toISOString() : o.shipped_at ?? null;

      await sql`
        UPDATE orders SET
          shipping_address = ${JSON.stringify(shipping_address)}::jsonb,
          tracking_number = ${tracking_number},
          carrier = ${carrier},
          shipped_at = ${shipped_at},
          updated_at = now()
        WHERE id = ${o.id}::uuid
      `;
      ordersUpdated += 1;
    }

    return NextResponse.json({
      ok: true,
      message: "تم التحديث",
      customerUpdated: true,
      ordersUpdated,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "فشل التحديث";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
