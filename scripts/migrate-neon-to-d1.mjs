import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { neon } from "@neondatabase/serverless";

const envPath = resolve(process.cwd(), ".env.local");
if (existsSync(envPath)) {
  const content = readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    process.env[key] = value;
  }
}

const databaseUrl = process.env.DATABASE_URL;
const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const databaseId = process.env.CLOUDFLARE_DATABASE_ID;
const token = process.env.CLOUDFLARE_D1_TOKEN;

if (!databaseUrl) throw new Error("DATABASE_URL is required");
if (!accountId) throw new Error("CLOUDFLARE_ACCOUNT_ID is required");
if (!databaseId) throw new Error("CLOUDFLARE_DATABASE_ID is required");
if (!token) throw new Error("CLOUDFLARE_D1_TOKEN is required");

const source = neon(databaseUrl);

async function d1Query(sql, params = []) {
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sql, params }),
    },
  );

  if (!res.ok) {
    throw new Error(`D1 query failed: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  if (!data.success) {
    throw new Error(data.errors?.[0]?.message ?? "D1 query failed");
  }

  const result = data.result?.[0];
  if (!result?.success) {
    throw new Error(result?.error ?? "D1 statement failed");
  }

  return result.results ?? [];
}

const schemaStatements = [
  "PRAGMA foreign_keys = OFF",
  "DROP TABLE IF EXISTS orders",
  "DROP TABLE IF EXISTS products",
  "DROP TABLE IF EXISTS blog_posts",
  "DROP TABLE IF EXISTS landing",
  "DROP TABLE IF EXISTS users",
  "DROP TABLE IF EXISTS categories",
  "DROP TABLE IF EXISTS collections",
  `CREATE TABLE collections (
    id TEXT PRIMARY KEY NOT NULL DEFAULT (
      lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-' || lower(hex(randomblob(2))) || '-' || lower(hex(randomblob(2))) || '-' || lower(hex(randomblob(6)))
    ),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    image TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    story TEXT NOT NULL DEFAULT '',
    material TEXT NOT NULL DEFAULT '',
    quality TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE categories (
    id TEXT PRIMARY KEY NOT NULL DEFAULT (
      lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-' || lower(hex(randomblob(2))) || '-' || lower(hex(randomblob(2))) || '-' || lower(hex(randomblob(6)))
    ),
    name TEXT NOT NULL UNIQUE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE users (
    id TEXT PRIMARY KEY NOT NULL DEFAULT (
      lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-' || lower(hex(randomblob(2))) || '-' || lower(hex(randomblob(2))) || '-' || lower(hex(randomblob(6)))
    ),
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'customer')),
    email TEXT NOT NULL DEFAULT '',
    full_name TEXT NOT NULL DEFAULT '',
    address TEXT NOT NULL DEFAULT '',
    phone TEXT NOT NULL DEFAULT '',
    disabled INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE blog_posts (
    id TEXT PRIMARY KEY NOT NULL,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    excerpt TEXT NOT NULL DEFAULT '',
    cover_image TEXT NOT NULL DEFAULT '',
    author_name TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    content TEXT NOT NULL DEFAULT '[]',
    seo_title TEXT NOT NULL DEFAULT '',
    seo_description TEXT NOT NULL DEFAULT '',
    tags TEXT NOT NULL DEFAULT '[]',
    published_at TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE landing (
    id INTEGER PRIMARY KEY NOT NULL CHECK (id = 1),
    data TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE products (
    id TEXT PRIMARY KEY NOT NULL DEFAULT (
      lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-' || lower(hex(randomblob(2))) || '-' || lower(hex(randomblob(2))) || '-' || lower(hex(randomblob(6)))
    ),
    name TEXT NOT NULL,
    price TEXT NOT NULL,
    category TEXT NOT NULL,
    image TEXT NOT NULL,
    collection_id TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    description_ar TEXT,
    ingredients_ar TEXT,
    usage_ar TEXT,
    free_from_ar TEXT,
    old_price_ar TEXT,
    old_riyal REAL,
    sizes TEXT,
    warning_ar TEXT,
    contents_ar TEXT,
    category_id TEXT NOT NULL,
    FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE SET NULL,
    FOREIGN KEY (category_id) REFERENCES categories(id)
  )`,
  `CREATE TABLE orders (
    id TEXT PRIMARY KEY NOT NULL DEFAULT (
      lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-' || lower(hex(randomblob(2))) || '-' || lower(hex(randomblob(2))) || '-' || lower(hex(randomblob(6)))
    ),
    customer_id TEXT NOT NULL,
    items TEXT NOT NULL DEFAULT '[]',
    total REAL NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled')),
    shipping_address TEXT NOT NULL DEFAULT '{}',
    tracking_number TEXT NOT NULL DEFAULT '',
    carrier TEXT NOT NULL DEFAULT '',
    shipped_at TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    payment_proof_url TEXT,
    branch_key TEXT,
    FOREIGN KEY (customer_id) REFERENCES users(id)
  )`,
  "CREATE INDEX blog_posts_created_at_idx ON blog_posts (created_at DESC)",
  "CREATE INDEX blog_posts_status_published_at_idx ON blog_posts (status, published_at DESC, created_at DESC)",
  "CREATE INDEX products_category_id_idx ON products (category_id)",
  "PRAGMA foreign_keys = ON",
];

async function copyRows({ table, columns, rows, transform = (row) => row }) {
  console.log(`Copying ${table}: ${rows.length} rows`);
  for (const rawRow of rows) {
    const row = transform(rawRow);
    const placeholders = columns.map(() => "?").join(", ");
    await d1Query(
      `INSERT INTO ${table} (${columns.join(", ")}) VALUES (${placeholders})`,
      columns.map((column) => row[column] ?? null),
    );
  }
}

async function main() {
  console.log("Creating D1 schema...");
  for (const statement of schemaStatements) {
    await d1Query(statement);
  }

  const collections = await source`
    SELECT id, name, slug, image, description, story, material, quality, created_at, updated_at
    FROM collections
  `;
  await copyRows({
    table: "collections",
    columns: [
      "id",
      "name",
      "slug",
      "image",
      "description",
      "story",
      "material",
      "quality",
      "created_at",
      "updated_at",
    ],
    rows: collections,
  });

  const categories = await source`
    SELECT id, name, sort_order, created_at, updated_at
    FROM categories
  `;
  await copyRows({
    table: "categories",
    columns: ["id", "name", "sort_order", "created_at", "updated_at"],
    rows: categories,
  });

  const users = await source`
    SELECT id, username, password, role, email, full_name, address, phone, disabled, created_at, updated_at
    FROM users
  `;
  await copyRows({
    table: "users",
    columns: [
      "id",
      "username",
      "password",
      "role",
      "email",
      "full_name",
      "address",
      "phone",
      "disabled",
      "created_at",
      "updated_at",
    ],
    rows: users,
    transform: (row) => ({
      ...row,
      disabled: row.disabled ? 1 : 0,
    }),
  });

  const blogPosts = await source`
    SELECT id, title, slug, excerpt, cover_image, author_name, status, content, seo_title,
           seo_description, tags, published_at, created_at, updated_at
    FROM blog_posts
  `;
  await copyRows({
    table: "blog_posts",
    columns: [
      "id",
      "title",
      "slug",
      "excerpt",
      "cover_image",
      "author_name",
      "status",
      "content",
      "seo_title",
      "seo_description",
      "tags",
      "published_at",
      "created_at",
      "updated_at",
    ],
    rows: blogPosts,
    transform: (row) => ({
      ...row,
      content: JSON.stringify(row.content ?? []),
      tags: JSON.stringify(row.tags ?? []),
    }),
  });

  const landingRows = await source`
    SELECT id, data, updated_at
    FROM landing
  `;
  await copyRows({
    table: "landing",
    columns: ["id", "data", "updated_at"],
    rows: landingRows,
    transform: (row) => ({
      ...row,
      data: JSON.stringify(row.data),
    }),
  });

  const products = await source`
    SELECT id, name, price, category, image, collection_id, created_at, updated_at, description_ar,
           ingredients_ar, usage_ar, free_from_ar, old_price_ar, old_riyal, sizes, warning_ar,
           contents_ar, category_id
    FROM products
  `;
  await copyRows({
    table: "products",
    columns: [
      "id",
      "name",
      "price",
      "category",
      "image",
      "collection_id",
      "created_at",
      "updated_at",
      "description_ar",
      "ingredients_ar",
      "usage_ar",
      "free_from_ar",
      "old_price_ar",
      "old_riyal",
      "sizes",
      "warning_ar",
      "contents_ar",
      "category_id",
    ],
    rows: products,
    transform: (row) => ({
      ...row,
      sizes: row.sizes == null ? null : JSON.stringify(row.sizes),
    }),
  });

  const orders = await source`
    SELECT id, customer_id, items, total, status, shipping_address, tracking_number, carrier,
           shipped_at, created_at, updated_at, payment_proof_url, branch_key
    FROM orders
  `;
  await copyRows({
    table: "orders",
    columns: [
      "id",
      "customer_id",
      "items",
      "total",
      "status",
      "shipping_address",
      "tracking_number",
      "carrier",
      "shipped_at",
      "created_at",
      "updated_at",
      "payment_proof_url",
      "branch_key",
    ],
    rows: orders,
    transform: (row) => ({
      ...row,
      items: JSON.stringify(row.items ?? []),
      shipping_address: JSON.stringify(row.shipping_address ?? {}),
    }),
  });

  console.log("D1 migration complete.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
