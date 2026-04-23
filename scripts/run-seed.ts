/**
 * Run seed against Neon (PostgreSQL). Loads .env.local from project root.
 * Usage: npm run seed   (from project root)
 */
import { readFileSync, existsSync } from "fs";
import { randomUUID } from "crypto";
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
const SEED_CUSTOMER_PASSWORD = "customer";

async function main() {
  const { sql } = await import("../lib/db");
  const {
    SEED_PRODUCTS,
    SEED_COLLECTIONS,
    SEED_BLOG_POSTS,
    SEED_LANDING,
    SEED_CUSTOMER_PROFILE,
    SEED_SHIPPING_ADDRESS,
  } = await import("../lib/seed-data");
  const { parsePrice } = await import("../lib/cart");
  const { hash } = await import("bcryptjs");

  const uri = process.env.DATABASE_URL;
  if (!uri) {
    throw new Error("DATABASE_URL not set in .env.local");
  }

  console.log("جاري إدخال البيانات التجريبية…");

  await sql`DELETE FROM orders`;
  await sql`DELETE FROM products`;
  await sql`DELETE FROM landing`;
  await sql`DELETE FROM blog_posts`;
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
  `;

  for (const post of SEED_BLOG_POSTS) {
    await sql`
      INSERT INTO blog_posts (
        id, title, slug, excerpt, cover_image, author_name, status, content,
        seo_title, seo_description, tags, published_at
      )
      VALUES (
        ${randomUUID()}::uuid,
        ${post.title},
        ${post.slug},
        ${post.excerpt},
        ${post.coverImage},
        ${post.authorName},
        ${post.status},
        ${JSON.stringify(post.content)}::jsonb,
        ${post.seoTitle},
        ${post.seoDescription},
        ${JSON.stringify(post.tags)}::jsonb,
        ${post.status === "published" ? new Date().toISOString() : null}
      )
    `;
  }

  console.log("Collections inserted:", SEED_COLLECTIONS.length, "Products inserted:", products.length);

  const existingAdmin = await sql`SELECT id FROM users WHERE username = ${"admin"} LIMIT 1`;
  if (existingAdmin.length === 0) {
    await sql`
      INSERT INTO users (username, password, role)
      VALUES (${"admin"}, ${await hash("admin", 10)}, ${"admin"})
    `;
    console.log("Admin user created (username: admin, password: admin)");
  }

  let seedCustomerId: string;
  const seedUserRows = await sql`
    SELECT id FROM users WHERE username = ${SEED_CUSTOMER_USERNAME} AND role = 'customer' LIMIT 1
  `;
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
    console.log("Customer created (username: customer, password: customer)");
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

  const shippingAddress = { ...SEED_SHIPPING_ADDRESS, branchKey: "jeddah-sanabel" };

  const firstProduct = products[0];
  const priceNum = parsePrice(firstProduct.price);
  const openRows = await sql`
    SELECT id FROM orders WHERE status = 'pending' AND customer_id = ${seedCustomerId}::uuid LIMIT 1
  `;
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
    console.log("Open order created (1 item, shipping info added)");
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
        ${JSON.stringify({ ...SEED_SHIPPING_ADDRESS, branchKey: "makkah-awali" })}::jsonb,
        ${"TRK-SA-9876543210"},
        ${"أرامكس"},
        ${new Date().toISOString()}
      )
    `;
    console.log("Shipped order created (with tracking)");
  }

  console.log("اكتمل: تم إدخال بيانات الصفحة الرئيسية.");
}

main().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});
