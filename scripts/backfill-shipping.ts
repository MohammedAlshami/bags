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
const SEED_ADDRESS = "123 Main Street\nCape Town 8001\nSouth Africa";
const SEED_PHONE = "+27 21 123 4567";
const SEED_SHIPPING_ADDRESS = {
  fullName: "Seed Customer",
  line1: "123 Main Street",
  line2: "",
  city: "Cape Town",
  state: "Western Cape",
  postCode: "8001",
  country: "South Africa",
};

async function main() {
  const mongoose = await import("mongoose");
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI not set in .env.local");

  await mongoose.default.connect(uri);
  const User = (await import("../models/User")).default;
  const Order = (await import("../models/Order")).default;

  const seedCustomer = await User.findOne({
    username: SEED_CUSTOMER_USERNAME,
    role: "customer",
  });
  if (!seedCustomer) {
    console.error("Seed customer not found. Run full seed first.");
    process.exit(1);
  }

  await User.updateOne(
    { _id: seedCustomer._id },
    { $set: { address: SEED_ADDRESS, phone: SEED_PHONE } }
  );
  console.log("Customer address and phone updated.");

  const orders = await Order.find({ customer: seedCustomer._id }).lean();
  let ordersUpdated = 0;
  for (const order of orders) {
    const o = order as { _id: unknown; shippingAddress?: { line1?: string; city?: string; country?: string }; status?: string; trackingNumber?: string; shippedAt?: Date };
    const needsShipping =
      !o.shippingAddress?.line1 && !o.shippingAddress?.city && !o.shippingAddress?.country;
    const needsTracking = o.status === "shipped" && !o.trackingNumber?.trim();
    const updates: Record<string, unknown> = {};
    if (needsShipping) updates.shippingAddress = SEED_SHIPPING_ADDRESS;
    if (needsTracking) {
      updates.trackingNumber = "CBW123456789ZA";
      updates.carrier = "DHL";
      if (!o.shippedAt) updates.shippedAt = new Date();
    }
    if (Object.keys(updates).length > 0) {
      await Order.updateOne({ _id: o._id }, { $set: updates });
      ordersUpdated += 1;
    }
  }
  console.log("Orders updated:", ordersUpdated);
  await mongoose.default.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
