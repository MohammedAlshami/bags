/**
 * Run seed using Mongoose. Loads .env.local from project root.
 * Usage: npm run seed   (from project root)
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
const SEED_CUSTOMER_PASSWORD = "customer";

async function main() {
  const mongoose = await import("mongoose");
  const { SEED_PRODUCTS, SEED_COLLECTIONS, SEED_LANDING } = await import("../lib/seed-data");
  const { parsePrice } = await import("../lib/cart");

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI not set in .env.local");
  }

  await mongoose.default.connect(uri);

  const Product = (await import("../models/Product")).default;
  const Landing = (await import("../models/Landing")).default;
  const Collection = (await import("../models/Collection")).default;
  const User = (await import("../models/User")).default;
  const Order = (await import("../models/Order")).default;
  const { hash } = await import("bcryptjs");

  console.log("Seeding carol_Bouwer...");
  await Product.deleteMany({});
  await Landing.deleteMany({});
  await Collection.deleteMany({});

  const collections = await Collection.insertMany(SEED_COLLECTIONS);
  const collectionBySlug = new Map<string, string>();
  collections.forEach((c: { slug: string; _id: unknown }) => {
    collectionBySlug.set(c.slug, String(c._id));
  });
  const productsWithCollection = SEED_PRODUCTS.map(
    (p: { collectionSlug: string; name: string; price: string; category: string; image: string; slug: string }) => {
      const collectionId = collectionBySlug.get(p.collectionSlug) ?? collectionBySlug.get("essentials");
      const { collectionSlug: _s, ...rest } = p;
      return { ...rest, collection: collectionId };
    }
  );
  const products = await Product.insertMany(productsWithCollection);
  const landing = await Landing.create(SEED_LANDING);
  console.log("Collections inserted:", collections.length, "Products inserted:", products.length);

  const existingAdmin = await User.findOne({ username: "admin" });
  if (!existingAdmin) {
    await User.create({
      username: "admin",
      password: await hash("admin", 10),
      role: "admin",
    });
    console.log("Admin user created (username: admin, password: admin)");
  }

  let seedCustomer = await User.findOne({ username: SEED_CUSTOMER_USERNAME, role: "customer" });
  if (!seedCustomer) {
    seedCustomer = await User.create({
      username: SEED_CUSTOMER_USERNAME,
      password: await hash(SEED_CUSTOMER_PASSWORD, 10),
      role: "customer",
      email: "customer@example.com",
      fullName: "Seed Customer",
      address: "123 Main Street\nCape Town 8001\nSouth Africa",
      phone: "+27 21 123 4567",
    });
    console.log("Customer created (username: customer, password: customer)");
  }

  const shippingAddress = {
    fullName: "Seed Customer",
    line1: "123 Main Street",
    line2: "",
    city: "Cape Town",
    state: "Western Cape",
    postCode: "8001",
    country: "South Africa",
  };
  const firstProduct = products[0];
  const priceNum = parsePrice(firstProduct.price);
  const openOrderExists = await Order.findOne({ status: "pending", customer: seedCustomer._id });
  if (!openOrderExists) {
    await Order.create({
      customer: seedCustomer._id,
      items: [
        { slug: firstProduct.slug, name: firstProduct.name, price: firstProduct.price, quantity: 1 },
      ],
      total: priceNum * 1,
      status: "pending",
      shippingAddress,
    });
    console.log("Open order created (1 item, shipping info added)");
  }

  const secondProduct = products[1];
  const shippedOrderExists = await Order.findOne({
    status: "shipped",
    customer: seedCustomer._id,
  });
  if (!shippedOrderExists && secondProduct) {
    await Order.create({
      customer: seedCustomer._id,
      items: [
        {
          slug: secondProduct.slug,
          name: secondProduct.name,
          price: secondProduct.price,
          quantity: 1,
        },
      ],
      total: parsePrice(secondProduct.price),
      status: "shipped",
      shippingAddress,
      trackingNumber: "CBW123456789ZA",
      carrier: "DHL",
      shippedAt: new Date(),
    });
    console.log("Shipped order created (with tracking)");
  }

  console.log("Done. Landing inserted:", landing ? 1 : 0);
  await mongoose.default.disconnect();
}

main().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});
