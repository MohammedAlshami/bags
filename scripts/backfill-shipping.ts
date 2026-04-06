/**
 * Backfill shipping address and phone on seed customer and their orders.
 * Usage: npx tsx scripts/backfill-shipping.ts
 */
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

const envPath = resolve(process.cwd(), ".env.local");
if (existsSync(envPath)) {
  const content = readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const eq = trimmed.indexOf("=");
      if (eq > 0) {
        const key = trimmed.slice(0, eq).trim();
        const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
        process.env[key] = value;
      }
    }
  }
}

const SEED_CUSTOMER_USERNAME = "customer";

async function main() {
  const { sql } = await import("../lib/db");
  const { SEED_CUSTOMER_PROFILE, SEED_SHIPPING_ADDRESS } = await import("../lib/seed-data");
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL not set in .env.local");

  const seedRows = await sql`
    SELECT id FROM users WHERE username = ${SEED_CUSTOMER_USERNAME} AND role = 'customer' LIMIT 1
  `;
  if (seedRows.length === 0) {
    console.error("لم يُعثر على العميل التجريبي. شغّل الإدخال الكامل أولاً.");
    process.exit(1);
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
  console.log("تم تحديث بيانات العميل التجريبي.");

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
    const needsTracking = o.status === "shipped" && !o.tracking_number?.trim();

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
  console.log("الطلبات المحدّثة:", ordersUpdated);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
