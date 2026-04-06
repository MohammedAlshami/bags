import { sql } from "@/lib/db";
import {
  SEED_PRODUCTS,
  SEED_COLLECTIONS,
  SEED_LANDING,
  SEED_CUSTOMER_PROFILE,
  SEED_SHIPPING_ADDRESS,
} from "@/lib/seed-data";
import { parsePrice } from "@/lib/cart";
import { NextResponse } from "next/server";
import { hash } from "bcryptjs";

export const dynamic = "force-dynamic";

const SEED_CUSTOMER_USERNAME = "customer";
const SEED_CUSTOMER_PASSWORD = "customer";

export async function POST() {
  try {
    await sql`DELETE FROM orders`;
    await sql`DELETE FROM products`;
    await sql`DELETE FROM landing`;
    await sql`DELETE FROM collections`;

    const collectionBySlug = new Map<string, string>();
    for (const c of SEED_COLLECTIONS) {
      const inserted = await sql`
        INSERT INTO collections (name, slug, image, description, story, material, quality)
        VALUES (
          ${c.name},
          ${c.slug},
          ${c.image ?? ""},
          ${c.description ?? ""},
          ${""},
          ${""},
          ${""}
        )
        RETURNING id, slug
      `;
      const row = inserted[0];
      collectionBySlug.set(row.slug as string, row.id as string);
    }

    const products: { id: string; slug: string; name: string; price: string }[] = [];
    for (const p of SEED_PRODUCTS) {
      const collectionId =
        collectionBySlug.get(p.collectionSlug) ?? collectionBySlug.get("essentials");
      if (!collectionId) throw new Error("Missing collection for product");
      const ins = await sql`
        INSERT INTO products (name, price, category, image, slug, collection_id)
        VALUES (${p.name}, ${p.price}, ${p.category}, ${p.image}, ${p.slug}, ${collectionId}::uuid)
        RETURNING id, slug, name, price
      `;
      products.push(ins[0] as { id: string; slug: string; name: string; price: string });
    }

    await sql`
      INSERT INTO landing (id, data)
      VALUES (1, ${JSON.stringify(SEED_LANDING)}::jsonb)
      ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = now()
    `;

    let adminCreated = 0;
    const existingAdmin = await sql`
      SELECT id FROM users WHERE username = ${"admin"} LIMIT 1
    `;
    if (existingAdmin.length === 0) {
      await sql`
        INSERT INTO users (username, password, role)
        VALUES (${"admin"}, ${await hash("admin", 10)}, ${"admin"})
      `;
      adminCreated = 1;
    }

    let customerCreated = 0;
    const seedUserRows = await sql`
      SELECT id FROM users WHERE username = ${SEED_CUSTOMER_USERNAME} AND role = 'customer' LIMIT 1
    `;
    let seedCustomerId: string;
    if (seedUserRows.length === 0) {
      const ins = await sql`
        INSERT INTO users (username, password, role, email, full_name, address, phone)
        VALUES (
          ${SEED_CUSTOMER_USERNAME},
          ${await hash(SEED_CUSTOMER_PASSWORD, 10)},
          ${"customer"},
          ${SEED_CUSTOMER_PROFILE.email},
          ${SEED_CUSTOMER_PROFILE.fullName},
          ${SEED_CUSTOMER_PROFILE.address},
          ${SEED_CUSTOMER_PROFILE.phone}
        )
        RETURNING id
      `;
      seedCustomerId = ins[0].id as string;
      customerCreated = 1;
    } else {
      seedCustomerId = seedUserRows[0].id as string;
    }

    await sql`
      UPDATE users SET
        email = ${SEED_CUSTOMER_PROFILE.email},
        full_name = ${SEED_CUSTOMER_PROFILE.fullName},
        address = ${SEED_CUSTOMER_PROFILE.address},
        phone = ${SEED_CUSTOMER_PROFILE.phone},
        updated_at = now()
      WHERE id = ${seedCustomerId}::uuid
    `;

    const shippingAddress = SEED_SHIPPING_ADDRESS;

    const firstProduct = products[0];
    const priceNum = parsePrice(firstProduct.price);
    const openRows = await sql`
      SELECT id FROM orders WHERE status = 'pending' AND customer_id = ${seedCustomerId}::uuid LIMIT 1
    `;
    let orderCreated = 0;
    if (openRows.length === 0) {
      await sql`
        INSERT INTO orders (customer_id, items, total, status, shipping_address)
        VALUES (
          ${seedCustomerId}::uuid,
          ${JSON.stringify([
            {
              slug: firstProduct.slug,
              name: firstProduct.name,
              price: firstProduct.price,
              quantity: 1,
            },
          ])}::jsonb,
          ${priceNum},
          ${"pending"},
          ${JSON.stringify(shippingAddress)}::jsonb
        )
      `;
      orderCreated = 1;
    }

    const shippedRows = await sql`
      SELECT id FROM orders WHERE status = 'shipped' AND customer_id = ${seedCustomerId}::uuid LIMIT 1
    `;
    if (shippedRows.length === 0) {
      const secondProduct = products[1];
      const secondPriceNum = parsePrice(secondProduct?.price ?? "189.00 ر.س");
      await sql`
        INSERT INTO orders (customer_id, items, total, status, shipping_address, tracking_number, carrier, shipped_at)
        VALUES (
          ${seedCustomerId}::uuid,
          ${JSON.stringify([
            {
              slug: secondProduct?.slug ?? "leather-crossbody",
              name: secondProduct?.name ?? "تونر أساسي",
              price: secondProduct?.price ?? "189.00 ر.س",
              quantity: 1,
            },
          ])}::jsonb,
          ${secondPriceNum},
          ${"shipped"},
          ${JSON.stringify(shippingAddress)}::jsonb,
          ${"TRK-SA-9876543210"},
          ${"أرامكس"},
          ${new Date().toISOString()}
        )
      `;
    }

    return NextResponse.json({
      ok: true,
      message: "تم إدخال البيانات التجريبية",
      collectionsInserted: SEED_COLLECTIONS.length,
      productsInserted: products.length,
      landingInserted: 1,
      adminCreated,
      customerCreated,
      orderCreated,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "فشل الإدخال التجريبي";
    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 }
    );
  }
}
